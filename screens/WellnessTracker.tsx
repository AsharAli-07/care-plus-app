import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, ImageBackground, StatusBar, Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";

import { SleepInput }        from "../components/SleepInput";
import { HydrationTracker }  from "../components/HydrationTracker";
import { NutritionCheck }    from "../components/NutritionCheck";
import { MindfulnessInput }  from "../components/MindfulnessInput";
import { WellnessSliders }   from "../components/WellnessSliders";
import { MoodSelector } from "../components/MoodSelector";
import { useFocusEffect } from "@react-navigation/native";

type MealsType = { breakfast: boolean; lunch: boolean; dinner: boolean };
const MEAL_KEYS = ["breakfast", "lunch", "dinner"] as const;
type MealKey = typeof MEAL_KEYS[number];

// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ label, icon, color = "#4ade80" }: any) => (
  <View style={sh.row}>
    <View style={[sh.bar, { backgroundColor: color }]} />
    <Ionicons name={icon} size={14} color={color} />
    <Text style={[sh.txt, { color }]}>{label}</Text>
  </View>
);

const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, marginTop: 6 },
  bar: { width: 3, height: 16, borderRadius: 2 },
  txt: { fontSize: 14, fontFamily: "Poppins_500Medium" },
});

// ─── Animated Section Wrapper ─────────────────────────────────────────────────
const FadeSlide = ({ children, delay = 0 }: any) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      {children}
    </Animated.View>
  );
};

