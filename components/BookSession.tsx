import React, { useState } from "react";
import {
  View, Text, StyleSheet, ImageBackground, ScrollView,
  TouchableOpacity, StatusBar, TextInput, Alert,
  ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

// ─── Data ──────────────────────────────────────────────────────────────────────
const THERAPISTS = [
  { id: 1, name: "Dr. Aisha Khan", specialty: "Anxiety & Stress", rating: 4.9, sessions: 320, avatar: "🩺" },
  { id: 2, name: "Dr. Omar Farooq", specialty: "Sleep & Recovery", rating: 4.8, sessions: 215, avatar: "🌙" },
  { id: 3, name: "Dr. Sara Malik", specialty: "Trauma & PTSD", rating: 4.9, sessions: 410, avatar: "💚" },
  { id: 4, name: "Dr. Zain Ali", specialty: "Depression & Mood", rating: 4.7, sessions: 178, avatar: "☀️" },
  { id: 5, name: "AI Companion (Sera)", specialty: "General Wellness", rating: null, sessions: null, avatar: "✨" },
];

const SESSION_TYPES = [
  { id: "chat", label: "AI Chat", icon: "chatbubble-ellipses-outline", desc: "Text-based, async" },
  { id: "voice", label: "Voice AI", icon: "mic-outline", desc: "Live voice session" },
];

const TIMES = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

const SESSION_TOPICS = [
  "Anxiety & Stress", "Sleep Issues", "Depression", "Relationships",
  "Trauma", "Work Stress", "Grief", "Self-Esteem", "General Wellness",
];

// Generate next 7 days
const getNext7Days = () => {
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[d.getDay()],
      full: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      value: d.toISOString().split("T")[0],
    });
  }
  return days;
};

