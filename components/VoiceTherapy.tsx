import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity,
  StatusBar, Animated, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

// ─── Anthropic API ─────────────────────────────────────────────────────────────
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

const callClaude = async (messages: { role: string; content: string }[], system: string) => {
  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "I'm here with you. Take a breath.";
};

// ─── System prompt ─────────────────────────────────────────────────────────────
const buildVoiceSystemPrompt = (user: any, wellness: any, sensor: any, mood: any, session: any) => {
  const name = user?.privacy_mode ? "the user" : user?.name?.split(" ")[0] || "friend";
  const w = wellness;
  const s = sensor;
  return `You are Sera, a warm and calming AI voice therapist inside the Care Plus mental health app.

USER DATA:
- Name: ${name}
- Mood: ${mood ? `${mood.mood_emoji} ${mood.mood_text}` : "Not logged"}
- Wellness today: ${w ? `Sleep ${w.sleep_hours}h, Water ${w.water_intake}L, Meditation ${w.meditation_minutes}m, Stress ${w.stress_level}/5, Energy ${w.energy_level}/5` : "No log"}
- Biometrics: ${s ? `HR ${s.heartRate}bpm, SpO₂ ${s.spo2}%, Temp ${s.temperature}°C, HRV ${s.hrv}ms, Motion: ${s.motionStatus}` : "No sensor"}
${session ? `- Booked session: "${session.title}" with ${session.therapist_name}` : "- General voice session"}

VOICE THERAPY RULES:
1. Speak in short, calm sentences — this is VOICE, not text. Maximum 3 sentences per response.
2. Use breathing cues naturally: "breathe in… and out" when appropriate.
3. If HR > 100, immediately guide a 4-7-8 breathing exercise.
4. If stress > 3, use grounding: "Name 5 things you can see right now."
5. If mood is sad/very sad, validate before any techniques.
6. Never use markdown, bullet points, or lists — pure spoken language only.
7. Speak as if you're sitting right next to the person.
8. End each response with a question or a gentle instruction to keep them engaged.
9. If crisis detected, say: "Please call emergency services or a crisis line right away. I'm with you."`;
};

// ─── Transcript item ───────────────────────────────────────────────────────────
interface TranscriptItem {
  id: string;
  role: "user" | "sera";
  text: string;
  time: string;
}

