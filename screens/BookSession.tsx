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

// ─── Session types — Sera AI only ─────────────────────────────────────────────
const SESSION_TYPES = [
  {
    id: "chat",
    label: "Chat with Sera",
    icon: "chatbubble-ellipses-outline",
    desc: "Text-based • Private",
    tag: "Mood & data aware",
    color: "#4ade80",
    gradient: ["rgba(0,73,39,0.75)", "rgba(0,40,20,0.95)"] as const,
  },
  {
    id: "voice",
    label: "Talk to Sera",
    icon: "mic-outline",
    desc: "Live voice conversation",
    tag: "Biometric aware",
    color: "#38bdf8",
  
    gradient: ["rgba(0,40,65,0.75)", "rgba(0,20,45,0.95)"] as const,
  },
];

const SESSION_TOPICS = [
  "Anxiety & Stress",
  "Sleep Issues",
  "Depression",
  "Relationships",
  "Trauma & PTSD",
  "Work Stress",
  "Grief & Loss",
  "Self-Esteem",
  "Anger Management",
  "Panic Attacks",
  "Loneliness",
  "General Wellness",
];

const TIMES = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
];

const toLocalISODate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getNext7Days = () => {
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[d.getDay()],
      full: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      value: toLocalISODate(d), // was: d.toISOString().split("T")[0]
    });
  }
  return days;
};

