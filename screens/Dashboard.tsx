import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ScrollView, StyleSheet, ActivityIndicator, View,
  ImageBackground, StatusBar, Text, TouchableOpacity, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../api";

// ─── Animated Score Ring ──────────────────────────────────────────────────────
const ScoreRing = ({ score }: { score: number }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const getColor  = (s: number) => s >= 80 ? "#4ade80" : s >= 60 ? "#facc15" : s >= 40 ? "#fb923c" : "#f87171";
  const getStatus = (s: number) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Average" : "Needs Care";
  const getEmoji  = (s: number) => s >= 80 ? "🌟" : s >= 60 ? "👍" : s >= 40 ? "😐" : "💙";
  const color = getColor(score);

  return (
    <Animated.View style={[sr.wrapper, { opacity: fadeAnim }]}>
      <Animated.View style={[sr.outerGlow, { borderColor: color + "30", transform: [{ scale: pulseAnim }] }]}>
        <View style={[sr.outerRing, { borderColor: color + "60" }]}>
          <View style={[sr.innerRing, { borderColor: color }]}>
            <LinearGradient
              colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.6)"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={sr.emoji}>{getEmoji(score)}</Text>
            <Text style={[sr.score, { color }]}>{score}</Text>
            <Text style={sr.outOf}>/100</Text>
            <Text style={[sr.status, { color }]}>{getStatus(score)}</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const sr = StyleSheet.create({
  wrapper:   { alignItems: "center", marginVertical: 16 },
  outerGlow: { width: 200, height: 200, borderRadius: 100, borderWidth: 8, alignItems: "center", justifyContent: "center" },
  outerRing: { width: 178, height: 178, borderRadius: 89,  borderWidth: 4, alignItems: "center", justifyContent: "center" },
  innerRing: { width: 148, height: 148, borderRadius: 74,  borderWidth: 3, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  emoji:  { fontSize: 22, marginBottom: 2 },
  score:  { fontSize: 42, fontFamily: "Poppins_700Bold", lineHeight: 46 },
  outOf:  { color: "#888", fontSize: 11, fontFamily: "Poppins_400Regular" },
  status: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginTop: 2 },
});








// ─── Animated Bar ─────────────────────────────────────────────────────────────
const AnimBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: Math.min(value / max, 1), duration: 1000, useNativeDriver: false }).start();
  }, [value]);
  const w = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={{ height: 5, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
      <Animated.View style={{ height: 5, width: w, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
};

// ─── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({
  emoji,
  label,
  value,
  display,
  max,
  color,
  
  delay = 0
}: any) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ width: "47%", marginBottom: 15 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={mcc.card}>
        <View style={mcc.iconWrap}>
          <Text style={mcc.emoji}>{emoji}</Text>
        </View>
        <Text style={mcc.label}>{label}</Text>
        <Text style={[mcc.value, { color }]}>{display}</Text>
        <AnimBar value={value} max={max} color={color} />
      </View>
    </Animated.View>
  );
};

const mcc = StyleSheet.create({
   card:     { padding: 15, borderRadius: 16,   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
 backgroundColor: "rgba(0, 26, 17, 0.53)",
  shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6},
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8, backgroundColor: "rgba(74,222,128,0.10)", },
  emoji:    { fontSize: 18 },
  label:    { color: "#888", fontSize: 10, fontFamily: "Poppins_400Regular" },
  value:    { fontSize: 18, fontFamily: "Poppins_700Bold", marginTop: 2 },
});

// ─── Mental Gauge ─────────────────────────────────────────────────────────────
const MentalGauge = ({ label, value, invert, delay = 0 }: any) => {
  const score = invert ? 10 - value : value;
  const color = score >= 7 ? "#4ade80" : score >= 4 ? "#facc15" : "#f87171";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={gauge.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Text style={gauge.label}>{label}</Text>
          <View style={[gauge.pill, { backgroundColor: color + "20", borderColor: color + "60" }]}>
            <Text style={[gauge.pillTxt, { color }]}>{value}/10</Text>
          </View>
        </View>
        <AnimBar value={score} max={10} color={color} />
      </View>
    </Animated.View>
  );
};

