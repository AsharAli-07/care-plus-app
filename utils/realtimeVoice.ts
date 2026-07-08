/**
 * realtimeVoice.ts — OpenAI Realtime API WebRTC helper for VoiceTherapy
 *
 * Manages the full lifecycle of a WebRTC voice session:
 *   1. Fetch ephemeral key from our server (with Sera persona baked in)
 *   2. Establish WebRTC peer connection to OpenAI
 *   3. Stream user microphone audio ↔ receive AI spoken audio
 *   4. Expose transcript events for UI updates
 */

import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from "react-native-webrtc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface RealtimeTranscript {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface RealtimeSessionCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onSpeechStarted?: () => void;             // user started speaking
  onSpeechStopped?: () => void;             // user stopped speaking
  onResponseStarted?: () => void;           // model started speaking
  onResponseDone?: () => void;              // model finished speaking
  onTranscript?: (t: RealtimeTranscript) => void;
  onError?: (error: string) => void;
}

// ─── Session Manager ───────────────────────────────────────────────────────────
export class RealtimeVoiceSession {
  private pc: any = null;
  private dc: any = null;
  private localStream: MediaStream | null = null;
  private callbacks: RealtimeSessionCallbacks;
  private _isConnected = false;

  constructor(callbacks: RealtimeSessionCallbacks = {}) {
    this.callbacks = callbacks;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Start a new voice session:
   *   1. Get ephemeral key from our backend (which injects Sera persona + user data)
   *   2. Create WebRTC peer connection
   *   3. Connect to OpenAI Realtime API
   */
  async start(session?: { id?: number; title?: string }): Promise<void> {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      // 1. Get ephemeral key from our server
      const tokenRes = await fetch(`${BASE_URL}/api/therapy/realtime-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to get session token");
      }

      const { value: ephemeralKey } = await tokenRes.json();
      if (!ephemeralKey) throw new Error("No ephemeral key received");

      // 2. Create WebRTC peer connection
      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Handle remote audio track (model's voice)
      this.pc.ontrack = (event: any) => {
        // The remote stream is the model's spoken audio —
        // react-native-webrtc plays it automatically via the earpiece/speaker
      };

      // 3. Capture microphone
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.localStream = stream as MediaStream;

      // Add local audio track to the peer connection
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        this.pc.addTrack(audioTrack, this.localStream);
      }

      // 4. Set up data channel for events (transcript, session control)
      this.dc = this.pc.createDataChannel("oai-events");

      this.dc.onopen = () => {
        this._isConnected = true;
        this.callbacks.onConnected?.();
      };

      this.dc.onclose = () => {
        this._isConnected = false;
        this.callbacks.onDisconnected?.();
      };

      this.dc.onmessage = (event: any) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerEvent(data);
        } catch {
          // ignore malformed events
        }
      };

      // 5. Create SDP offer and connect to OpenAI
      const offer = await this.pc.createOffer({});
      await this.pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
        }
      );

      if (!sdpResponse.ok) {
        throw new Error("Failed to establish WebRTC connection with OpenAI");
      }

      const answerSdp = await sdpResponse.text();
      const answer = new RTCSessionDescription({
        type: "answer",
        sdp: answerSdp,
      });
      await this.pc.setRemoteDescription(answer);
    } catch (error: any) {
      this.callbacks.onError?.(error?.message || "Connection failed");
      this.stop();
      throw error;
    }
  }

  /**
   * Handle events from the OpenAI Realtime API data channel
   */
  private handleServerEvent(event: any) {
    switch (event.type) {
      // User speech detection
      case "input_audio_buffer.speech_started":
        this.callbacks.onSpeechStarted?.();
        break;

      case "input_audio_buffer.speech_stopped":
        this.callbacks.onSpeechStopped?.();
        break;

      // Model response lifecycle
      case "response.audio.started":
      case "response.created":
        this.callbacks.onResponseStarted?.();
        break;

      case "response.audio.done":
      case "response.done":
        this.callbacks.onResponseDone?.();
        break;

      // User transcript (from input audio transcription)
      case "conversation.item.input_audio_transcription.completed":
        if (event.transcript) {
          this.callbacks.onTranscript?.({
            role: "user",
            text: event.transcript,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
        break;

      // Model transcript (text of what the model said)
      case "response.audio_transcript.done":
        if (event.transcript) {
          this.callbacks.onTranscript?.({
            role: "assistant",
            text: event.transcript,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
        break;

      case "error":
        this.callbacks.onError?.(
          event.error?.message || "Realtime API error"
        );
        break;

      default:
        // Ignore other events (session.created, session.updated, etc.)
        break;
    }
  }

  /**
   * Send a text message via the data channel (for initial greeting, etc.)
   */
  sendTextMessage(text: string): void {
    if (!this.dc || this.dc.readyState !== "open") return;

    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    };
    this.dc.send(JSON.stringify(event));

    // Trigger a response
    this.dc.send(JSON.stringify({ type: "response.create" }));
  }

  /**
   * Stop the session and clean up all resources
   */
  stop(): void {
    this._isConnected = false;

    if (this.dc) {
      try { this.dc.close(); } catch {}
      this.dc = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => {
        try { track.stop(); } catch {}
      });
      this.localStream = null;
    }

    if (this.pc) {
      try { this.pc.close(); } catch {}
      this.pc = null;
    }

    this.callbacks.onDisconnected?.();
  }
}