// ─── Step indicator ────────────────────────────────────────────────────────────
const StepDot = ({ step, current }: { step: number; current: number }) => (
  <View style={[
    styles.stepDot,
    step <= current && styles.stepDotActive,
    step === current && styles.stepDotCurrent,
  ]}>
    {step < current ? (
      <Ionicons name="checkmark" size={10} color="#fff" />
    ) : (
      <Text style={[styles.stepDotText, step === current && { color: "#fff" }]}>{step}</Text>
    )}
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
const BookSession = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<"chat" | "voice" | null>(null);
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const days = getNext7Days();

  const canProceed = () => {
    if (step === 1) return !!selectedType;
    if (step === 2) return !!selectedTime;
    if (step === 3) return !!selectedTopic;
    return true;
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/therapy/book`,
        {
          session_type: selectedType,
          session_date: selectedDate.value,
          session_time: selectedTime,
          title: selectedTopic,
          notes: notes || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);
      Alert.alert(
        "Session Booked! 🎉",
        `Your ${selectedType === "voice" ? "voice" : "chat"} session with Sera has been scheduled for ${selectedDate.full} at ${selectedTime}.\n\nYou'll receive a reminder notification before it starts.`,
        [
          {
            text: "View My Sessions",
            onPress: () => navigation.replace("Therapy"),
          },
        ]
      );
    } catch (err: any) {
      setLoading(false);
      Alert.alert(
        "Booking Failed",
        err?.response?.data?.message || "Please try again."
      );
    }
  };

  // ── Step 1: Session Type ──
  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>How would you like to connect?</Text>
      <Text style={styles.stepSub}>
        Choose your preferred way to session with Sera — your personal AI companion
      </Text>

      {/* Sera intro card */}
      <View style={styles.seraIntroCard}>
        {/* <View style={styles.seraAvatarWrap}>
          <Ionicons name="sparkles" size={22} color="#4ade80" />
        </View> */}
        <View style={{ flex: 1 }}>
          <Text style={styles.seraIntroName}>Sera · AI Companion</Text>
          <Text style={styles.seraIntroDesc}>
            Sera knows your mood, sleep, stress, heart rate and wellness data — so every session is personal to you, not generic.
          </Text>
        </View>
      </View>

      {/* Capability badges */}
      <View style={styles.badgeRow}>
        {[
  { icon: "heart-outline", label: "Reads vitals" },
  { icon: "moon-outline", label: "Knows your sleep" },
  { icon: "happy-outline", label: "Tracks mood" },
  { icon: "lock-closed-outline", label: "Privacy safe" },
].map((b) => (
  <View key={b.label} style={styles.badge}>
    <Ionicons name={b.icon as any} size={12} color="#4ade80" />
    <Text style={styles.badgeText}>{b.label}</Text>
  </View>
))}
      </View>

      {/* Session type cards */}
      {SESSION_TYPES.map((t) => {
        const isSelected = selectedType === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            onPress={() => setSelectedType(t.id as "chat" | "voice")}
            activeOpacity={0.85}
            style={styles.typeCardTouch}
          >
            {isSelected ? (
              <LinearGradient
                colors={t.gradient}
                style={[styles.typeCard, { borderColor: t.color, borderWidth: 1.5 }]}
              >
                <TypeCardContent t={t} isSelected={isSelected} />
              </LinearGradient>
            ) : (
              <View style={styles.typeCard}>
                <TypeCardContent t={t} isSelected={isSelected} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Step 2: Date & Time ──
  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>When should we meet?</Text>
      <Text style={styles.stepSub}>Pick a date and time that works for you</Text>

      {/* Date picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30 }}>
        <View style={{ flexDirection: "row", gap: 15 }}>
          {days.map((d) => {
            const isSelected = selectedDate.value === d.value;
            return (
              <TouchableOpacity
                key={d.value}
                onPress={() => { setSelectedDate(d); setSelectedTime(null); }}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
              >
                <Text style={[styles.dateDayLabel, isSelected && { color: "#fff" }]}>{d.label}</Text>
                <Text style={[styles.dateFull, isSelected && { color: "#fff" }]}>{d.full}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Time picker */}
      <Text style={[styles.stepTitle, { marginBottom: 15 }]}>Select a time</Text>
      <View style={styles.timesGrid}>
        {TIMES.map((t) => {
          const isSelected = selectedTime === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedTime(t)}
              style={[styles.timeChip, isSelected && styles.timeChipActive]}
            >
              <Text style={[styles.timeChipText, isSelected && { color: "#fff", fontFamily: "Poppins_400Regular" }]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // ── Step 3: Topic ──
  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>What would you like to focus on?</Text>
      <Text style={styles.stepSub}>
        Sera will tailor the session around this topic and your current wellness data
      </Text>
      <View style={styles.topicsGrid}>
        {SESSION_TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic;
          return (
            <TouchableOpacity
              key={topic}
              onPress={() => setSelectedTopic(topic)}
              style={[styles.topicChip, isSelected && styles.topicChipActive]}
            >
              <Text style={[styles.topicChipText, isSelected && { color: "#fff", fontFamily: "Poppins_400Regular" }]}>
                {topic}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.stepTitle, { marginTop: 28, marginBottom: 15 }]}>
        Anything Sera should know? <Text style={{ color: "#999", fontSize: 12 }}>(optional)</Text>
      </Text>
      <View style={styles.notesBox}>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. I've been struggling with sleep this week and feeling anxious at work…"
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <Text style={styles.charCount}>{notes.length}/500</Text>
      </View>
    </View>
  );

  // ── Step 4: Confirm ──
  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Review & Confirm</Text>
      <Text style={styles.stepSub}>Check your session details before confirming</Text>

      <View style={styles.confirmCard}>
        <View style={styles.confirmHeader}>
          <View style={styles.seraAvatarSmall}>
            <Ionicons name="sparkles" size={14} color="#4ade80" />
          </View>
          <View>
            <Text style={styles.confirmSeraName}>Sera · AI Companion</Text>
            <Text style={styles.confirmSeraTag}>Personalised mental health support</Text>
          </View>
        </View>

        <View style={styles.confirmDivider} />

        {[
          { icon: "chatbubble-outline", label: "Session Type", value: selectedType === "voice" ? "🎙️ Voice Conversation" : "💬 Chat Conversation" },
          { icon: "calendar-outline", label: "Date", value: `${selectedDate.label}, ${selectedDate.full}` },
          { icon: "time-outline", label: "Time", value: selectedTime || "" },
          { icon: "bookmark-outline", label: "Topic", value: selectedTopic || "" },
        ].map((row) => (
          <View key={row.label} style={styles.confirmRow}>
            <View style={styles.confirmLabelWrap}>
              <Ionicons name={row.icon as any} size={13} color="#4ade80" />
              <Text style={styles.confirmLabel}>{row.label}</Text>
            </View>
            <Text style={styles.confirmValue}>{row.value}</Text>
          </View>
        ))}

        {notes ? (
          <>
            <View style={styles.confirmDivider} />
            <View style={[styles.confirmRow, { alignItems: "flex-start" }]}>
              <View style={styles.confirmLabelWrap}>
                <Ionicons name="document-text-outline" size={13} color="#4ade80" />
                <Text style={styles.confirmLabel}>Notes</Text>
              </View>
              <Text style={[styles.confirmValue, { flex: 1, textAlign: "right", flexWrap: "wrap" }]}>{notes}</Text>
            </View>
          </>
        ) : null}
      </View>

      {/* Info notices */}
      <View style={styles.noticeCard}>
        <Ionicons name="notifications-outline" size={15} color="#4ade80" />
        <Text style={styles.noticeText}>
          You'll receive a reminder notification 30 minutes and 5 minutes before your session starts.
        </Text>
      </View>

      <View style={[styles.noticeCard, { marginTop: 10 }]}>
        <Ionicons name="lock-closed-outline" size={15} color="#4ade80" />
        <Text style={styles.noticeText}>
          Sessions with Sera are completely free, private, and protected by your privacy settings.
        </Text>
      </View>

      <View style={[styles.noticeCard, { marginTop: 10, marginBottom: 10 }]}>
        <Ionicons name="sparkles-outline" size={15} color="#4ade80" />
        <Text style={styles.noticeText}>
          Sera will review your latest wellness data, vitals, and mood before your session for a truly personalised experience.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: '100%',  width: '100%' }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.93)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />

        {/* Header */}
        <View style={styles.header}>
          <View style ={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
          <TouchableOpacity
            onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Book a Session</Text>
            <Text style={styles.headerSub}>
              {step === 1 ? "Choose session type" : step === 2 ? "Pick date & time" : step === 3 ? "Select topic" : "Confirm booking"}
            </Text>
          </View>
          </View>
          {/* Step indicators */}
          <View style={styles.stepsRow}>
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <StepDot step={s} current={step} />
                {s < 4 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
         
        </ScrollView>

        {/* Bottom CTA */}
        
          <TouchableOpacity
            style={[styles.ctaBtn, !canProceed() && { display: 'none' }]}
            disabled={!canProceed() || loading}
            onPress={step < 4 ? () => setStep(step + 1) : handleBook}
          >
            {loading ? (
              <ActivityIndicator color="#ffffffff" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>
                  {step < 4 ? "Continue" : "Confirm Booking"}
                </Text>
                <Ionicons
                  name={step < 4 ? "arrow-forward" : "checkmark-circle"}
                  size={18}
                  color="#ffffffff"
                />
              </>
            )}
          </TouchableOpacity>
      
      </ImageBackground>
    </View>
  );
};

// ─── Extracted card content component ─────────────────────────────────────────
const TypeCardContent = ({ t, isSelected }: { t: typeof SESSION_TYPES[0]; isSelected: boolean }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
    <View style={[styles.typeIconWrap, { backgroundColor: isSelected ? `${t.color}22` : "rgba(255,255,255,0.06)" }]}>
      <Ionicons name={t.icon as any} size={24} color={isSelected ? t.color : "#999"} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.typeLabel, isSelected && { color: "#fff" }]}>{t.label}</Text>
      <Text style={[styles.typeDesc, isSelected && { color: "#999" }]}>{t.desc}</Text>
      <View style={[styles.typeTag, { backgroundColor: `${t.color}18` }]}>
        <Text style={[styles.typeTagText, { color: t.color }]}>{t.tag}</Text>
      </View>
    </View>
    {isSelected && (
      <View style={[styles.checkWrap, { backgroundColor: t.color }]}>
        <Ionicons name="checkmark" size={14} color="#050f09" />
      </View>
    )}
  </View>
);

export default BookSession;

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
  },
  scroll: { paddingHorizontal: 20, paddingTop: 15, marginBottom: 80 },

  // Header
  header: {
    paddingTop: 40,
    paddingBottom: 15, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: "rgba(74,222,128,0.1)",
     backgroundColor: "rgba(0, 26, 17, 0.53)",
  
  },
  backBtn: {  marginRight: 15 },
  headerTitle: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 16 },
  headerSub: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 10, },
  stepsRow: { flexDirection: "row", alignItems: "center" },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1, borderColor: "#999",
    alignItems: "center", justifyContent: "center",
  },
  stepDotActive: { borderColor: "rgba(74,222,128,0.3)",  backgroundColor: "rgba(74,222,128,0.10)" },
  stepDotCurrent: { borderColor: "rgba(74,222,128,0.3)",  backgroundColor: "rgba(74,222,128,0.10)" },
  stepDotText: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 10 },
  stepLine: { width: 26, height: 1.3, backgroundColor: "#999" },
  stepLineActive: { backgroundColor: "rgba(74,222,128,0.3)", color: "#fff" },

  stepTitle: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 14, marginBottom: 6 },
  stepSub: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 12, marginBottom: 20, lineHeight: 18 },

  // Sera intro
  seraIntroCard: {
    flexDirection: "row", alignItems: "flex-start",
    borderRadius: 16, overflow: "hidden",
    padding: 16, marginBottom: 16,
     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
   backgroundColor: 'rgba(0, 26, 17, 0.50)',
 
  },
  seraAvatarWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(74,222,128,0.12)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.3)",
  },
  seraIntroName: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 14, marginBottom: 4 },
  seraIntroDesc: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 17 },

  // Capability badges
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, overflow: "hidden",
        borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
 backgroundColor: "rgba(0, 26, 17, 0.53)",
  },
  badgeText: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 10 },

  // Session type cards
  typeCardTouch: { marginBottom: 12, borderRadius: 16, overflow: "hidden" },
  typeCard: { padding: 15, borderRadius: 16,     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
    backgroundColor: 'rgba(0, 26, 17, 0.50)', },

    
  typeIconWrap: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
       
 
  },

    typeIconWrapblue: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
        borderColor: "rgba(74, 205, 222, 0.3)",  borderWidth: 1,
   backgroundColor: 'rgba(0, 26, 17, 0.50)',
  },
  typeLabel: { color: "#bbb", fontFamily: "Poppins_500Medium", fontSize: 14, marginBottom: 3 },
  typeDesc: { color: "#666", fontFamily: "Poppins_400Regular", fontSize: 11, marginBottom: 8 },
  typeTag: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  typeTagText: { fontFamily: "Poppins_400Regular", fontSize: 9, letterSpacing: 0.3 },
  checkWrap: { width: 20, height: 20, borderRadius: 13, alignItems: "center", justifyContent: "center" },

  // Date
  dateCard: {
    paddingHorizontal: 10, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(74,222,128,0.2)",
     backgroundColor: "rgba(0, 26, 17, 0.53)", alignItems: "center", minWidth: 70,
  },
  dateCardActive: {  backgroundColor: "#004927",   borderColor: "rgba(74,222,128,0.3)",  },
  dateDayLabel: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 10, letterSpacing: 0.5 },
  dateFull: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 14, marginTop: 3,
    
   },


  // Time
  timesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15, marginBottom: 40 },
  timeChip: {
     paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(74,222,128,0.2)",
  backgroundColor: "rgba(0, 26, 17, 0.53)",
  width: 87,
  alignItems: "center"
 
  },
  timeChipActive: { backgroundColor: "#004927",},
  timeChipText: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 12 },

  // Topics
  topicsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  topicChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22,
    borderWidth: 1,borderColor: "rgba(74,222,128,0.3)",
    backgroundColor: "rgba(0, 26, 17, 0.53)",
  },
  topicChipActive: { backgroundColor: "#004927", borderColor: "rgba(74,222,128,0.3)", },
  topicChipText: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 10 },

  // Notes
  notesBox: {
    borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.15)",
    padding: 14,
    backgroundColor: 'rgba(0, 26, 17, 0.50)',
    marginBottom: 10
  },
  notesInput: {
    color: "#fff", fontFamily: "Poppins_400Regular",
    fontSize: 12, minHeight: 50, textAlignVertical: "top",
  },
  charCount: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 10, textAlign: "right", marginTop: 4 },

  // Confirm
  confirmCard: {
    borderRadius: 18, overflow: "hidden",
    padding: 18, borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)", marginBottom: 14,
   backgroundColor: 'rgba(0, 26, 17, 0.50)',

  },
  confirmHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  seraAvatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(74,222,128,0.12)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.3)",
  },
  confirmSeraName: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 13 },
  confirmSeraTag: { color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 10 },
  confirmDivider: { height: 1, backgroundColor: "rgba(74,222,128,0.1)", marginVertical: 12 },
  confirmRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  confirmLabelWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  confirmLabel: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 12 },
  confirmValue: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 12 },

  noticeCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    padding: 13, borderRadius: 13, overflow: "hidden",
    borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
    backgroundColor: 'rgba(0, 26, 17, 0.50)',
  },
  noticeText: { color: "#999", fontFamily: "Poppins_400Regular", fontSize: 11, flex: 1, lineHeight: 17 },

  // Bottom bar

  ctaBtn: {
   
     flexDirection: "row",
    justifyContent: "center", gap: 10,
    alignSelf: "center",
   position: 'absolute',
   bottom: 50,
   paddingVertical: 12,


 
    backgroundColor: "#004927ff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",


   

  width: "88%",

   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
     
  },
  ctaBtnText: { color: "#ffffffff", fontFamily: "Poppins_400Regular", fontSize: 12 },
});