// ─── Orbital ring animation ────────────────────────────────────────────────────
const OrbitalRing = ({ size, delay, active }: { size: number; delay: number; active: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.6, duration: 1400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.45, duration: 300, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 1100, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [active]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: "#38bdf8",
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const VoiceTherapy = ({ navigation, route }: any) => {
  const { user, wellness, sensor, latestMood, session } = route.params || {};
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [simulatedInput, setSimulatedInput] = useState("");
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const systemPrompt = buildVoiceSystemPrompt(user, wellness, sensor, latestMood, session);

  // Breathing animation for orb
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, { toValue: isListening ? 1.12 : 1.03, duration: 1800, useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, [isListening]);

  useEffect(() => {
    if (isSpeaking) {
      Animated.timing(orbGlow, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      Animated.timing(orbGlow, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }
  }, [isSpeaking]);

  // Speak a response via TTS
  const speakResponse = useCallback(async (text: string) => {
    setIsSpeaking(true);
    setCurrentPhase("speaking");
    return new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.88,
        onDone: () => { setIsSpeaking(false); setCurrentPhase("idle"); resolve(); },
        onError: () => { setIsSpeaking(false); setCurrentPhase("idle"); resolve(); },
      });
    });
  }, []);

  // Start the session with an opening greeting
  const startSession = async () => {
    setSessionActive(true);
    setCurrentPhase("thinking");
    setIsThinking(true);
    try {
      const opening = await callClaude(
        [{ role: "user", content: `Greet ${user?.privacy_mode ? "the user" : user?.name?.split(" ")[0] || "the user"} warmly for a voice therapy session. Be brief and calming — 2 sentences only. Ask one gentle open question.` }],
        systemPrompt
      );
      const item: TranscriptItem = {
        id: "0",
        role: "sera",
        text: opening,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setTranscript([item]);
      setConversationHistory([{ role: "assistant", content: opening }]);
      setIsThinking(false);
      await speakResponse(opening);
    } catch {
      setIsThinking(false);
      setSessionActive(false);
    }
  };

  // ─── IMPORTANT: Expo Speech-to-Text requires expo-speech-recognition or a paid STT API.
  // Here we simulate with a text input fallback that mimics voice input.
  // Replace startRecording/stopRecording with actual STT when integrating.
  const startRecording = async () => {
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); }
    setIsListening(true);
    setCurrentPhase("listening");
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopRecordingAndProcess = async (manualText?: string) => {
    clearInterval(timerRef.current);
    setIsListening(false);
    setCurrentPhase("thinking");
    setIsThinking(true);

    // In production: replace manualText with actual STT transcript
    const userText = manualText || simulatedInput || "I'm feeling a bit anxious today.";
    setSimulatedInput("");

    const userItem: TranscriptItem = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTranscript((prev) => [...prev, userItem]);

    const updatedHistory = [...conversationHistory, { role: "user", content: userText }];
    setConversationHistory(updatedHistory);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const reply = await callClaude(updatedHistory, systemPrompt);
      const seraItem: TranscriptItem = {
        id: (Date.now() + 1).toString(),
        role: "sera",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setTranscript((prev) => [...prev, seraItem]);
      setConversationHistory((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      await speakResponse(reply);
    } catch {
      setIsThinking(false);
      setCurrentPhase("idle");
    }
  };

  const endSession = async () => {
    Speech.stop();
    clearInterval(timerRef.current);
    try {
      const token = await AsyncStorage.getItem("token");
      if (transcript.length > 1) {
        await axios.post(`${BASE_URL}/therapy/voice-log`, {
          session_id: session?.id || null,
          exchange_count: Math.floor(transcript.length / 2),
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch { /* silently fail */ }
    navigation.goBack();
  };

  const phaseLabel = {
    idle: sessionActive ? "Tap mic to speak" : "Tap Start to begin",
    listening: `Listening… ${recordingTime}s`,
    thinking: "Sera is thinking…",
    speaking: "Sera is speaking…",
  }[currentPhase];

  const orbColor = isSpeaking ? "#38bdf8" : isListening ? "#4ade80" : "rgba(255,255,255,0.15)";

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require("../assets/images/home-bg.jpg")} style={{ flex: 1 }} resizeMode="cover">
        <LinearGradient colors={["rgba(0,20,10,0.5)", "rgba(5,15,10,0.97)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* ── Header ── */}
        <BlurView intensity={55} tint="dark" style={styles.header}>
          <TouchableOpacity onPress={endSession} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Voice Therapy</Text>
            <Text style={styles.headerSub}>
              {session ? `Session with ${session.therapist_name}` : "with Sera · AI Companion"}
            </Text>
          </View>
          <View style={styles.liveChip}>
            <View style={[styles.liveDot, { backgroundColor: sessionActive ? "#4ade80" : "#666" }]} />
            <Text style={styles.liveText}>{sessionActive ? "Live" : "Idle"}</Text>
          </View>
        </BlurView>

        {/* ── Central orb ── */}
        <View style={styles.orbContainer}>
          {/* Orbital rings */}
          <OrbitalRing size={180} delay={0} active={isSpeaking || isListening} />
          <OrbitalRing size={220} delay={300} active={isSpeaking || isListening} />
          <OrbitalRing size={260} delay={600} active={isSpeaking} />

          {/* Main orb */}
          <Animated.View style={[styles.orbOuter, { transform: [{ scale: orbScale }] }]}>
            <LinearGradient
              colors={
                isSpeaking
                  ? ["rgba(56,189,248,0.3)", "rgba(0,40,65,0.8)"]
                  : isListening
                  ? ["rgba(74,222,128,0.3)", "rgba(0,73,39,0.8)"]
                  : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
              }
              style={styles.orbInner}
            >
              {isThinking ? (
                <ActivityIndicator color="#4ade80" size="large" />
              ) : (
                <Ionicons
                  name={isSpeaking ? "volume-high-outline" : isListening ? "mic" : "mic-outline"}
                  size={42}
                  color={isSpeaking ? "#38bdf8" : isListening ? "#4ade80" : "#666"}
                />
              )}
            </LinearGradient>
          </Animated.View>
        </View>

        {/* ── Phase label ── */}
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>

        {/* ── Transcript ── */}
        <ScrollView
          ref={scrollRef}
          style={styles.transcript}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {transcript.map((item) => (
            <View key={item.id} style={[styles.transcriptItem, item.role === "user" && styles.transcriptUser]}>
              <Text style={styles.transcriptRole}>{item.role === "sera" ? "Sera" : "You"} · {item.time}</Text>
              <Text style={styles.transcriptText}>{item.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Controls ── */}
        <BlurView intensity={60} tint="dark" style={styles.controls}>
          {!sessionActive ? (
            <TouchableOpacity style={styles.startBtn} onPress={startSession} disabled={isThinking}>
              {isThinking ? (
                <ActivityIndicator color="#050f09" />
              ) : (
                <>
                  <Ionicons name="play" size={18} color="#050f09" />
                  <Text style={styles.startBtnText}>Start Session</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              {/* Stop speaking */}
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => { Speech.stop(); setIsSpeaking(false); setCurrentPhase("idle"); }}
              >
                <Ionicons name="pause-outline" size={22} color="#fff" />
              </TouchableOpacity>

              {/* Main mic button */}
              <TouchableOpacity
                style={[
                  styles.micBtn,
                  isListening && styles.micBtnActive,
                  (isThinking || isSpeaking) && { opacity: 0.4 },
                ]}
                onPress={isListening ? () => stopRecordingAndProcess() : startRecording}
                disabled={isThinking || isSpeaking}
              >
                <Ionicons name={isListening ? "stop" : "mic"} size={28} color={isListening ? "#fff" : "#050f09"} />
              </TouchableOpacity>

              {/* End session */}
              <TouchableOpacity style={styles.controlBtn} onPress={endSession}>
                <Ionicons name="close-outline" size={22} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          )}
        </BlurView>

        {/* ── STT notice (remove when real STT is integrated) ── */}
        {sessionActive && !isListening && currentPhase === "idle" && (
          <BlurView intensity={40} tint="dark" style={styles.sttNotice}>
            <Ionicons name="information-circle-outline" size={14} color="#888" />
            <Text style={styles.sttNoticeText}>STT placeholder — tap mic, then submit a sample phrase below for demo</Text>
          </BlurView>
        )}
      </ImageBackground>
    </View>
  );
};

export default VoiceTherapy;

const styles = StyleSheet.create({
  glowTop: { position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none" },
  glowBottom: { position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,40,65,0.35)", pointerEvents: "none" },

  header: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "ios" ? 54 : 40, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "rgba(74,222,128,0.1)", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 15 },
  headerSub: { color: "#888", fontFamily: "Poppins_400Regular", fontSize: 10 },
  liveChip: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { color: "#aaa", fontFamily: "Poppins_400Regular", fontSize: 10 },

  orbContainer: { alignItems: "center", justifyContent: "center", height: 280, marginTop: 10 },
  orbOuter: { width: 130, height: 130, borderRadius: 65, alignItems: "center", justifyContent: "center" },
  orbInner: { width: 130, height: 130, borderRadius: 65, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)" },

  phaseLabel: { color: "#aaa", fontFamily: "Poppins_400Regular", fontSize: 12, textAlign: "center", marginBottom: 12, letterSpacing: 0.5 },

  transcript: { flex: 1, maxHeight: 200 },
  transcriptItem: { marginBottom: 10, padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(56,189,248,0.12)" },
  transcriptUser: { backgroundColor: "rgba(0,73,39,0.2)", borderColor: "rgba(74,222,128,0.12)" },
  transcriptRole: { color: "#666", fontFamily: "Poppins_400Regular", fontSize: 9, marginBottom: 4, letterSpacing: 0.5 },
  transcriptText: { color: "#ddd", fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18 },

  controls: { paddingHorizontal: 24, paddingVertical: 18, paddingBottom: Platform.OS === "ios" ? 38 : 18, borderTopWidth: 1, borderTopColor: "rgba(74,222,128,0.1)" },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#4ade80", borderRadius: 14, paddingVertical: 14, gap: 8 },
  startBtnText: { color: "#050f09", fontFamily: "Poppins_500Medium", fontSize: 15 },

  activeControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  controlBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  micBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#4ade80", alignItems: "center", justifyContent: "center", shadowColor: "#4ade80", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  micBtnActive: { backgroundColor: "#ff6b6b", shadowColor: "#ff6b6b" },

  sttNotice: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.04)" },
  sttNoticeText: { color: "#555", fontFamily: "Poppins_400Regular", fontSize: 9, flex: 1 },
});