const gauge = StyleSheet.create({
  card:    { padding: 15, borderRadius: 12, marginBottom: 15, borderColor: "rgba(74,222,128,0.15)", borderWidth: 1, overflow: "hidden",  shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, backgroundColor: "rgba(0, 26, 17, 0.53)", },
  label:   { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
  pill:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  pillTxt: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
});

// ─── Vital Signs ──────────────────────────────────────────────────────────────
const VitalCard = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.2,  duration: 400, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 400, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(waveAnim, { toValue: 1, duration: 2000, useNativeDriver: false })).start();
  }, []);

  const vitals = [
    { label: "Blood\nPressure", value: "120/80", unit: "mmHg", icon: "pulse-outline",       color: "#f87171" },
    { label: "Heart\nRate",     value: "72",      unit: "bpm",  icon: "heart-outline",       color: "#fb923c" },
    { label: "Body\nTemp",      value: "36.6",    unit: "°C",   icon: "thermometer-outline", color: "#60a5fa" },
  ];

  return (
    <View style={vital.card}>
      <LinearGradient colors={["rgba(248,113,113,0.05)", "transparent"]} style={StyleSheet.absoluteFill} />
      <View style={vital.header}>
        <Animated.Text style={{ fontSize: 20, transform: [{ scale: pulseAnim }] }}>❤️</Animated.Text>
        <Text style={vital.title}>Vital Signs</Text>
        <View style={vital.statusBadge}>
          <View style={vital.greenDot} />
          <Text style={vital.statusTxt}>Normal</Text>
        </View>
      </View>
      <View style={vital.row}>
        {vitals.map((v, i) => (
          <View key={i} style={[vital.col, i < 2 && vital.border]}>
            <View style={[vital.iconWrap, { backgroundColor: v.color + "20" }]}>
              <Ionicons name={v.icon as any} size={20} color={v.color} />
            </View>
            <Text style={[vital.val, { color: v.color }]}>{v.value}</Text>
            <Text style={vital.unit}>{v.unit}</Text>
            <Text style={vital.lbl}>{v.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const vital = StyleSheet.create({
 card: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
    backgroundColor: "rgba(0, 26, 17, 0.53)",
    overflow: "hidden",

    shadowColor: "#004927",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    flex: 1,
    marginLeft: 10,
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(74,222,128,0.10)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.30)",
  },

  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginRight: 5,
  },

  statusTxt: {
    color: "#4ade80",
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  col: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },

  border: {
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  val: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginTop: 4,
  },

  unit: {
    color: "#888",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },

  lbl: {
    color: "#999",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },
});

// ─── Wellness Rings ───────────────────────────────────────────────────────────
const WellnessRings = ({ data }: any) => {
  const rings = [
    { label: "Oxygen",    value: 98,     color: "#60a5fa"},
    { label: "Hydration", value: Math.min(100, ((data?.water_intake || 0) / 3) * 100), color: "#34d399" },
    { label: "Rest",      value: Math.min(100, ((data?.sleep_hours  || 0) / 9) * 100), color: "#a78bfa"},
  ];

  const RingItem = ({ label, value, color, emoji }: any) => {
    const anim = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
      Animated.spring(anim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    }, []);
    return (
      <Animated.View style={[wr2.item, { transform: [{ scale: anim }] }]}>
        <View style={[wr2.outerRing, { borderColor: color + "25" }]}>
          <View style={[wr2.ring, { borderColor: color }]}>
            <Text style={wr2.emoji}>{emoji}</Text>
            <Text style={[wr2.pct, { color }]}>{Math.round(value)}%</Text>
          </View>
        </View>
        <Text style={wr2.label}>{label}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={wr2.card}>
      <LinearGradient colors={["rgba(0, 41, 90, 0.36)", "transparent"]} style={StyleSheet.absoluteFill} />
      <View style={wr2.header}>
        <View style={wr2.dot} />
        <Text style={wr2.title}>Body Wellness</Text>
      </View>
      <View style={wr2.row}>
        {rings.map((r, i) => <RingItem key={i} {...r} />)}
      </View>
    </View>
  );
};

const wr2 = StyleSheet.create({
  card:      { borderRadius: 25, padding: 15, marginBottom: 30, borderColor: "rgba(96,165,250,0.2)", borderWidth: 1, overflow: "hidden",  shadowColor: "#00114983", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, },
  header:    { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: "#60a5fa" },
  title:     { color: "#fff", fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  row:       { flexDirection: "row", justifyContent: "space-around" },
  item:      { alignItems: "center" },
  outerRing: { width: 70, height: 70, borderRadius: 45, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  ring:      { width: 60, height: 60, borderRadius: 35, borderWidth: 3, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.2)" },
  emoji:     { fontSize: 18 },
  pct:       { fontSize: 12, fontFamily: "Poppins_700Bold", marginTop: 2 },
  label:     { color: "#999", fontSize: 10, fontFamily: "Poppins_400Regular", marginTop: 8 },
});

// ─── Daily Achievements ───────────────────────────────────────────────────────
const DailyAchievements = ({ token }: { token: string }) => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    axios.get(`${BASE_URL}/achievements/daily`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => {
      const sorted = [...r.data.achievements].sort((a, b) => {
        if (a.done && !b.done) return -1;
        if (!a.done && b.done) return 1;
        return 0;
      });
      setItems(sorted);
    }).catch(() => {});
  }, []);

  const done  = items.filter(i => i.done).length;
  const total = items.length;
  const pct   = total ? done / total : 0;

  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, { toValue: pct, duration: 1000, useNativeDriver: false }).start();
  }, [pct]);
  const progressW = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  const AchBadge = ({ item, index }: any) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.spring(scaleAnim, { toValue: 1, delay: index * 60, tension: 60, friction: 7, useNativeDriver: true }).start();
    }, []);
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={[ach.badge, item.done ? ach.done : ach.locked]}>
          {item.done && <LinearGradient colors={["rgba(74,222,128,0.12)", "transparent"]} style={StyleSheet.absoluteFill} />}
          <Text style={ach.badgeEmoji}>{item.done ? item.emoji : "🔒"}</Text>
          <Text style={[ach.badgeTitle, item.done && { color: "#4ade80" }]}>{item.title}</Text>
          <Text style={ach.badgeDesc}>{item.desc}</Text>
          {item.done && (
            <View style={ach.check}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#4ade80" />
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={ach.wrapper}>
      {/* Progress bar */}
      <View style={ach.progressCard}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={ach.progressLabel}>Daily Progress</Text>
          <Text style={ach.progressCount}>{done}/{total} completed</Text>
        </View>
        <View style={ach.track}>
          <Animated.View style={[ach.fill, { width: progressW }]} />
        </View>
      </View>
      {/* Badges */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 130 }}>
        {items.map((item, i) => <AchBadge key={i} item={item} index={i} />)}
      </ScrollView>
    </View>
  );
};

