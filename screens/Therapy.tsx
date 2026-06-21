import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ImageBackground, Image,
  ScrollView, TouchableOpacity, Animated, StatusBar,
  Dimensions, RefreshControl, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "../api";
import BookSession from "../components/BookSession";
import ChatTherapy from "../components/ChatTherapy";
import VoiceTherapy from "../components/VoiceTherapy";

const { width } = Dimensions.get("window");

// ─── Dummy sensor data (replace with BLE integration later) ───────────────────
const DUMMY_SENSOR: SensorData = {
  heartRate: 78,
  spo2: 98,
  temperature: 36.6,
  hrv: 52,
  motionStatus: "still",  // "still" | "active" | "fall_detected"
  lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SensorData {
  heartRate: number;
  spo2: number;
  temperature: number;
  hrv: number;
  motionStatus: "still" | "active" | "fall_detected";
  lastUpdated: string;
}

interface WellnessLog {
  sleep_hours: number;
  water_intake: number;
  meditation_minutes: number;
  stress_level: number;
  anxiety_level: number;
  energy_level: number;
  score: number;
}

interface MoodEntry {
  mood_emoji: string;
  mood_text: string;
  created_at: string;
}

interface BookedSession {
  id: number;
  title: string;
  therapist_name: string;
  session_date: string;
  session_time: string;
  session_type: "chat" | "voice";
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  profile_image: string;
  privacy_mode: boolean;
}

// ─── Pulse ring for voice orb ──────────────────────────────────────────────────
const PulseRing = ({ delay = 0, color = "rgba(56,189,248,0.3)" }: { delay?: number; color?: string }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.9, duration: 1800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.pulseRing, { backgroundColor: color, transform: [{ scale }], opacity }]} />;
};

// ─── Wellness chip ─────────────────────────────────────────────────────────────
const Chip = ({ icon, label, value, alert }: { icon: string; label: string; value: string; alert?: boolean }) => (
  <BlurView intensity={50} tint="dark" style={[styles.chip, alert && styles.chipAlert]}>
    <Ionicons name={icon as any} size={15} color={alert ? "#ff6b6b" : "#4ade80"} />
    <Text style={[styles.chipValue, alert && { color: "#ff6b6b" }]}>{value}</Text>
    <Text style={styles.chipLabel}>{label}</Text>
  </BlurView>
);