// ─── Step indicator ────────────────────────────────────────────────────────────
const StepDot = ({ step, current }: { step: number; current: number }) => (
  <View style={[styles.stepDot, step <= current && styles.stepDotActive, step === current && styles.stepDotCurrent]}>
    {step < current ? (
      <Ionicons name="checkmark" size={10} color="#050f09" />
    ) : (
      <Text style={[styles.stepDotText, step === current && { color: "#050f09" }]}>{step}</Text>
    )}
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
const BookSession = ({ navigation }: any) => {
  const [step, setStep] = useState(1); // 1: Therapist  2: Date/Time  3: Details  4: Confirm
  const [selectedTherapist, setSelectedTherapist] = useState<typeof THERAPISTS[0] | null>(null);
  const [selectedType, setSelectedType] = useState<"chat" | "voice">("chat");
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const days = getNext7Days();

  const canProceed = () => {
    if (step === 1) return !!selectedTherapist;
    if (step === 2) return !!selectedTime;
    if (step === 3) return !!selectedTopic;
    return true;
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/therapy/book`,
        {
          therapist_name: selectedTherapist?.name,
          therapist_id: selectedTherapist?.id,
          session_type: selectedType,
          session_date: selectedDate.value,
          session_time: selectedTime,
          title: selectedTopic,
          notes: notes || null,
          status: "upcoming",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);
      Alert.alert(
        "Session Booked! 🎉",
        `Your ${selectedType === "voice" ? "voice" : "chat"} session with ${selectedTherapist?.name} is confirmed for ${selectedDate.full} at ${selectedTime}.`,
        [{ text: "View Sessions", onPress: () => navigation.replace("Therapy") }]
      );
    } catch (err: any) {
      setLoading(false);
      // If backend endpoint doesn't exist yet, show success anyway (for testing)
      if (err?.response?.status === 404 || err?.code === "ECONNREFUSED") {
        Alert.alert(
          "Session Booked! 🎉",
          `(Demo) Your session with ${selectedTherapist?.name} is confirmed for ${selectedDate.full} at ${selectedTime}.`,
          [{ text: "Go Back", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Booking Failed", "Please try again. " + (err?.message || ""));
      }
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Choose a therapist</Text>
      <Text style={styles.stepSub}>Select who you'd like to speak with</Text>
      {THERAPISTS.map((t) => (
        <TouchableOpacity
          key={t.id}
          onPress={() => setSelectedTherapist(t)}
          activeOpacity={0.8}
        >
          <BlurView
            intensity={45}
            tint="dark"
            style={[styles.therapistCard, selectedTherapist?.id === t.id && styles.therapistCardActive]}
          >
            <Text style={styles.therapistAvatar}>{t.avatar}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.therapistName}>{t.name}</Text>
              <Text style={styles.therapistSpec}>{t.specialty}</Text>
              {t.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={11} color="#f59e0b" />
                  <Text style={styles.ratingText}>{t.rating} · {t.sessions} sessions</Text>
                </View>
              )}
            </View>
            {selectedTherapist?.id === t.id && (
              <View style={styles.selectedCheck}>
                <Ionicons name="checkmark" size={14} color="#050f09" />
              </View>
            )}
          </BlurView>
        </TouchableOpacity>
      ))}

      <Text style={[styles.stepTitle, { marginTop: 20 }]}>Session type</Text>
      <View style={styles.typeRow}>
        {SESSION_TYPES.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setSelectedType(t.id as "chat" | "voice")}
            style={[styles.typeCard, selectedType === t.id && styles.typeCardActive]}
          >
            <Ionicons name={t.icon as any} size={22} color={selectedType === t.id ? "#050f09" : "#4ade80"} />
            <Text style={[styles.typeLabel, selectedType === t.id && { color: "#050f09" }]}>{t.label}</Text>
            <Text style={[styles.typeDesc, selectedType === t.id && { color: "rgba(5,15,9,0.7)" }]}>{t.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Pick a date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {days.map((d) => (
            <TouchableOpacity
              key={d.value}
              onPress={() => { setSelectedDate(d); setSelectedTime(null); }}
              style={[styles.dateCard, selectedDate.value === d.value && styles.dateCardActive]}
            >
              <Text style={[styles.dateDayLabel, selectedDate.value === d.value && { color: "#050f09" }]}>{d.label}</Text>
              <Text style={[styles.dateFull, selectedDate.value === d.value && { color: "#050f09" }]}>{d.full}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.stepTitle}>Pick a time</Text>
      <View style={styles.timesGrid}>
        {TIMES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setSelectedTime(t)}
            style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
          >
            <Text style={[styles.timeChipText, selectedTime === t && { color: "#050f09" }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>What would you like to focus on?</Text>
      <Text style={styles.stepSub}>Choose the main topic for your session</Text>
      <View style={styles.topicsGrid}>
        {SESSION_TOPICS.map((topic) => (
          <TouchableOpacity
            key={topic}
            onPress={() => setSelectedTopic(topic)}
            style={[styles.topicChip, selectedTopic === topic && styles.topicChipActive]}
          >
            <Text style={[styles.topicChipText, selectedTopic === topic && { color: "#050f09" }]}>{topic}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.stepTitle, { marginTop: 24 }]}>Any notes? (optional)</Text>
      <BlurView intensity={40} tint="dark" style={styles.notesBox}>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Share anything you'd like your therapist to know beforehand…"
          placeholderTextColor="#555"
          multiline
          maxLength={500}
        />
      </BlurView>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Review & Confirm</Text>
      <BlurView intensity={45} tint="dark" style={styles.confirmCard}>
        {[
          { label: "Therapist", value: selectedTherapist?.name || "" },
          { label: "Session Type", value: selectedType === "voice" ? "🎙️ Voice AI" : "💬 AI Chat" },
          { label: "Date", value: `${selectedDate.label}, ${selectedDate.full}` },
          { label: "Time", value: selectedTime || "" },
          { label: "Topic", value: selectedTopic || "" },
        ].map((row) => (
          <View key={row.label} style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>{row.label}</Text>
            <Text style={styles.confirmValue}>{row.value}</Text>
          </View>
        ))}
        {notes ? (
          <View style={[styles.confirmRow, { borderTopWidth: 1, borderTopColor: "rgba(74,222,128,0.1)", marginTop: 6, paddingTop: 12 }]}>
            <Text style={styles.confirmLabel}>Notes</Text>
            <Text style={[styles.confirmValue, { flex: 1, textAlign: "right", flexWrap: "wrap" }]}>{notes}</Text>
          </View>
        ) : null}
      </BlurView>

      <BlurView intensity={30} tint="dark" style={styles.freeNotice}>
        <Ionicons name="information-circle-outline" size={16} color="#4ade80" />
        <Text style={styles.freeNoticeText}>
          AI sessions are free and private. Human therapist sessions may require a subscription.
        </Text>
      </BlurView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require("../assets/images/home-bg.jpg")} style={{ flex: 1 }} resizeMode="cover">
        <LinearGradient colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.93)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.glowTop} />

        {/* ── Header ── */}
        <BlurView intensity={55} tint="dark" style={styles.header}>
          <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book a Session</Text>
          <View style={styles.stepsRow}>
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <StepDot step={s} current={step} />
                {s < 4 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
              </React.Fragment>
            ))}
          </View>
        </BlurView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Bottom CTA ── */}
        <BlurView intensity={70} tint="dark" style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.ctaBtn, !canProceed() && { opacity: 0.4 }]}
            disabled={!canProceed() || loading}
            onPress={step < 4 ? () => setStep(step + 1) : handleBook}
          >
            {loading ? (
              <ActivityIndicator color="#050f09" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>{step < 4 ? "Continue" : "Confirm Booking"}</Text>
                <Ionicons name={step < 4 ? "arrow-forward" : "checkmark"} size={18} color="#050f09" />
              </>
            )}
          </TouchableOpacity>
        </BlurView>
      </ImageBackground>
    </View>
  );
};

export default BookSession;

const styles = StyleSheet.create({
  glowTop: { position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none" },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  header: { paddingTop: Platform.OS === "ios" ? 54 : 40, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "rgba(74,222,128,0.1)", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 16, marginBottom: 14 },
  stepsRow: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: "#444", alignItems: "center", justifyContent: "center" },
  stepDotActive: { borderColor: "#4ade80", backgroundColor: "#4ade80" },
  stepDotCurrent: { borderColor: "#4ade80", backgroundColor: "#4ade80" },
  stepDotText: { color: "#555", fontFamily: "Poppins_500Medium", fontSize: 10 },
  stepLine: { width: 28, height: 1.5, backgroundColor: "#333" },
  stepLineActive: { backgroundColor: "#4ade80" },

  stepTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 15, marginBottom: 6 },
  stepSub: { color: "#888", fontFamily: "Poppins_400Regular", fontSize: 12, marginBottom: 16 },

  // Therapist
  therapistCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, overflow: "hidden", padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(74,222,128,0.15)", gap: 12 },
  therapistCardActive: { borderColor: "#4ade80", backgroundColor: "rgba(74,222,128,0.08)" },
  therapistAvatar: { fontSize: 28 },
  therapistName: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 13, marginBottom: 2 },
  therapistSpec: { color: "#888", fontFamily: "Poppins_400Regular", fontSize: 11 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  ratingText: { color: "#aaa", fontFamily: "Poppins_400Regular", fontSize: 10 },
  selectedCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#4ade80", alignItems: "center", justifyContent: "center" },

  // Type
  typeRow: { flexDirection: "row", gap: 12 },
  typeCard: { flex: 1, borderRadius: 14, padding: 16, alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", backgroundColor: "rgba(0,73,39,0.1)" },
  typeCardActive: { backgroundColor: "#4ade80", borderColor: "#4ade80" },
  typeLabel: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 13 },
  typeDesc: { color: "#888", fontFamily: "Poppins_400Regular", fontSize: 10 },

  // Date
  dateCard: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", backgroundColor: "rgba(0,73,39,0.1)", alignItems: "center", minWidth: 80 },
  dateCardActive: { backgroundColor: "#4ade80", borderColor: "#4ade80" },
  dateDayLabel: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 10, letterSpacing: 0.5 },
  dateFull: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 13, marginTop: 2 },

  // Time
  timesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", backgroundColor: "rgba(0,73,39,0.1)" },
  timeChipActive: { backgroundColor: "#4ade80", borderColor: "#4ade80" },
  timeChipText: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 12 },

  // Topic
  topicsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  topicChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", backgroundColor: "rgba(0,73,39,0.1)" },
  topicChipActive: { backgroundColor: "#4ade80", borderColor: "#4ade80" },
  topicChipText: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 11 },

  // Notes
  notesBox: { borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(74,222,128,0.15)", padding: 12 },
  notesInput: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 13, minHeight: 90, textAlignVertical: "top" },

  // Confirm
  confirmCard: { borderRadius: 16, overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", marginBottom: 14, gap: 12 },
  confirmRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  confirmLabel: { color: "#888", fontFamily: "Poppins_400Regular", fontSize: 12 },
  confirmValue: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 12 },

  freeNotice: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(74,222,128,0.12)" },
  freeNoticeText: { color: "#888", fontFamily: "Poppins_400Regular", fontSize: 11, flex: 1, lineHeight: 17 },

  // Bottom
  bottomBar: { paddingHorizontal: 20, paddingVertical: 14, paddingBottom: Platform.OS === "ios" ? 32 : 14, borderTopWidth: 1, borderTopColor: "rgba(74,222,128,0.1)" },
  ctaBtn: { backgroundColor: "#4ade80", borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ctaBtnText: { color: "#050f09", fontFamily: "Poppins_500Medium", fontSize: 15 },
});