const ach = StyleSheet.create({
  wrapper:       {  },
  progressCard:  { borderRadius: 12, padding: 15, borderColor: "rgba(74,222,128,0.2)", borderWidth: 1, overflow: "hidden", marginBottom: 15,  backgroundColor: "rgba(0, 26, 17, 0.53)",shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,},

  progressLabel: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
  progressCount: { color: "#4ade80", fontSize: 12, fontFamily: "Poppins_500Medium" },
  track:         { height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" },
  fill:          { height: 6, backgroundColor: "#4ade80", borderRadius: 3 },
  badge:         { width: 112, padding: 12, borderRadius: 16, marginRight: 10, alignItems: "center", overflow: "hidden" },
  done:          { borderColor: "rgba(74,222,128,0.4)", borderWidth: 1,   shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,  },
  locked:        { borderColor: "rgba(255,255,255,0.08)", borderWidth: 1 },
  badgeEmoji:    { fontSize: 26, marginBottom: 6 },
  badgeTitle:    { color: "#fff", fontSize: 10, fontFamily: "Poppins_400Regular", textAlign: "center" },
  badgeDesc:     { color: "#999", fontSize: 9, fontFamily: "Poppins_400Regular", textAlign: "center", marginTop: 3, lineHeight: 13 },
  check:         { position: "absolute", top: 5, right: 5, alignItems: "center", justifyContent: "center" },
});

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ label, icon, color = "#4ade80" }: any) => (
  <View style={sh.row}>
    <View style={[sh.bar, { backgroundColor: color }]} />
    <Ionicons name={icon} size={14} color={color} />
    <Text style={[sh.txt, { color }]}>{label}</Text>
  </View>
);

