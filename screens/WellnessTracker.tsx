import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

// Pure Flat Folder Component Imports
import { SleepInput } from "../components/SleepInput";
import { HydrationTracker } from "../components/HydrationTracker";
import { NutritionCheck } from "../components/NutritionCheck";
import { MindfulnessInput } from "../components/MindfulnessInput";
import { WellnessSliders } from "../components/WellnessSliders"; // Added here

type MealsType = { breakfast: boolean; lunch: boolean; dinner: boolean };
const MEAL_KEYS = ["breakfast", "lunch", "dinner"] as const;
type MealKey = typeof MEAL_KEYS[number];

const WellnessTracker = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);

  const [sleepHours, setSleepHours] = useState<number>(0);
  const [waterML, setWaterML] = useState<number>(0);
  const [meditationMin, setMeditationMin] = useState<number>(0);
  const [meals, setMeals] = useState<MealsType>({ breakfast: false, lunch: false, dinner: false });
  const [stressLevel, setStressLevel] = useState<number>(0);
  const [anxietyLevel, setAnxietyLevel] = useState<number>(0);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [score, setScore] = useState<number>(0);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/wellness-log/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || {};
      setWaterML(Number(data.water_intake || 0) * 1000);
      setMeditationMin(Number(data.meditation_minutes || 0));
      setSleepHours(Number(data.sleep_hours ?? 0));

      const mc = Number(data.meals_count || 0);
      setMeals({ breakfast: mc >= 1, lunch: mc >= 2, dinner: mc >= 3 });
      setStressLevel(Number(data.stress_level ?? 0));
      setAnxietyLevel(Number(data.anxiety_level ?? 0));
      setEnergyLevel(Number(data.energy_level ?? 5));
      setScore(Number(data.score || 0));
    } catch (err) {
      console.log("Tracker Load Fault Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTodayData(); }, []);

  const toggleMeal = (key: MealKey) => {
    setMeals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getMealScore = () => {
    let count = 0;
    if (meals.breakfast) count++;
    if (meals.lunch) count++;
    if (meals.dinner) count++;
    return count;
  };

  const saveData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const payload = {
        sleep_hours: sleepHours > 0 ? sleepHours : undefined,
        water_intake: waterML / 1000,
        meals_count: getMealScore(),
        meditation_minutes: meditationMin,
        stress_level: stressLevel,
        anxiety_level: anxietyLevel,
        energy_level: energyLevel,
      };

      const res = await axios.post(`${BASE_URL}/wellness-log`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setScore(res.data.score);
      Alert.alert("Progress Saved", `Wellness log updated!`, [
        { text: "Great", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert("Error System", "Failed to preserve changes.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🌿 Daily Wellness</Text>

      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>Calculated Score: {score}/100</Text>
      </View>

      {/* Extracted Input Components */}
      <SleepInput value={sleepHours} onChange={setSleepHours} />
      
      <HydrationTracker 
        waterML={waterML} 
        onAdd={() => setWaterML(p => p + 250)} 
        onRemove={() => setWaterML(p => Math.max(0, p - 250))} 
      />

      <NutritionCheck 
        meals={meals} 
        mealKeys={MEAL_KEYS} 
        onToggleMeal={toggleMeal} 
        mealScore={getMealScore()} 
      />

      <MindfulnessInput value={meditationMin} onChange={setMeditationMin} />

      {/* Extracted Sliders Component */}
      <WellnessSliders
        stressLevel={stressLevel}
        setStressLevel={setStressLevel}
        anxietyLevel={anxietyLevel}
        setAnxietyLevel={setAnxietyLevel}
        energyLevel={energyLevel}
        setEnergyLevel={setEnergyLevel}
      />

      {/* ACTION SAVE BUTTON */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveData}>
        <Text style={styles.saveText}>Complete Records</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220", padding: 20 },
  loadingContainer: { flex: 1, backgroundColor: "#0b1220", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 5, marginTop: 10 },
  scoreBox: { marginTop: 15, marginBottom: 20, padding: 18, backgroundColor: "#1e293b", borderRadius: 16, alignItems: "center" },
  scoreText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  saveBtn: { backgroundColor: "#3b82f6", padding: 16, marginTop: 35, marginBottom: 80, borderRadius: 14, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default WellnessTracker;