// ─── Success Screen ────────────────────────────────────────────────────────────
// ─── Success Screen ────────────────────────────────────────────────────────────
const SuccessView = ({ score, onDashboard, onStay }: { score: number; onDashboard: () => void; onStay: () => void }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const fade  = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(ringScale, { toValue: 1, duration: 1600, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringOpacity, { toValue: 0, duration: 1600, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.successCard, { opacity: fade }]}>
      <View style={styles.successIconWrap}>
        <Animated.View
          style={[
            styles.successRing,
            { transform: [{ scale: ringScale }], opacity: ringOpacity },
          ]}
        />
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="checkmark-circle" size={72} color="#4ade80" />
        </Animated.View>
      </View>

      <Text style={styles.successTitle}>Progress Saved!</Text>
      <Text style={styles.successSubtitle}>
        Your wellness score for today is
      </Text>
      <Text style={styles.successScore}>{score}<Text style={styles.successScoreMax}>/100</Text></Text>

      <TouchableOpacity style={styles.dashboardBtn} onPress={onDashboard} activeOpacity={0.85}>
  
        <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.stayBtn} onPress={onStay} activeOpacity={0.7}>
        <Text style={styles.stayBtnText}>Stay</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const WellnessTracker = ({ navigation }: any) => {
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [sleepHours, setSleepHours]     = useState(0);
  const [waterML, setWaterML]           = useState(0);
  const [meditationMin, setMeditationMin] = useState(0);
  const [meals, setMeals]               = useState<MealsType>({ breakfast: false, lunch: false, dinner: false });
  const [stressLevel, setStressLevel]   = useState(0);
  const [anxietyLevel, setAnxietyLevel] = useState(0);
  const [energyLevel, setEnergyLevel]   = useState(5);
  const [moodEmoji, setMoodEmoji]       = useState<string | null>(null);
  const [moodText, setMoodText]         = useState<string | null>(null);
  const [sleepGoal, setSleepGoal] = useState(9);
  const [waterGoal, setWaterGoal] = useState(3);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const moodMap: Record<string, string> = {
    "😄": "Happy", "🙂": "Good", "😐": "Neutral", "😕": "Sad", "😔": "Very Sad",
  };

  useEffect(() => {
    loadTodayData();
  }, []);


useFocusEffect(
  useCallback(() => {
    loadTodayData();
  }, [])
);

const loadTodayData = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const [logRes, moodRes, prefRes] = await Promise.all([
      axios.get(`${BASE_URL}/wellness-log/today`,   { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BASE_URL}/mood-history?limit=1`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BASE_URL}/wellness-preferences`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

      const data = logRes.data || {};
      setWaterML(Number(data.water_intake || 0) * 1000);
      setMeditationMin(Number(data.meditation_minutes || 0));
      setSleepHours(Number(data.sleep_hours ?? 0));
      const mc = Number(data.meals_count || 0);
      setMeals({ breakfast: mc >= 1, lunch: mc >= 2, dinner: mc >= 3 });
      setStressLevel(Number(data.stress_level ?? 0));
      setAnxietyLevel(Number(data.anxiety_level ?? 0));
      setEnergyLevel(Number(data.energy_level ?? 5));

const todayMood = moodRes.data?.[0];

if (todayMood) {
  const moodDate = new Date(todayMood.created_at); // adjust field name to match your API response
  const today = new Date();

  const isToday =
    moodDate.getFullYear() === today.getFullYear() &&
    moodDate.getMonth() === today.getMonth() &&
    moodDate.getDate() === today.getDate();

  if (isToday) {
    setMoodEmoji(todayMood.mood_emoji);
    setMoodText(todayMood.mood_text);
  } else {
    setMoodEmoji(null);
    setMoodText(null);
  }
} else {
  setMoodEmoji(null);
  setMoodText(null);
}

      const prefs = prefRes.data || {};
      if (prefs.sleep_goal) setSleepGoal(parseFloat(prefs.sleep_goal));
      if (prefs.water_goal) setWaterGoal(parseFloat(prefs.water_goal));

      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    } catch (err) { console.log("Tracker Load Error:", err); }
    finally { setLoading(false); }
  };
useFocusEffect(
  useCallback(() => {
    loadTodayData();
  }, [])
);
  const toggleMeal = (key: MealKey) => setMeals(prev => ({ ...prev, [key]: !prev[key] }));
  const getMealScore = () => [meals.breakfast, meals.lunch, meals.dinner].filter(Boolean).length;

  const handleMoodPress = async (emoji: string | null) => {
    if (!emoji) { setMoodEmoji(null); setMoodText(null); return; }
    setMoodEmoji(emoji);
    setMoodText(moodMap[emoji]);
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(`${BASE_URL}/mood`, { mood_emoji: emoji }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { console.log(err); }
  };

  const saveData = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(`${BASE_URL}/wellness-log`, {
        sleep_hours:        sleepHours > 0 ? sleepHours : undefined,
        water_intake:       waterML / 1000,
        meals_count:        getMealScore(),
        meditation_minutes: meditationMin,
        stress_level:       stressLevel,
        anxiety_level:      anxietyLevel,
        energy_level:       energyLevel,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSavedScore(res.data.score);
    } catch {
      Alert.alert("Error", "Failed to save data");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#050f09", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={{ color: "#4ade80", marginTop: 12, fontFamily: "Poppins_400Regular", fontSize: 12 }}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require("../assets/images/home-bg.jpg")} style={{ flex: 1 }} resizeMode="cover">
        <LinearGradient colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]} style={StyleSheet.absoluteFill} />

 {savedScore !== null ? (
  <View style={styles.successOverlay}>
    <SuccessView
      score={savedScore}
      onDashboard={() => navigation.navigate("Dashboard")}
      onStay={() => setSavedScore(null)}
    />
  </View>
) : (
  <Animated.ScrollView
    contentContainerStyle={styles.scroll}
    showsVerticalScrollIndicator={false}
    style={{ opacity: fadeAnim }}
  >
    {/* Mood */}
    <FadeSlide delay={80}>
      <SectionHeader label="Today's Mood" icon="happy-outline" color="#4ade80" />
      <MoodSelector moodEmoji={moodEmoji} moodText={moodText} onMoodPress={handleMoodPress} />
    </FadeSlide>

    {/* Sleep */}
    <FadeSlide delay={160}>
      <SectionHeader label="Sleep" icon="moon-outline" color="#4ade80" />
      <SleepInput value={sleepHours} onChange={setSleepHours} goal={sleepGoal} />
    </FadeSlide>

    {/* Hydration */}
    <FadeSlide delay={240}>
      <SectionHeader label="Hydration" icon="water-outline" color="#4ade80" />
      <HydrationTracker
        waterML={waterML}
        onAdd={() => setWaterML(p => p + 250)}
        onRemove={() => setWaterML(p => Math.max(0, p - 250))}
        goalL={waterGoal}
      />
    </FadeSlide>

    {/* Nutrition */}
    <FadeSlide delay={320}>
      <SectionHeader label="Nutrition" icon="restaurant-outline" color="#4ade80" />
      <NutritionCheck
        meals={meals}
        mealKeys={MEAL_KEYS}
        onToggleMeal={toggleMeal}
        mealScore={getMealScore()}
      />
    </FadeSlide>

    {/* Mindfulness */}
    <FadeSlide delay={400}>
      <SectionHeader label="Mindfulness" icon="leaf-outline" color="#4ade80" />
      <MindfulnessInput value={meditationMin} onChange={setMeditationMin} />
    </FadeSlide>

    {/* Mental Wellness */}
    <FadeSlide delay={480}>
      <SectionHeader label="Mental Wellness" icon="fitness-outline" color="#4ade80" />
      <WellnessSliders
        stressLevel={stressLevel}   setStressLevel={setStressLevel}
        anxietyLevel={anxietyLevel} setAnxietyLevel={setAnxietyLevel}
        energyLevel={energyLevel}   setEnergyLevel={setEnergyLevel}
      />
    </FadeSlide>

    {/* Save Button */}
    <FadeSlide delay={560}>
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
        onPress={saveData}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Today's Log</Text>
        )}
      </TouchableOpacity>
    </FadeSlide>

    <View style={{ height: 80 }} />
  </Animated.ScrollView>
)}
      </ImageBackground>
    </View>
  );
};

export default WellnessTracker;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 40, marginBottom: 30 },

  saveBtn: {
    backgroundColor: "#004927ff",
    padding: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    marginBottom: 30

  },
  saveText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },

  // ── Success screen ──
  successOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successCard: {
    width: "100%",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
  },
  successIconWrap: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  successTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    marginBottom: 5,
  },
  successSubtitle: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 15,
  },
  successScore: {
    color: "#4ade80",
    fontSize: 40,
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
  },
  stayBtn: {
  marginTop: 20,
 
},
stayBtnText: {
  color: "#fff",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
},
  successScoreMax: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  dashboardBtn: {
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#004927ff",
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
  },
  dashboardBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});