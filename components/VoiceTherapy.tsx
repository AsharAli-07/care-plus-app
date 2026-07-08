import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ImageBackground,
  ScrollView, TouchableOpacity, Animated, StatusBar,
  Platform, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";
import {
  RealtimeVoiceSession,
  RealtimeTranscript,
} from "../utils/realtimeVoice";

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"idle" | "connecting" | "listening" | "thinking" | "speaking">("idle");
  const scrollRef = useRef<ScrollView>(null);
  const voiceSessionRef = useRef<RealtimeVoiceSession | null>(null);
  const exchangeCountRef = useRef(0);

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

  // ─── Start Realtime Voice Session ────────────────────────────────────────────
  const startSession = async () => {
    setIsConnecting(true);
    setCurrentPhase("connecting");

    const rtSession = new RealtimeVoiceSession({
      onConnected: () => {
        setIsConnecting(false);
        setSessionActive(true);
        setCurrentPhase("idle");

        // Send opening prompt to get Sera to greet the user
        const openingPrompt = session
          ? `Greet me for our booked voice session: "${session.title}". Mention you've checked my latest wellness data. Ask one warm opening question. Maximum 2 sentences.`
          : `Introduce yourself as Sera for a voice therapy session. Mention you have my health data ready. Ask one gentle question about how I'm feeling right now. Maximum 2 sentences.`;

        rtSession.sendTextMessage(openingPrompt);
      },

      onDisconnected: () => {
        setSessionActive(false);
        setIsListening(false);
        setIsSpeaking(false);
        setCurrentPhase("idle");
      },

      onSpeechStarted: () => {
        setIsListening(true);
        setIsSpeaking(false);
        setCurrentPhase("listening");
      },

      onSpeechStopped: () => {
        setIsListening(false);
        setIsThinking(true);
        setCurrentPhase("thinking");
      },

      onResponseStarted: () => {
        setIsThinking(false);
        setIsSpeaking(true);
        setCurrentPhase("speaking");
      },

      onResponseDone: () => {
        setIsSpeaking(false);
        setCurrentPhase("idle");
      },

      onTranscript: (t: RealtimeTranscript) => {
        const item: TranscriptItem = {
          id: Date.now().toString() + Math.random(),
          role: t.role === "user" ? "user" : "sera",
          text: t.text,
          time: t.timestamp,
        };
        setTranscript(prev => [...prev, item]);

        if (t.role === "user") {
          exchangeCountRef.current += 1;
        }

        scrollToEnd();
      },

      onError: (error: string) => {
        console.log("Realtime voice error:", error);
        setIsConnecting(false);
        setIsThinking(false);
        setCurrentPhase("idle");
      },
    });

    voiceSessionRef.current = rtSession;

    try {
      await rtSession.start(session);
    } catch (err: any) {
      setIsConnecting(false);
      setCurrentPhase("idle");
      Alert.alert(
        "Connection Failed",
        "Could not start voice session. Please check your connection and try again.",
        [{ text: "OK" }]
      );
    }
  };

  // ─── End Session ─────────────────────────────────────────────────────────────
  const endSession = async () => {
    if (voiceSessionRef.current) {
      voiceSessionRef.current.stop();
      voiceSessionRef.current = null;
    }

    if (transcript.length <= 1) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "End Voice Session?",
      "Your session will be saved.",
      [
        { text: "Continue", style: "cancel", onPress: () => {
          // Restart session if user wants to continue
          if (!sessionActive) startSession();
        }},
        {
          text: "End Session",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.post(
                `${BASE_URL}/therapy/voice-log`,
                {
                  session_id: session?.id || null,
                  exchange_count: exchangeCountRef.current,
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceSessionRef.current) {
        voiceSessionRef.current.stop();
        voiceSessionRef.current = null;
      }
    };
  }, []);

  const phaseLabel = {
    idle: sessionActive ? "Listening for your voice…" : "Tap Start to begin",
    connecting: "Connecting to Sera…",
    listening: "Listening…",
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
            <View style={[styles.liveDot, { backgroundColor: sessionActive ? "#4ade80" : isConnecting ? "#facc15" : "#444" }]} />
            <Text style={styles.liveText}>{sessionActive ? "Live" : isConnecting ? "Connecting" : "Ready"}</Text>
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
                  : isConnecting
                  ? ["rgba(250,204,21,0.2)", "rgba(40,30,0,0.85)"]
                  : ["rgba(255,255,255,0.06)", "rgba(5,15,9,0.9)"]
              }
              style={styles.orbInner}
            >
              {(isThinking || isConnecting) ? (
                <ActivityIndicator color={isConnecting ? "#facc15" : "#4ade80"} size="large" />
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

        {/* Controls */}
        <View style={styles.controls}>
          {!sessionActive && !isConnecting ? (
            <TouchableOpacity
              style={[styles.startBtn]}
              onPress={startSession}
            >
              <Text style={styles.startBtnText}>Start Session with Sera</Text>
            </TouchableOpacity>
          ) : isConnecting ? (
            <View style={[styles.startBtn, { opacity: 0.6 }]}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <View style={styles.activeControls}>
              {/* Status indicator */}
              <View style={[styles.controlBtn, { backgroundColor: "rgba(74,222,128,0.15)" }]}>
                <Ionicons
                  name={isListening ? "mic" : isSpeaking ? "volume-high" : "radio-outline"}
                  size={18}
                  color={isListening ? "#4ade80" : isSpeaking ? "#38bdf8" : "#888"}
                />
                <Text style={styles.controlBtnLabel}>
                  {isListening ? "You" : isSpeaking ? "Sera" : "Ready"}
                </Text>
              </View>

              {/* Live indicator orb */}
              <View style={styles.micBtn}>
                <View style={[styles.liveIndicator, {
                  backgroundColor: isListening ? "#4ade80" : isSpeaking ? "#38bdf8" : "#555"
                }]} />
                <Text style={styles.controlBtnLabel2}>
                  {isListening ? "Listening" : isSpeaking ? "Speaking" : "Idle"}
                </Text>
              </View>

              {/* End session */}
              <TouchableOpacity style={[styles.controlBtn, { borderColor: "rgba(255,107,107,0.3)", backgroundColor: "#f8383842" }]} onPress={endSession}>
                <Text style={[styles.controlBtnLabel, { color: "#fff" }]}>End</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    paddingTop: 40,
    paddingBottom: 15, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: "rgba(74,222,128,0.1)", gap: 12,
  },
  backBtn: { },
  headerTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 15 },
  headerSub: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 10, marginTop: 1 },
  liveChip: {
    marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { color: "#aaa", fontFamily: "Poppins_400Regular", fontSize: 10 },

  orbContainer: { alignItems: "center", justifyContent: "center", height: 320, },
  orbOuter: { width: 136, height: 136, borderRadius: 68, alignItems: "center", justifyContent: "center" },
  orbInner: {
    width: 136, height: 136, borderRadius: 68,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)",
  },

  phaseLabel: {
    color: "#888", fontFamily: "Poppins_400Regular", fontSize: 12,
    textAlign: "center", marginBottom: 14, letterSpacing: 0.4, paddingHorizontal: 30,
     top: 30,
  },

  controls: {
    paddingHorizontal: 20,
  },
  startBtn: {
    backgroundColor: "#004927ff",
    padding: 10,
    alignItems: "center",
    width: "100%",
    top: 30,
    borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
    shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, borderRadius: 12
  },
  startBtnText: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 12 },

  activeControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", top: 30 },
  controlBtn: {
    width: 55, height: 55, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  controlBtnLabel: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 10 },
  controlBtnLabel2: { color: "#aaa", fontFamily: "Poppins_400Regular", fontSize: 9, marginTop: 4 },
  micBtn: {
    width: 55, height: 55, borderRadius: 39,
    backgroundColor: "#004927", alignItems: "center", justifyContent: "center",
    shadowColor: "#004927", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 10,   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
  },
  liveIndicator: {
    width: 12, height: 12, borderRadius: 6,
  },
});