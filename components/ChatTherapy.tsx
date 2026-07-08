import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ImageBackground, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, StatusBar, Animated, ActivityIndicator,
  Keyboard, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

// ─── Call Sera via backend — all data context handled server-side ──────────────
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
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || "Server error");
  }
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
          Animated.timing(dot, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 380, useNativeDriver: true }),
          Animated.delay(700),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 180);
    const a3 = anim(dot3, 360);
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
          <Ionicons name="sparkles" size={10} color="#4ade80" />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{msg.content}</Text>
        <Text style={[styles.bubbleTime, isUser && { color: "rgba(255,255,255,0.4)" }]}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </View>
  );
};

// ─── Quick prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "How am I doing today?",
  "What's my wellness score?",
  "I'm feeling anxious",
  "Help me breathe",
  "I can't sleep",
  "Check my heart rate",
  "I feel overwhelmed",
  "Show my streak",
];

// ─── Main Screen ───────────────────────────────────────────────────────────────
const ChatTherapy = ({ navigation, route }: any) => {
  const { session } = route.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const tokenRef = useRef<string>("");

  useEffect(() => {
    AsyncStorage.getItem("token").then(t => { tokenRef.current = t || ""; });
  }, []);

  // Initial greeting
  useEffect(() => {
    const greet = async () => {
      await new Promise(r => setTimeout(r, 400));
      setIsThinking(true);
      try {
        const openingPrompt = session
          ? `You are greeting the user for their booked session: "${session.title}". Acknowledge the session topic warmly, mention you've reviewed their latest wellness data, and ask one gentle opening question. Keep it to 2-3 sentences.`
          : `Introduce yourself as Sera. Mention you're ready to support them. Ask one caring open question about how they're feeling. Keep it to 2-3 warm sentences.`;

        const reply = await callSera(
          [{ role: "user", content: openingPrompt }],
          session,
          tokenRef.current
        );
        setMessages([{
          id: "0",
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        }]);
        setSessionStarted(true);
      } catch {
        setMessages([{
          id: "0",
          role: "assistant",
          content: "Hi, I'm Sera 🌿 I'm here to support you and I will give you personalised help. How are you feeling right now?",
          timestamp: new Date(),
        }]);
        setSessionStarted(true);
      } finally {
        setIsThinking(false);
      }
    };
    greet();
  }, []);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
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
    scrollToEnd();

    try {
      const history = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const reply = await callSera(history, session, tokenRef.current);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I had a little trouble responding. Please try again — I'm still here for you. 💚",
        timestamp: new Date(),
      }]);
    } finally {
      setIsThinking(false);
      scrollToEnd();
    }
  };

  const endSession = async () => {
    if (messages.length <= 1) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "End Session?",
      "This will save your session and return to therapy.",
      [
        { text: "Continue Talking", style: "cancel" },
        {
          text: "End Session",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.post(
                `${BASE_URL}/therapy/chat-log`,
                {
                  session_id: session?.id || null,
                  message_count: messages.length,
                  summary: messages[messages.length - 1]?.content?.slice(0, 200),
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch { /* silently fail */ }
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: '100%', width: '100%' }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.6)", "rgba(5,15,10,0.95)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />

        {/* Header */}
<View style={styles.chatHeader}>
  <View style={{flexDirection: 'row'}}>
  <TouchableOpacity onPress={endSession} style={styles.backBtn}>
    <Ionicons name="chevron-back" size={20} color="#fff" />
  </TouchableOpacity>

  <View style={styles.seraInfo}>
    <View style={styles.seraAvatarLarge}>
      <Ionicons name="sparkles" size={14} color="#4ade80" />
    </View>
    <View style={{gap: 10}}>
      
      <View >
        <Text style={styles.seraName}>Sera · AI Companion</Text>
        <View style={styles.onlineRow}>
        <View style={styles.onlineDot} />
        <Text style={styles.onlineText}>
          Data-aware · Always available
        </Text>
        </View>
      </View>
 {session && (
    <View style={styles.sessionPill}>
      <Ionicons name="bookmark-outline" size={10} color="#4ade80" />
      <Text style={styles.sessionPillText}>{session.title}</Text>
    </View>
  )}
    </View>
  </View>

</View>
 
</View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 15, paddingBottom: 15 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
          >
            {/* Privacy mode notice */}
            <View style={styles.privacyNotice}>
              <Ionicons name="lock-closed-outline" size={10} color="#aaa" />
              <Text style={styles.privacyNoticeText}>
                Sera has access to your wellness data. If Privacy Mode is on, sensitive data is hidden.
              </Text>
            </View>

            {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}

            {isThinking && (
              <View style={styles.bubbleRow}>
                <View style={styles.seraAvatar}>
                  <Ionicons name="sparkles" size={10} color="#4ade80" />
                </View>
                <View style={styles.bubbleAssistant}>
                  <TypingDots />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick prompts — shown after first greeting */}
          {messages.length === 1 && !isThinking && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickRow}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
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
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Share what's on your mind…"
              placeholderTextColor="#444"
              multiline
              maxLength={500}
              returnKeyType="default"
            />
            <TouchableOpacity
              onPress={() => sendMessage()}
              disabled={!input.trim() || isThinking}
              style={[styles.sendBtn, (!input.trim() || isThinking) && { opacity: 0.4 }]}
            >
              {isThinking
                ? <ActivityIndicator size={14} color="#4ade80" />
                : <Ionicons name="send" size={14} color="#4ade80" />
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default ChatTherapy;

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
  },
chatHeader: {
  paddingTop: 40,
  paddingBottom: 15,
  paddingHorizontal: 10,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(74,222,128,0.1)",
 
  justifyContent: "center",
  gap: 10,

 backgroundColor: "rgba(0, 26, 17, 0.53)",
},

backBtn: {


  height: 34,
  width: 34,
  justifyContent: "center",
  alignItems: "center",
},

seraInfo: {
  flexDirection: "row",

  gap: 10,
},

seraAvatarLarge: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "rgba(74,222,128,0.12)",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "rgba(74,222,128,0.3)",
},
  seraName: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 13 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ade80" },
  onlineText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 9 },
  sessionPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(74,222,128,0.1)",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)",
   
  },
  sessionPillText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 9 },

  messageList: { flex: 1 },

  privacyNotice: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8, padding: 8, marginBottom: 15,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  privacyNoticeText: { color: "#aaa", fontFamily: "Poppins_400Regular", fontSize: 9, flex: 1 },

  bubbleRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8, },
  bubbleRowUser: { flexDirection: "row-reverse" },
  seraAvatar: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(74,222,128,0.12)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.2)",
  },
  bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAssistant: {
     backgroundColor: "rgba(0, 26, 17, 0.53)",
  shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
  },
  bubbleUser: { backgroundColor: "#004927", borderBottomRightRadius: 4, shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, },
  bubbleText: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 20 },
  bubbleTextUser: { color: "#fff" },
  bubbleTime: { color: "#555", fontFamily: "Poppins_400Regular", fontSize: 9, marginTop: 5, textAlign: "right" },

  typingWrap: { flexDirection: "row", alignItems: "center", padding: 6, gap: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ade80" },

  quickRow: { maxHeight: 35, marginBottom: 8 },
  quickPromptChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22,
    borderWidth: 1, borderColor: "rgba(74,222,128,0.3)",
    backgroundColor: "rgba(0,73,39,0.2)",
  },
  quickPromptText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 10},

  inputBar: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 20, paddingTop: 15, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: "rgba(74,222,128,0.1)", gap: 10, 
  },
  textInput: {
    flex: 1, color: "#fff", fontFamily: "Poppins_400Regular",
    fontSize: 12, height: 50
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(74,222,128,0.1)",
    alignItems: "center", justifyContent: "center",
    borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,
    alignSelf: 'baseline'
  },
});