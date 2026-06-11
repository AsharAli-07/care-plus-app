import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BlurView } from "expo-blur";

export const DashboardHeader = ({ data, moodEmoji, moodText, onMoodPress }: any) => {
  const getStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Attention";
  };

  return (
    <BlurView intensity={50} tint="dark" style={styles.headerCard}>
      <Text style={styles.title}>AI Wellness Dashboard</Text>
      <Text style={styles.score}>{data?.score || 0}/100</Text>
      <Text style={styles.status}>{getStatus(data?.score || 0)}</Text>

      {moodEmoji ? (
        <View style={{ alignItems: "center" }}>
          <Text style={styles.mood}>{moodEmoji}</Text>
          <Text style={styles.moodText}>{moodText}</Text>
        </View>
      ) : (
        <View style={{ alignItems: "center", marginTop: 15 }}>
          <Text style={styles.moodText}>How are you feeling today?</Text>
          <View style={styles.emojiRow}>
            {["😄", "🙂", "😐", "😕", "😔"].map((item) => (
              <TouchableOpacity key={item} onPress={() => onMoodPress(item)} style={styles.emojiButton}>
                <Text style={styles.emoji}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
     </BlurView>
  );
};

const styles = StyleSheet.create({
headerCard: {
  padding: 20,
  borderRadius: 12,
  alignItems: "center",
  marginBottom: 20,
  overflow: "hidden",
  borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
},

  title: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
  },

  score: {
    color: "#fff",
    fontSize: 40,
    fontFamily: "Poppins_500Medium",
    marginTop: 10,
  },

  status: {
    color: "#ddd",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 5,
  },

  mood: {
    fontSize: 50,
    marginTop: 10,
  },

  moodText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 5,
    textAlign: "center",
  },

  emojiRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  emojiButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  emoji: {
    fontSize: 26,
  },
});