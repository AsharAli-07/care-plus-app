import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground, StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";


// Components
import { SleepInput } from "../components/SleepInput";
import { HydrationTracker } from "../components/HydrationTracker";
import { NutritionCheck } from "../components/NutritionCheck";
import { MindfulnessInput } from "../components/MindfulnessInput";
import { WellnessSliders } from "../components/WellnessSliders";

type MealsType = { breakfast: boolean; lunch: boolean; dinner: boolean };
const MEAL_KEYS = ["breakfast", "lunch", "dinner"] as const;
type MealKey = typeof MEAL_KEYS[number];

const WellnessTracker = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);

  const [sleepHours, setSleepHours] = useState<number>(0);
  const [waterML, setWaterML] = useState<number>(0);
  const [meditationMin, setMeditationMin] = useState<number>(0);
  const [meals, setMeals] = useState<MealsType>({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
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
      setMeals({
        breakfast: mc >= 1,
        lunch: mc >= 2,
        dinner: mc >= 3,
      });

      setStressLevel(Number(data.stress_level ?? 0));
      setAnxietyLevel(Number(data.anxiety_level ?? 0));
      setEnergyLevel(Number(data.energy_level ?? 5));
      setScore(Number(data.score || 0));
    } catch (err) {
      console.log("Tracker Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayData();
  }, []);

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

      Alert.alert("Progress Saved", "Wellness log updated!", [
        { text: "Great", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to save data");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
         <StatusBar barStyle="light-content" />
         <LinearGradient
                colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.glowTop} />
      <View style={styles.overlay}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View>

            <Text style={styles.title}>Daily Wellness</Text>

            <BlurView intensity={50} tint="dark" style={styles.scoreBox}>
              <Text style={styles.scoreText}>
                Calculated Score: {score}/100
              </Text>
            </BlurView>

            <SleepInput value={sleepHours} onChange={setSleepHours} />

            <HydrationTracker
              waterML={waterML}
              onAdd={() => setWaterML((p) => p + 250)}
              onRemove={() => setWaterML((p) => Math.max(0, p - 250))}
            />

            <NutritionCheck
              meals={meals}
              mealKeys={MEAL_KEYS}
              onToggleMeal={toggleMeal}
              mealScore={getMealScore()}
            />

            <MindfulnessInput
              value={meditationMin}
              onChange={setMeditationMin}
            />

            <WellnessSliders
              stressLevel={stressLevel}
              setStressLevel={setStressLevel}
              anxietyLevel={anxietyLevel}
              setAnxietyLevel={setAnxietyLevel}
              energyLevel={energyLevel}
              setEnergyLevel={setEnergyLevel}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveData}>
              <Text style={styles.saveText}>Update</Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default WellnessTracker;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: '100%',
    width: '100%'
  },
  glowTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)",
    pointerEvents: "none",
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
    textAlign: 'center',
    marginTop: 20
  },

  scoreBox: {
    marginVertical: 20,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },

  scoreText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },

  saveBtn: {
  backgroundColor: "#004927ff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",
  marginTop: 10,
  marginBottom: 80,
  borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },

  saveText: {
    color: "#fff",
  fontSize: 12,
  fontFamily: 'Poppins_400Regular'
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b1220",
  },
});