import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { BASE_URL } from "../api";

const Wellness = () => {

  const [preferences, setPreferences] = useState({
    sleep_goal: "8h",
    water_goal: "2L",

    mood_tracking: true,
    meal_tracking: true,
    meditation_reminder: false,
    journal_reminder: true,
    motivation_quotes: true,
    night_mode: false,
  });

  // =========================
  // LOAD PREFERENCES
  // =========================
  const loadPreferences = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/wellness-preferences`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ SAFE MERGE (IMPORTANT FIX)
      setPreferences(prev => ({
        ...prev,
        ...res.data,
      }));

    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  // =========================
  // UPDATE PREFERENCE
  // =========================
const updatePreference = async (key: string, value: any) => {
  let updated = {
    ...preferences,
    [key]: value,
  };

  const threeKeys = [
    "meditation_reminder",
    "journal_reminder",
    "motivation_quotes",
  ];

  // 🌙 IF NIGHT MODE TURNED ON → FORCE ALL 3 OFF
  if (key === "night_mode" && value === true) {
    updated.meditation_reminder = false;
    updated.journal_reminder = false;
    updated.motivation_quotes = false;
  }

  // 🌞 IF ANY OF 3 TURNED ON → NIGHT MODE OFF AUTOMATICALLY
  if (threeKeys.includes(key) && value === true) {
    updated.night_mode = false;
  }

  setPreferences(updated);

  try {
    const token = await AsyncStorage.getItem("token");

    await axios.put(
      `${BASE_URL}/wellness-preferences`,
      updated,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    console.log("UPDATE ERROR:", err);
  }
};

  // =========================
  // TOGGLE HELPERS (CLEAN)
  // =========================
  const toggleCycle = (current: string, values: string[]) => {
    const index = values.indexOf(current);
    return values[(index + 1) % values.length];
  };

  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        <ScrollView showsVerticalScrollIndicator={false}>

          <Text style={styles.heading}>
            Wellness Preferences
          </Text>

          {/* SLEEP GOAL */}
          <BlurView intensity={50} tint="prominent" style={styles.card}>
            <View style={styles.row}>

              <View>
                <Text style={styles.title}>Sleep Goal</Text>
                <Text style={styles.description}>
                  Target sleep duration
                </Text>
              </View>

              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() =>
                  updatePreference(
                    "sleep_goal",
                    toggleCycle(preferences.sleep_goal, ["6h", "7h", "8h"])
                  )
                }
              >
                <Text style={styles.optionText}>
                  {preferences.sleep_goal}
                </Text>
              </TouchableOpacity>

            </View>
          </BlurView>

          {/* WATER GOAL */}
          <BlurView intensity={50} tint="prominent" style={styles.card}>
            <View style={styles.row}>

              <View>
                <Text style={styles.title}>Water Goal</Text>
                <Text style={styles.description}>
                  Daily hydration target
                </Text>
              </View>

              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() =>
                  updatePreference(
                    "water_goal",
                    toggleCycle(preferences.water_goal, ["1L", "2L", "3L"])
                  )
                }
              >
                <Text style={styles.optionText}>
                  {preferences.water_goal}
                </Text>
              </TouchableOpacity>

            </View>
          </BlurView>

          {/* TOGGLES */}

          <PreferenceItem
            icon="happy-outline"
            title="Mood Tracking"
            description="Track your daily emotions"
            value={preferences.mood_tracking}
            onValueChange={(v: boolean) =>
              updatePreference("mood_tracking", v)
            }
          />

          <PreferenceItem
            icon="restaurant-outline"
            title="Meal Tracking"
            description="Healthy meal reminders"
            value={preferences.meal_tracking}
            onValueChange={(v: boolean) =>
              updatePreference("meal_tracking", v)
            }
          />

          <PreferenceItem
            icon="leaf-outline"
            title="Meditation Reminder"
            description="Daily calm breathing reminders"
            value={preferences.meditation_reminder}
            onValueChange={(v: boolean) =>
              updatePreference("meditation_reminder", v)
            }
          />

          <PreferenceItem
            icon="book-outline"
            title="Journal Reminder"
            description="Write your daily thoughts"
            value={preferences.journal_reminder}
            onValueChange={(v: boolean) =>
              updatePreference("journal_reminder", v)
            }
          />

          <PreferenceItem
            icon="sparkles-outline"
            title="Motivation Quotes"
            description="Positive daily inspiration"
            value={preferences.motivation_quotes}
            onValueChange={(v: boolean) =>
              updatePreference("motivation_quotes", v)
            }
          />

          <PreferenceItem
            icon="moon-outline"
            title="Night Wellness Mode"
            description="No late-night notifications"
            value={preferences.night_mode}
            onValueChange={(v: boolean) =>
              updatePreference("night_mode", v)
            }
          />

        </ScrollView>

      </View>
    </ImageBackground>
  );
};

export default Wellness;

// =========================
// ITEM COMPONENT
// =========================

const PreferenceItem = ({
  icon,
  title,
  description,
  value,
  onValueChange,
}: any) => {

  return (
    <BlurView
      intensity={50}
      tint="prominent"
      style={styles.card}
    >

      <View style={styles.row}>

        <View style={styles.leftSide}>

          <Ionicons
            name={icon}
            size={22}
            color="#fff"
          />

          <View style={{ marginLeft: 12 }}>

            <Text style={styles.title}>
              {title}
            </Text>

            <Text style={styles.description}>
              {description}
            </Text>

          </View>

        </View>

        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: "#555",
            true: "#555",
          }}
          thumbColor="#fff"
        />

      </View>

    </BlurView>
  );
};

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    paddingHorizontal: 20,
     paddingBottom: 5
  },

  heading: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
    alignSelf: "center",
    fontFamily: "Poppins_500Medium",
    marginTop: 20,
  },

  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    padding: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftSide: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  title: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },

  description: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },

  optionBtn: {
    backgroundColor: "#004927",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },

  optionText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },

});