const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 15 },
  bar: { width: 3, height: 16, borderRadius: 2 },
  txt: { fontSize: 16, fontFamily: "Poppins_500Medium" },
});

// ─── Streak Card ──────────────────────────────────────────────────────────────
const StreakCards = ({ current, longest }: any) => {
  const items = [
    { emoji: "🔥", val: current, label: "Current Streak", color: "#fb923c", sub: "days" },
    { emoji: "🏆", val: longest, label: "Best Streak",    color: "#facc15", sub: "days" },
  ];
  return (
    <View style={{ flexDirection: "row", gap: 15, marginBottom: 30,  }}>
      {items.map((item, i) => {
        const scaleAnim = useRef(new Animated.Value(0.8)).current;
        useEffect(() => {
          Animated.spring(scaleAnim, { toValue: 1, delay: i * 150, tension: 60, friction: 7, useNativeDriver: true }).start();
        }, []);
        return (
          <Animated.View key={i} style={[{ flex: 1 }, { transform: [{ scale: scaleAnim }] }]}>
            <View style={[stk.card, { borderColor: item.color + "40" }]}>
              <LinearGradient colors={[item.color + "15", "transparent"]} style={StyleSheet.absoluteFill} />
              <Text style={stk.emoji}>{item.emoji}</Text>
              <Text style={[stk.num, { color: item.color }]}>{item.val}</Text>
              <Text style={stk.sub}>{item.sub}</Text>
              <Text style={stk.label}>{item.label}</Text>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const stk = StyleSheet.create({
  card:  { padding: 18, borderRadius: 18, alignItems: "center", borderWidth: 1, overflow: "hidden", backgroundColor: "rgba(26, 19, 0, 0.53)",
  shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, },
  emoji: { fontSize: 28, marginBottom: 4 },
  num:   { fontSize: 32, fontFamily: "Poppins_700Bold", lineHeight: 36 },
  sub:   { color: "#888", fontSize: 10, fontFamily: "Poppins_400Regular" },
  label: { color: "#ccc", fontSize: 11, fontFamily: "Poppins_500Medium", marginTop: 4 },
});

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState<any>(null);
  const [token, setToken]     = useState("");
  const [localMoodEmoji, setLocalMoodEmoji] = useState<string | null>(null);
  const [localMoodText,  setLocalMoodText]  = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const moodMap: Record<string, string> = {
    "😄": "Happy", "🙂": "Good", "😐": "Neutral", "😕": "Sad", "😔": "Very Sad",
  };

  useFocusEffect(useCallback(() => {
    const load = async () => {
      try {
        const t = await AsyncStorage.getItem("token") || "";
        setToken(t);
        const res = await axios.get(`${BASE_URL}/wellness-dashboard`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        setData(res.data);
        if (res.data?.mood) {
          setLocalMoodEmoji(res.data.mood.emoji);
          setLocalMoodText(res.data.mood.text);
        }
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    };
    load();
  }, []));

  const handleMoodPress = async (item: string | null) => {
    if (!item) { setLocalMoodEmoji(null); setLocalMoodText(null); return; }
    setLocalMoodEmoji(item);
    setLocalMoodText(moodMap[item]);
    try {
      await axios.post(`${BASE_URL}/mood`, { mood_emoji: item }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) { console.log(err); }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#050f09", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={{ color: "#4ade80", marginTop: 12, fontFamily: "Poppins_400Regular", fontSize: 12 }}>Loading your wellness...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require("../assets/images/home-bg.jpg")} style={{ flex: 1 }} resizeMode="cover">
        <LinearGradient colors={["rgba(0,15,8,0.6)", "rgba(3,12,7,0.95)"]} style={StyleSheet.absoluteFill} />

        <Animated.ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >
          {/* Hero — Score Ring */}
          <View style={s.heroCard}>
            <LinearGradient colors={["rgba(74,222,128,0.08)", "transparent"]} style={StyleSheet.absoluteFill} />
            <Text style={s.heroLabel}>AI Wellness Score</Text>
            <ScoreRing score={data?.score || 0} />
          </View>


          {/* Streaks */}
          <SectionHeader label="Streaks" icon="flame-outline" color="#fb923c" />
          <StreakCards current={data?.streaks?.current || 0} longest={data?.streaks?.longest || 0} />

          {/* Health Metrics */}
          <SectionHeader label="Health Metrics" icon="stats-chart-outline" color="#4ade80" />
          <View style={s.grid}>
            <MetricCard emoji="💤" label="Sleep"      value={data?.sleep_hours || 0}       max={9}  display={`${data?.sleep_hours || 0}h`}    color="#a78bfa" delay={0}   />
            <MetricCard emoji="💧" label="Water"      value={data?.water_intake || 0}      max={3}  display={`${data?.water_intake || 0}L`}    color="#34d399" delay={80}  />
            <MetricCard emoji="🍴" label="Meals"      value={data?.meals_count || 0}       max={3}  display={`${data?.meals_count || 0}/3`}    color="#fb923c" delay={160} />
            <MetricCard emoji="🧘" label="Meditation" value={data?.meditation_minutes || 0} max={30} display={`${data?.meditation_minutes || 0}m`} color="#60a5fa" delay={240} />
          </View>

          {/* Vital Signs */}
          <SectionHeader label="Vital Signs" icon="heart-outline" color="#f87171" />
          <VitalCard />

          {/* Body Wellness */}
          <SectionHeader label="Body Wellness" icon="body-outline" color="#60a5fa" />
          <WellnessRings data={data} />

          {/* Mental Wellness */}
          <SectionHeader label="Mental Wellness" icon="bulb" color="#a78bfa" />
          <MentalGauge label="Stress Level"  value={data?.stress_level  || 0} invert delay={0}   />
          <MentalGauge label="Anxiety Level" value={data?.anxiety_level || 0} invert delay={100} />
          <MentalGauge label="Energy Level"  value={data?.energy_level  || 0}        delay={200} />

          {/* Achievements */}
          <View style={{height: 15}}/>
          <SectionHeader label="Today's Goals" icon="trophy-outline" color="#facc15" style={{marginTop: 55}}/>
          {token ? <DailyAchievements token={token} /> : null}

          {/* AI Insights */}
          <SectionHeader label="AI Insights" icon="bulb-outline" color="#facc15" />
          {data?.recommendations?.map((rec: string, i: number) => (
            <View key={i}  style={s.recCard}>
              <View style={s.recDot} />
              <Text style={s.recText}>{rec}</Text>
            </View>
          ))}

          <View style={{ height: 80 }} />
        </Animated.ScrollView>
      </ImageBackground>
    </View>
  );
};

const s = StyleSheet.create({
  scroll:    { padding: 20, paddingTop: 40 },
  heroCard:  { borderRadius: 25, padding: 20, marginBottom: 30, alignItems: "center", borderColor: "rgba(74,222,128,0.2)", borderWidth: 1, overflow: "hidden", backgroundColor: "rgba(0, 26, 17, 0.53)",
  shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, },
  heroLabel: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular", letterSpacing: 0.5 },
  grid:      { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 15 },
  recCard:   { flexDirection: "row", alignItems: "flex-start", padding: 14, borderRadius: 14, marginBottom: 10, borderColor: "rgba(250, 204, 21, 0.34)", borderWidth: 1, overflow: "hidden", gap: 10, backgroundColor: "#5a480044",   shadowColor: "#492700ff", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, },
  recDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: "#facc15", marginTop: 4 },
  recText:   { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular", flex: 1, lineHeight: 19 },
});

export default Dashboard;