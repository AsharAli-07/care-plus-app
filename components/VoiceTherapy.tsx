import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ImageBackground,
  ScrollView, TouchableOpacity, Animated, StatusBar,
  Platform, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

// ─── Call Sera voice via backend — all user data loaded server-side ───────────
const callSeraVoice = async (
  messages: { role: string; content: string }[],
  session: any,
  token: string
): Promise<string> => {
  const response = await fetch(`${BASE_URL}/api/therapy/voice-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, session }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || "Server error");
  }
  const data = await response.json();
  return data.reply;
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface TranscriptItem {
  id: string;
  role: "user" | "sera";
  text: string;
  time: string;
}

// ─── Orbital ring animation ────────────────────────────────────────────────────
const OrbitalRing = ({ size, delay, active, color = "#38bdf8" }: {
  size: number; delay: number; active: boolean; color?: string;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.65, duration: 1500, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.4, duration: 280, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 1220, useNativeDriver: true }),
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
        position: "absolute", width: size, height: size,
        borderRadius: size / 2, borderWidth: 1.5, borderColor: color,
        transform: [{ scale }], opacity,
      }}
    />
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const VoiceTherapy = ({ navigation, route }: any) => {
  const { session } = route.params || {};
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [simulatedInput, setSimulatedInput] = useState("");
  const timerRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const tokenRef = useRef<string>("");

  useEffect(() => {
    AsyncStorage.getItem("token").then(t => { tokenRef.current = t || ""; });
    return () => {
      Speech.stop();
      clearInterval(timerRef.current);
    };
  }, []);

  // Orb animations
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbGlow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, { toValue: isListening ? 1.14 : 1.04, duration: 1900, useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1, duration: 1900, useNativeDriver: true }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, [isListening]);

  useEffect(() => {
    Animated.timing(orbGlow, { toValue: isSpeaking ? 1 : 0, duration: 400, useNativeDriver: true }).start();
  }, [isSpeaking]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  // TTS helper
  const speakResponse = useCallback(async (text: string): Promise<void> => {
    // Clean text for speech (remove any markdown artifacts)
    const clean = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\n/g, " ").trim();
    setIsSpeaking(true);
    setCurrentPhase("speaking");
    return new Promise((resolve) => {
      Speech.speak(clean, {
        language: "en-US",
        pitch: 1.05,
        rate: 0.85,
        onDone: () => { setIsSpeaking(false); setCurrentPhase("idle"); resolve(); },
        onError: () => { setIsSpeaking(false); setCurrentPhase("idle"); resolve(); },
      });
    });
  }, []);

  // Start session
  const startSession = async () => {
    setSessionActive(true);
    setCurrentPhase("thinking");
    setIsThinking(true);
    try {
      const openingPrompt = session
        ? `Greet the user for their booked voice session: "${session.title}". Mention you've checked their latest wellness data. Ask one warm opening question. Maximum 2 sentences, spoken style only.`
        : `Introduce yourself as Sera for a voice therapy session. Mention you have their health data ready. Ask one gentle question about how they're feeling right now. Maximum 2 sentences, spoken style only.`;

      const reply = await callSeraVoice(
        [{ role: "user", content: openingPrompt }],
        session,
        tokenRef.current
      );

      const item: TranscriptItem = {
        id: "0", role: "sera", text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setTranscript([item]);
      setConversationHistory([{ role: "assistant", content: reply }]);
      setIsThinking(false);
      scrollToEnd();
      await speakResponse(reply);
    } catch {
      setIsThinking(false);
      const fallback = "Hi, I'm Sera. I'm here with you. How are you feeling right now?";
      setTranscript([{
        id: "0", role: "sera", text: fallback,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
      setConversationHistory([{ role: "assistant", content: fallback }]);
      await speakResponse(fallback);
    }
  };

  // Simulate listening start (replace with real STT when integrating expo-speech-recognition)
  const startListening = () => {
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); }
    setIsListening(true);
    setCurrentPhase("listening");
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  // Process user speech (text comes from STT or simulated input)
  const processUserSpeech = async (userText: string) => {
    clearInterval(timerRef.current);
    setIsListening(false);
    setCurrentPhase("thinking");
    setIsThinking(true);

    const trimmed = userText.trim();
    if (!trimmed) {
      setIsThinking(false);
      setCurrentPhase("idle");
      return;
    }

    const userItem: TranscriptItem = {
      id: Date.now().toString(), role: "user", text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTranscript(prev => [...prev, userItem]);

    const updatedHistory = [...conversationHistory, { role: "user", content: trimmed }];
    setConversationHistory(updatedHistory);
    scrollToEnd();

    try {
      const reply = await callSeraVoice(updatedHistory, session, tokenRef.current);
      const seraItem: TranscriptItem = {
        id: (Date.now() + 1).toString(), role: "sera", text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setTranscript(prev => [...prev, seraItem]);
      setConversationHistory(prev => [...prev, { role: "assistant", content: reply }]);
      setIsThinking(false);
      scrollToEnd();
      await speakResponse(reply);
    } catch {
      setIsThinking(false);
      setCurrentPhase("idle");
      const errText = "I had a little trouble. Please try speaking again.";
      await speakResponse(errText);
    }
  };

  const stopListening = () => {
    // With real STT: this is where you'd stop recording and get the transcript
    // For demo, we use the simulatedInput
    const text = simulatedInput || "I've been feeling quite stressed lately and I'm not sleeping well.";
    setSimulatedInput("");
    processUserSpeech(text);
  };

  const endSession = async () => {
    Speech.stop();
    clearInterval(timerRef.current);

    if (transcript.length <= 1) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "End Voice Session?",
      "Your session will be saved.",
      [
        { text: "Continue", style: "cancel" },
        {
          text: "End Session",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.post(
                `${BASE_URL}/therapy/voice-log`,
                {
                  session_id: session?.id || null,
                  exchange_count: Math.floor(transcript.length / 2),
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch { /* silent */ }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const phaseLabel = {
    idle: sessionActive ? "Tap mic to speak" : "Tap Start to begin",
    listening: `Listening… ${recordingTime}s — tap Stop when done`,
    thinking: "Sera is thinking…",
    speaking: "Sera is speaking…",
  }[currentPhase];

  const orbColor = isSpeaking ? "#38bdf8" : isListening ? "#4ade80" : "rgba(255,255,255,0.12)";
  const isActive = isSpeaking || isListening;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: '100%', width: '100%' }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.5)", "rgba(5,15,10,0.97)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* Header */}
        <BlurView intensity={50} tint="dark" style={styles.header}>
          <TouchableOpacity onPress={endSession} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Voice Session</Text>
            <Text style={styles.headerSub}>
              {session ? `"${session.title}"` : "with Sera · AI Companion"}
            </Text>
          </View>
          <View style={styles.liveChip}>
            <View style={[styles.liveDot, { backgroundColor: sessionActive ? "#4ade80" : "#444" }]} />
            <Text style={styles.liveText}>{sessionActive ? "Live" : "Ready"}</Text>
          </View>
        </BlurView>

        {/* Central orb */}
        <View style={styles.orbContainer}>
          <OrbitalRing size={180} delay={0}   active={isActive} color={isSpeaking ? "#38bdf8" : "#4ade80"} />
          <OrbitalRing size={225} delay={300} active={isActive} color={isSpeaking ? "#38bdf8" : "#4ade80"} />
          <OrbitalRing size={270} delay={600} active={isSpeaking} color="#38bdf8" />

          <Animated.View style={[styles.orbOuter, { transform: [{ scale: orbScale }] }]}>
            <LinearGradient
              colors={
                isSpeaking
                  ? ["rgba(56,189,248,0.35)", "rgba(0,40,65,0.85)"]
                  : isListening
                  ? ["rgba(74,222,128,0.35)", "rgba(0,73,39,0.85)"]
                  : ["rgba(255,255,255,0.06)", "rgba(5,15,9,0.9)"]
              }
              style={styles.orbInner}
            >
              {isThinking ? (
                <ActivityIndicator color="#4ade80" size="large" />
              ) : (
                <Ionicons
                  name={isSpeaking ? "volume-high-outline" : isListening ? "mic" : "mic-outline"}
                  size={44}
                  color={isSpeaking ? "#38bdf8" : isListening ? "#4ade80" : "#555"}
                />
              )}
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Phase label */}
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>

        {/* Transcript */}
        {/* <ScrollView
          ref={scrollRef}
          style={styles.transcript}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {transcript.length === 0 && (
            <View style={styles.emptyTranscript}>
              <Text style={styles.emptyTranscriptText}>
                Conversation will appear here. Sera knows your wellness data and will personalise every response.
              </Text>
            </View>
          )}
          {transcript.map((item) => (
            <View
              key={item.id}
              style={[styles.transcriptItem, item.role === "user" && styles.transcriptUser]}
            >
              <Text style={styles.transcriptRole}>
                {item.role === "sera" ? "✨ Sera" : "You"} · {item.time}
              </Text>
              <Text style={styles.transcriptText}>{item.text}</Text>
            </View>
          ))}
        </ScrollView> */}

        {/* Controls */}
        <BlurView intensity={50} tint="dark" style={styles.controls}>
          {!sessionActive ? (
            <TouchableOpacity
              style={[styles.startBtn, isThinking && { opacity: 0.6 }]}
              onPress={startSession}
              disabled={isThinking}
            >
              {isThinking ? (
                <ActivityIndicator color="#050f09" />
              ) : (
                <>
                
                  <Text style={styles.startBtnText}>Start Session with Sera</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              {/* Mute / pause Sera */}
              <TouchableOpacity
                style={[styles.controlBtn, {backgroundColor: "#0ab5ff54"}]}
                onPress={() => {
                  Speech.stop();
                  setIsSpeaking(false);
                  setCurrentPhase("idle");
                }}
              >
               
                <Text style={styles.controlBtnLabel}>Pause</Text>
              </TouchableOpacity>

              {/* Main mic */}
              <TouchableOpacity
                style={[
                  styles.micBtn,
                  isListening && styles.micBtnActive,
                  (isThinking || isSpeaking) && { opacity: 0.35 },
                ]}
                onPress={isListening ? stopListening : startListening}
                disabled={isThinking || isSpeaking}
              >
                <Ionicons
                  name={isListening ? "stop-outline" : "mic-outline"}
                  size={32}
                  color={"#fff"}
                />
              </TouchableOpacity>

              {/* End session */}
              <TouchableOpacity style={[styles.controlBtn, { borderColor: "rgba(255,107,107,0.3)", backgroundColor: "#f8383842" }]} onPress={endSession}>
    
                <Text style={[styles.controlBtnLabel, { color: "#fff" }]}>End</Text>
              </TouchableOpacity>
            </View>
          )}
        </BlurView>

        {/* STT placeholder notice */}
        {sessionActive && currentPhase === "idle" && (
          <BlurView intensity={35} tint="dark" style={styles.sttNotice}>
            <Ionicons name="information-circle-outline" size={13} color="#555" />
            <Text style={styles.sttNoticeText}>
              Real-time STT: Integrate expo-speech-recognition or Groq Whisper for live transcription.
              Demo mode uses a sample phrase when you tap Stop.
            </Text>
          </BlurView>
        )}
      </ImageBackground>
    </View>
  );
};

export default VoiceTherapy;

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
  },
  glowBottom: {
    position: "absolute", bottom: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 54 : 10,
    paddingBottom: 10, paddingHorizontal: 10,
    borderBottomWidth: 1, borderBottomColor: "rgba(74,222,128,0.1)", gap: 12,
  },
  backBtn: { },
  headerTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 15 },
  headerSub: { color: "#666", fontFamily: "Poppins_400Regular", fontSize: 10, marginTop: 1 },
  liveChip: {
    marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { color: "#aaa", fontFamily: "Poppins_400Regular", fontSize: 10 },

  orbContainer: { alignItems: "center", justifyContent: "center", height: 420, marginTop: 6 },
  orbOuter: { width: 136, height: 136, borderRadius: 68, alignItems: "center", justifyContent: "center" },
  orbInner: {
    width: 136, height: 136, borderRadius: 68,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)",
  },

  phaseLabel: {
    color: "#888", fontFamily: "Poppins_400Regular", fontSize: 12,
    textAlign: "center", marginBottom: 14, letterSpacing: 0.4, paddingHorizontal: 30,
  },

  transcript: { flex: 1, maxHeight: 190 },
  emptyTranscript: {
    padding: 16, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", margin: 4,
  },
  emptyTranscriptText: { color: "#444", fontFamily: "Poppins_400Regular", fontSize: 11, textAlign: "center", lineHeight: 17 },
  transcriptItem: {
    marginBottom: 10, padding: 12, borderRadius: 12,
    backgroundColor: "rgba(56,189,248,0.05)",
    borderWidth: 1, borderColor: "rgba(56,189,248,0.12)",
  },
  transcriptUser: {
    backgroundColor: "rgba(74,222,128,0.05)",
    borderColor: "rgba(74,222,128,0.12)",
  },
  transcriptRole: {
    color: "#555", fontFamily: "Poppins_400Regular",
    fontSize: 9, marginBottom: 5, letterSpacing: 0.4,
  },
  transcriptText: { color: "#ddd", fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 19 },

  controls: {
    paddingHorizontal: 24, paddingVertical: 18,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    borderTopWidth: 1, borderTopColor: "rgba(74,222,128,0.1)",
  },
  startBtn: {
    backgroundColor: "#004927ff",
  padding: 10,
  alignItems: "center",
  width: "100%",
  marginTop: 15,
   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, borderRadius: 50
  },
  startBtnText: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 14 },

  activeControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  controlBtn: {
    width: 58, height: 58, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", 
  },
  controlBtnLabel: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 9 },
  micBtn: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: "#004927", alignItems: "center", justifyContent: "center",
    shadowColor: "#004927", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 10, borderColor: "rgba(74,222,128,0.3)"
  },
  micBtnActive: {
   borderColor: "rgba(255,107,107,0.3)", backgroundColor: "#f8383842", shadowColor: "#f8383842"
  },

  sttNotice: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.04)",
  },
  sttNoticeText: { color: "#444", fontFamily: "Poppins_400Regular", fontSize: 9, flex: 1, lineHeight: 14 },
});