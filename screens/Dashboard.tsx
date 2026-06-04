import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

import { DashboardHeader } from "../components/DashboardHeader";
import { StreakRow } from "../components/StreakRow";
import { HealthGrid } from "../components/HealthGrid";
import { MentalMetrics } from "../components/MentalMetrics";
import { InfoSections } from "../components/InfoSections";

const Dashboard = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [localMoodEmoji, setLocalMoodEmoji] = useState<string | null>(null);
  const [localMoodText, setLocalMoodText] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadDashboard = async () => {
        try {
          const token = await AsyncStorage.getItem("token");

          const res = await axios.get(`${BASE_URL}/wellness-dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setData(res.data);

          if (res.data?.mood) {
            setLocalMoodEmoji(res.data.mood.emoji);
            setLocalMoodText(res.data.mood.text);
          }
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };

      loadDashboard();
    }, [])
  );

  const handleEmojiPress = async (item: string) => {
    const moodMap: Record<string, string> = {
      "😄": "Happy",
      "🙂": "Good",
      "😐": "Neutral",
      "😕": "Sad",
      "😔": "Very Sad",
    };

    try {
      setLocalMoodEmoji(item);
      setLocalMoodText(moodMap[item]);

      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/mood`,
        { mood_emoji: item },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={styles.loading}
      >
        <ActivityIndicator size="large" color="#fff" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          data={data}
          moodEmoji={localMoodEmoji}
          moodText={localMoodText}
          onMoodPress={handleEmojiPress}
        />

        <StreakRow
          current={data?.streaks?.current || 0}
          longest={data?.streaks?.longest || 0}
        />

        <HealthGrid data={data} />

        <MentalMetrics data={data} />

        <InfoSections data={data} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: '100%',
    width: '100%'
  },

  scrollContainer: {
    padding: 20,


  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Dashboard;