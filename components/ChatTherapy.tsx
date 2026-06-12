import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ImageBackground, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, StatusBar, Animated, ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

// ─── Call Sera via your backend (never call Anthropic directly from app) ───────
const callSera = async (
  messages: { role: string; content: string }[],
  session: any,
  token: string
): Promise<string> => {
  const response = await fetch(`${BASE_URL}/api/therapy/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, session }),
  });
  if (!response.ok) throw new Error("Server error");
  const data = await response.json();
  return data.reply;
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Typing indicator ──────────────────────────────────────────────────────────
const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay(800),
        ])
      );
    const a1 = anim(dot1, 0); const a2 = anim(dot2, 200); const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);
  return (
    <View style={styles.typingWrap}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
      ))}
    </View>
  );
};

// ─── Message bubble ────────────────────────────────────────────────────────────
const Bubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.seraAvatar}>
          <Ionicons name="sparkles" size={14} color="#4ade80" />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{msg.content}</Text>
        <Text style={styles.bubbleTime}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </View>
  );
};

// ─── Quick prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "I'm feeling anxious",
  "Help me breathe",
  "I can't sleep",
  "I feel overwhelmed",
  "I need motivation",
];

// ─── Main Screen ───────────────────────────────────────────────────────────────
const ChatTherapy = ({ navigation, route }: any) => {
  const { user, wellness, sensor, latestMood, session } = route.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const tokenRef = useRef<string>("");

  useEffect(() => {
    AsyncStorage.getItem("token").then(t => { tokenRef.current = t || ""; });
  }, []);

  // Initial greeting from Sera
  useEffect(() => {
    const greet = async () => {
      // Wait briefly so token loads first
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(true);
      try {
        const openingLine = session
          ? `Say hello to ${user?.name?.split(" ")[0] || "the user"} and acknowledge their upcoming session "${session.title}" with ${session.therapist_name}. Then ask how they are feeling today in preparation. Keep it warm, 2 sentences.`
          : `Introduce yourself as Sera and greet ${user?.privacy_mode ? "the user" : user?.name?.split(" ")[0] || "the user"} warmly. Reference their current wellness data subtly if available, and ask one gentle open question. Keep it to 2–3 sentences.`;
        const reply = await callSera(
          [{ role: "user", content: openingLine }],
          session,
          tokenRef.current
        );
        setMessages([{ id: "0", role: "assistant", content: reply, timestamp: new Date() }]);
      } catch {
        setMessages([{
          id: "0",
          role: "assistant",
          content: "Hi, I'm Sera 🌿 I'm here to support you. How are you feeling right now?",
          timestamp: new Date(),
        }]);
      } finally {
        setIsThinking(false);
      }
    };
    greet();
  }, []);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isThinking) return;
    setInput("");
    Keyboard.dismiss();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsThinking(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const reply = await callSera(history, session, tokenRef.current);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I had trouble responding. Please try again. I'm here for you. 💚",
        timestamp: new Date(),
      }]);
    } finally {
      setIsThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const endSession = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (messages.length > 1) {
        await axios.post(`${BASE_URL}/therapy/chat-log`, {
          session_id: session?.id || null,
          message_count: messages.length,
          summary: messages[messages.length - 1]?.content?.slice(0, 200),
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch { /* silently fail */ }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require("../assets/images/home-bg.jpg")} style={{ flex: 1 }} resizeMode="cover">
        <LinearGradient colors={["rgba(0,20,10,0.6)", "rgba(5,15,10,0.95)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.glowTop} />

        {/* Header */}
        <BlurView intensity={60} tint="dark" style={styles.chatHeader}>
          <TouchableOpacity onPress={endSession} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.seraInfo}>
            <View style={styles.seraAvatarLarge}>
              <Ionicons name="sparkles" size={18} color="#4ade80" />
            </View>
            <View>
              <Text style={styles.seraName}>Sera · AI Therapist</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Always available</Text>
              </View>
            </View>
          </View>
          {session && (
            <View style={styles.sessionPill}>
              <Text style={styles.sessionPillText}>Session</Text>
            </View>
          )}
        </BlurView>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
            {isThinking && (
              <View style={styles.bubbleRow}>
                <View style={styles.seraAvatar}>
                  <Ionicons name="sparkles" size={14} color="#4ade80" />
                </View>
                <View style={styles.bubbleAssistant}>
                  <TypingDots />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick prompts — shown only before user sends first message */}
          {messages.length <= 1 && !isThinking && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickRow}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {QUICK_PROMPTS.map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => sendMessage(p)}
                  style={styles.quickPromptChip}
                >
                  <Text style={styles.quickPromptText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Input bar */}
          <BlurView intensity={70} tint="dark" style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Share what's on your mind…"
              placeholderTextColor="#555"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              onPress={() => sendMessage()}
              disabled={!input.trim() || isThinking}
              style={[styles.sendBtn, (!input.trim() || isThinking) && { opacity: 0.4 }]}
            >
              {isThinking
                ? <ActivityIndicator size="small" color="#050f09" />
                : <Ionicons name="send" size={18} color="#050f09" />
              }
            </TouchableOpacity>
          </BlurView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default ChatTherapy;

const styles = StyleSheet.create({
  glowTop: { position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none" },
  chatHeader: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "ios" ? 54 : 40, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "rgba(74,222,128,0.1)", gap: 12 },
  backBtn: { padding: 4 },
  seraInfo: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  seraAvatarLarge: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(74,222,128,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  seraName: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 13 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ade80" },
  onlineText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 10 },
  sessionPill: { backgroundColor: "rgba(74,222,128,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: "rgba(74,222,128,0.25)" },
  sessionPillText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 10 },
  messageList: { flex: 1 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8 },
  bubbleRowUser: { flexDirection: "row-reverse" },
  seraAvatar: { width: 28, height: 28, borderRadius: 9, backgroundColor: "rgba(74,222,128,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.2)" },
  bubble: { maxWidth: "75%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAssistant: { backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(74,222,128,0.15)", borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: "#004927", borderBottomRightRadius: 4 },
  bubbleText: { color: "#e2e8f0", fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
  bubbleTextUser: { color: "#fff" },
  bubbleTime: { color: "#666", fontFamily: "Poppins_400Regular", fontSize: 9, marginTop: 4, textAlign: "right" },
  typingWrap: { flexDirection: "row", alignItems: "center", paddingVertical: 4, gap: 4 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#4ade80" },
  quickRow: { maxHeight: 50, marginBottom: 8 },
  quickPromptChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(74,222,128,0.3)", backgroundColor: "rgba(0,73,39,0.2)" },
  quickPromptText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 11 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 14, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 28 : 14, borderTopWidth: 1, borderTopColor: "rgba(74,222,128,0.1)", gap: 10 },
  textInput: { flex: 1, color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 13, maxHeight: 100, paddingVertical: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#4ade80", alignItems: "center", justifyContent: "center" },
});