// ─── Session Card ──────────────────────────────────────────────────────────────
const SessionCard = ({ session, onPress }: { session: BookedSession; onPress: () => void }) => {
  const isUpcoming = session.status === "upcoming";
  const isVoice = session.session_type === "voice";
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView intensity={40} tint="dark" style={styles.sessionCard}>
        <View style={[styles.sessionTypeIcon, { backgroundColor: isVoice ? "rgba(56,189,248,0.12)" : "rgba(74,222,128,0.12)" }]}>
          <Ionicons name={isVoice ? "mic-outline" : "chatbubble-ellipses-outline"} size={18} color={isVoice ? "#38bdf8" : "#4ade80"} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionSub}>
            {session.therapist_name} · {session.session_date} at {session.session_time}
          </Text>
        </View>
        <View style={[styles.sessionBadge, { backgroundColor: isUpcoming ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.07)" }]}>
          <Text style={[styles.sessionBadgeText, { color: isUpcoming ? "#4ade80" : "#888" }]}>
            {isUpcoming ? "Upcoming" : session.status === "completed" ? "Done" : "Cancelled"}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

// ─── Empty sessions state ──────────────────────────────────────────────────────
const EmptySessions = ({ onBook }: { onBook: () => void }) => (
  <BlurView intensity={35} tint="dark" style={styles.emptyBox}>
    <Ionicons name="calendar-outline" size={32} color="#4ade80" style={{ opacity: 0.5, marginBottom: 10 }} />
    <Text style={styles.emptyTitle}>No sessions yet</Text>
    <Text style={styles.emptySub}>Book your first therapy session to get personalised support.</Text>
    <TouchableOpacity onPress={onBook} style={styles.emptyBtn}>
      <Text style={styles.emptyBtnText}>Book a Session</Text>
    </TouchableOpacity>
  </BlurView>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
const Therapy = ({ navigation }: any) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [wellness, setWellness] = useState<WellnessLog | null>(null);
  const [latestMood, setLatestMood] = useState<MoodEntry | null>(null);
  const [sessions, setSessions] = useState<BookedSession[]>([]);
  const [sensor] = useState<SensorData>(DUMMY_SENSOR);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const breatheScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheScale, { toValue: 1.03, duration: 3200, useNativeDriver: true }),
        Animated.timing(breatheScale, { toValue: 1, duration: 3200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, wellnessRes, moodRes, sessionsRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/me`, { headers }),
        axios.get(`${BASE_URL}/wellness/today`, { headers }),
        axios.get(`${BASE_URL}/moods/latest`, { headers }),
        axios.get(`${BASE_URL}/therapy/sessions`, { headers }),
      ]);

      if (userRes.status === "fulfilled") setUser(userRes.value.data);
      if (wellnessRes.status === "fulfilled") setWellness(wellnessRes.value.data);
      if (moodRes.status === "fulfilled") setLatestMood(moodRes.value.data);
      if (sessionsRes.status === "fulfilled") setSessions(sessionsRes.value.data || []);
    } catch (err) {
      console.log("Therapy fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  // ── Contextual AI greeting derived from real data + sensor ──
  const getGreeting = () => {
    if (sensor.motionStatus === "fall_detected") return "⚠️ A fall was detected. Are you okay?";
    if (sensor.heartRate > 100) return "Your heart rate is elevated. Let's breathe together.";
    if (latestMood?.mood_text === "Very Sad" || latestMood?.mood_text === "Sad")
      return `You logged ${latestMood.mood_emoji} ${latestMood.mood_text} today. I'm here for you.`;
    if (wellness && wellness.sleep_hours < 6) return "You didn't sleep much. Want to talk about what's on your mind?";
    if (wellness && wellness.stress_level >= 4) return "Your stress seems high today. Let's work through it together.";
    if (wellness && wellness.water_intake < 1.5) return "Stay hydrated! I'm here whenever you need to talk.";
    if (wellness && wellness.score >= 80) return "You're doing great today! Let's keep that momentum going.";
    return "How are you feeling right now? I'm here for you.";
  };

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming").slice(0, 3);
  const allSessions = sessions.slice(0, 3);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4ade80" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require("../assets/images/home-bg.jpg")} style={{ flex: 1 }} resizeMode="cover">
        <LinearGradient colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.93)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.glowTop} />

        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>YOUR THERAPY SPACE</Text>
              <Text style={styles.headerTitle}>
                {user?.privacy_mode ? "Hello 👋" : `Hello, ${user?.name?.split(" ")[0] || "…"} 👋`}
              </Text>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate("BookSession")}>
              <Ionicons name="add" size={16} color="#050f09" />
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>

          {/* ── AI greeting ── */}
          <BlurView intensity={50} tint="dark" style={styles.greetingBanner}>
            <View style={styles.greetingDot} />
            <Text style={styles.greetingText}>{getGreeting()}</Text>
          </BlurView>

          {/* ── Wellness snapshot ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>WELLNESS SNAPSHOT</Text>
              <Text style={styles.sensorTime}>Sensor · {sensor.lastUpdated}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {latestMood && (
                  <Chip icon="radio-button-off-outline" label="Mood" value={`${latestMood.mood_text}`}
                    alert={latestMood.mood_text === "Very Sad" || latestMood.mood_text === "Sad"} />
                )}
                <Chip icon="heart-outline" label="HR" value={`${sensor.heartRate} bpm`} alert={sensor.heartRate > 100} />
                <Chip icon="water-outline" label="SpO₂" value={`${sensor.spo2}%`} alert={sensor.spo2 < 94} />
                <Chip icon="thermometer-outline" label="Temp" value={`${sensor.temperature}°C`} alert={sensor.temperature > 37.5} />
                <Chip icon="fitness-outline" label="HRV" value={`${sensor.hrv}ms`} alert={sensor.hrv < 40} />
                {wellness && (
                  <>
                    <Chip icon="moon-outline" label="Sleep" value={`${wellness.sleep_hours}h`} alert={wellness.sleep_hours < 6} />
                    <Chip icon="leaf-outline" label="Mindful" value={`${wellness.meditation_minutes}m`} />
                    <Chip icon="flash-outline" label="Energy" value={`${wellness.energy_level}/5`} alert={wellness.energy_level <= 2} />
                  </>
                )}
                <Chip
                  icon={sensor.motionStatus === "fall_detected" ? "warning-outline" : sensor.motionStatus === "active" ? "walk-outline" : "body-outline"}
                  label="Motion"
                  value={sensor.motionStatus === "fall_detected" ? "Fall!" : sensor.motionStatus === "active" ? "Active" : "Still"}
                  alert={sensor.motionStatus === "fall_detected"}
                />
              </View>
            </ScrollView>
          </View>

          {/* ── Two therapy entry cards ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>START A SESSION</Text>
            <View style={styles.therapyRow}>

              {/* Chat Therapy */}
              <Animated.View style={[{ flex: 1 }, { transform: [{ scale: breatheScale }] }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("ChatTherapy", { user, wellness, sensor, latestMood })}
                  style={[styles.therapyCardTouch , {marginTop: 2}]}
                >
                <LinearGradient colors={["rgba(0,73,39,0.75)", "rgba(0,40,20,0.95)"]} style={styles.therapyCard}>
                    <View style={styles.therapyIconWrap}>
                      <Ionicons name="chatbubble-ellipses-outline" size={26} color="#4ade80" />
                    </View>
                    <Text style={styles.therapyCardTitle}>AI Chat{"\n"}Therapy</Text>
                    <Text style={styles.therapyCardSub}>Text-based, private, always available</Text>
                    <View style={styles.therapyTag}>
                      <Text style={styles.therapyTagText}>Mood-aware</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Voice Therapy */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate("VoiceTherapy", { user, wellness, sensor, latestMood })}
                style={[styles.therapyCardTouch, { flex: 1 }]}
              >
                <LinearGradient colors={["rgba(0,40,65,0.75)", "rgba(0,20,45,0.95)"]} style={styles.therapyCard}>
                  <View style={styles.voiceOrbWrap}>
                    <PulseRing delay={0} />
                    <PulseRing delay={600} />
                    <View style={styles.voiceOrb}>
                      <Ionicons name="mic-outline" size={24} color="#38bdf8" />
                    </View>
                  </View>
                  <Text style={styles.therapyCardTitle}>Voice AI{"\n"}Therapy</Text>
                  <Text style={styles.therapyCardSub}>Speak freely — guided by your health data</Text>
                  <View style={[styles.therapyTag, { backgroundColor: "rgba(56,189,248,0.12)" }]}>
                    <Text style={[styles.therapyTagText, { color: "#38bdf8" }]}>Biometric-aware</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </View>

          {/* ── Quick Relief ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>QUICK RELIEF</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View style={{ flexDirection: "row", gap: 15, marginTop: 15 }}>
    {[
      { label: "Breathe",        tab: "breathing" },
      { label: "Eye",          tab: "eye"       },
      { label: "Focus",    tab: "focus"   },
      { label: "Color",      tab: "color"     },
      { label: "Memory",      tab: "memory"    },
      { label: "Stroop",         tab: "stroop"    },
      { label: "Sequence",       tab: "sequence"  },
      { label: "Tap Stars",      tab: "tapstar"   },
      { label: "Reverse",   tab: "reverse"  },
      { label: "Gratitude",       tab: "gratitude" },
    ].map((item) => (
      <TouchableOpacity
        key={item.tab}
        onPress={() => navigation.navigate("Meditation", { tab: item.tab })}
        style={styles.quickChip}
      >
   
        <Text style={styles.quickChipText}>{item.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
</ScrollView>
          </View>

          {/* ── Sessions ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel]}>YOUR SESSIONS</Text>
              {sessions.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate("AllSessions", { sessions })}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              )}
            </View>

            {sessions.length === 0 ? (
              <EmptySessions onBook={() => navigation.navigate("BookSession")} />
            ) : (
              allSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onPress={() =>
                    s.session_type === "voice"
                      ? navigation.navigate("VoiceTherapy", { session: s, user, wellness, sensor })
                      : navigation.navigate("ChatTherapy", { session: s, user, wellness, sensor })
                  }
                />
              ))
            )}
          </View>

          <View style={{ height: 110 }} />
        </Animated.ScrollView>
      </ImageBackground>
    </View>
  );
};

export default Therapy;

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: "#050f09", alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  glowTop: { position: "absolute", top: -90, left: -30, width: 200, height: 200, borderRadius: 140, backgroundColor: "rgba(0, 73, 39, 0.73)", pointerEvents: "none" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  eyebrow: { fontSize: 10, color: "#4ade80", fontFamily: "Poppins_400Regular", letterSpacing: 1.4, marginBottom: 2 },
  headerTitle: { fontSize: 20, color: "#fff", fontFamily: "Poppins_500Medium" },
  bookBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#4ade80", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, gap: 4 },
  bookBtnText: { color: "#050f09", fontFamily: "Poppins_500Medium", fontSize: 12 },

  greetingBanner: { flexDirection: "row", alignItems: "center", borderRadius: 14, overflow: "hidden", padding: 14, marginBottom: 25, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", gap: 10 },
  greetingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80" },
  greetingText: { color: "#e2e8f0", fontFamily: "Poppins_400Regular", fontSize: 13, flex: 1, lineHeight: 20 },

  section: { marginBottom: 25 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionLabel: { fontSize: 10, color: "#4ade80", fontFamily: "Poppins_400Regular", letterSpacing: 1.5 },
  sensorTime: { fontSize: 9, color: "#666", fontFamily: "Poppins_400Regular" },
  seeAll: { fontSize: 11, color: "#4ade80", fontFamily: "Poppins_400Regular" },

  chipRow: { flexDirection: "row", gap: 15},
  chip: { alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 13, borderRadius: 13, overflow: "hidden", borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", gap: 3, minWidth: 68 },
  chipAlert: { borderColor: "rgba(255,107,107,0.4)" },
  chipValue: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 11 },
  chipLabel: { color: "#888", fontFamily: "Poppins_400Regular", fontSize: 9, letterSpacing: 0.4 },

  therapyRow: { flexDirection: "row", gap: 15, marginTop: 15 },
  therapyCardTouch: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(74,222,128,0.22)" },
  therapyCard: { padding: 15, minHeight: 195, justifyContent: "space-between", height: 220 },
  therapyIconWrap: { width: 46, height: 46, borderRadius: 13, backgroundColor: "rgba(74,222,128,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  therapyCardTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 14, lineHeight: 21, marginBottom: 5 },
  therapyCardSub: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 10, lineHeight: 15, flex: 1, marginBottom: 10 },
  therapyTag: { alignSelf: "flex-start", backgroundColor: "rgba(74,222,128,0.12)", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  therapyTagText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 9, letterSpacing: 0.5 },

  voiceOrbWrap: { width: 46, height: 46, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  pulseRing: { position: "absolute", width: 46, height: 46, borderRadius: 23 },
  voiceOrb: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(56,189,248,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(56,189,248,0.4)" },

  quickChip: { alignItems: "center",justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 50, borderWidth: 1, borderColor: "rgba(74,222,128,0.25)", backgroundColor: "rgba(0,73,39,0.18)" },
  quickChipDanger: { borderColor: "rgba(255,107,107,0.3)", backgroundColor: "rgba(255,50,50,0.08)" },
  quickChipText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 11 },

  sessionCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, overflow: "hidden", padding: 13, marginBottom: 10, borderWidth: 1, borderColor: "rgba(74,222,128,0.18)" },
  sessionTypeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sessionTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 12, marginBottom: 2 },
  sessionSub: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 10 },
  sessionBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  sessionBadgeText: { fontFamily: "Poppins_400Regular", fontSize: 9 },

  emptyBox: { borderRadius: 16, overflow: "hidden", padding: 28, alignItems: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.15)" },
  emptyTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 15, marginBottom: 6 },
  emptySub: { color: "#888", fontFamily: "Poppins_400Regular", fontSize: 12, textAlign: "center", lineHeight: 18, marginBottom: 18 },
  emptyBtn: { backgroundColor: "rgba(74,222,128,0.15)", paddingVertical: 10, paddingHorizontal: 22, borderRadius: 10, borderWidth: 1, borderColor: "rgba(74,222,128,0.35)" },
  emptyBtnText: { color: "#4ade80", fontFamily: "Poppins_500Medium", fontSize: 12 },
});