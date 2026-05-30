import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Switch,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "expo-blur";
import { BASE_URL } from '../api';



type SettingsType = {
  mood_reminder: boolean;
  sleep_reminder: boolean;
  water_reminder: boolean;
  meal_reminder: boolean;
  notification_sound: boolean;
  notification_preview: boolean;
  quiet_mode: boolean;
};

const NotificationSettings = () => {

  const [settings, setSettings] = useState<SettingsType>({
    mood_reminder: true,
    sleep_reminder: true,
    water_reminder: true,
    meal_reminder: true,
    notification_sound: true,
    notification_preview: true,
    quiet_mode: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  // =========================
  // LOAD SETTINGS
  // =========================
  const loadSettings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/notification-settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data) {
        setSettings({
          mood_reminder: !!res.data.mood_reminder,
          sleep_reminder: !!res.data.sleep_reminder,
          water_reminder: !!res.data.water_reminder,
          meal_reminder: !!res.data.meal_reminder,
          notification_sound: !!res.data.notification_sound,
          notification_preview: !!res.data.notification_preview,
          quiet_mode: !!res.data.quiet_mode,
        });
      }

    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  // =========================
  // UPDATE SETTINGS
  // =========================
const updateSetting = async (key: keyof SettingsType, value: boolean) => {
  try {
    let updated = { ...settings, [key]: value };

    // 🔥 IF USER TURNS ON QUIET MODE
    if (key === "quiet_mode" && value === true) {
      updated = {
        mood_reminder: false,
        sleep_reminder: false,
        water_reminder: false,
        meal_reminder: false,
        notification_sound: false,
        notification_preview: false,
        quiet_mode: true,
      };
    }

    // 🔥 IF ANY OTHER SWITCH IS TURNED ON → QUIET MODE OFF
    if (key !== "quiet_mode" && value === true) {
      updated.quiet_mode = false;
    }

    setSettings(updated);

    const token = await AsyncStorage.getItem("token");

    await axios.put(
      `${BASE_URL}/notification-settings`,
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


  const toggleQuietMode = async (value: boolean) => {
  const updated = {
    ...settings,
    quiet_mode: value,

    mood_reminder: value ? false : settings.mood_reminder,
    sleep_reminder: value ? false : settings.sleep_reminder,
    water_reminder: value ? false : settings.water_reminder,
    meal_reminder: value ? false : settings.meal_reminder,
    notification_sound: value ? false : settings.notification_sound,
    notification_preview: value ? false : settings.notification_preview,
  };

  setSettings(updated);

  const token = await AsyncStorage.getItem("token");

  await axios.put(
    `${BASE_URL}/notification-settings`,
    updated,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};


  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={{ flex: 1 }}
    >
      <View style={styles.overlay}>

        <ScrollView showsVerticalScrollIndicator={false}>

          <Text style={styles.heading}>
            Notifications
          </Text>

          {/* BEHAVIOR SETTINGS */}
          <NotificationItem
            title="Mood Reminders"
            description="Track your daily mood"
            value={settings.mood_reminder}
            onValueChange={(v: boolean) =>
              updateSetting("mood_reminder", v)
            }
          />

          <NotificationItem
            title="Sleep Reminders"
            description="Healthy sleep routine alerts"
            value={settings.sleep_reminder}
            onValueChange={(v: boolean) =>
              updateSetting("sleep_reminder", v)
            }
          />

          <NotificationItem
            title="Water Reminders"
            description="Stay hydrated"
            value={settings.water_reminder}
            onValueChange={(v: boolean) =>
              updateSetting("water_reminder", v)
            }
          />

          <NotificationItem
            title="Meal Reminders"
            description="Don’t skip meals"
            value={settings.meal_reminder}
            onValueChange={(v: boolean) =>
              updateSetting("meal_reminder", v)
            }
          />

          {/* DEVICE SETTINGS */}
          <NotificationItem
            title="Notification Sound"
            description="Play sound on notification"
            value={settings.notification_sound}
            onValueChange={(v: boolean) =>
              updateSetting("notification_sound", v)
            }
          />

          <NotificationItem
            title="Notification Preview"
            description="Show message preview"
            value={settings.notification_preview}
            onValueChange={(v: boolean) =>
              updateSetting("notification_preview", v)
            }
          />

          <NotificationItem
            title="Quiet Mode"
            description="Disable notifications at night"
            value={settings.quiet_mode}
            onValueChange={toggleQuietMode}
          />

        </ScrollView>

      </View>
    </ImageBackground>
  );
};

export default NotificationSettings;

const NotificationItem = ({
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

      <View style={{ flex: 1 }}>

        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>

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

    </BlurView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    paddingHorizontal: 20,
    
  },

  heading: {
    marginTop: 20,
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
    alignSelf: "center",
    fontFamily: "Poppins_500Medium",
  },

  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },

  description: {
    color: "#ccc",
    fontSize: 11,
    marginTop: 3,
    width: "90%",
    fontFamily: "Poppins_400Regular",
  },
});