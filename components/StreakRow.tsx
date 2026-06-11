import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from "expo-blur";

export const StreakRow = ({ current, longest }: any) => (
  <View style={styles.row}>
    <BlurView intensity={40} tint="dark" style={styles.card}>
  <Text style={styles.emoji}>🔥</Text>
  <Text style={styles.number}>{current}</Text>
  <Text style={styles.label}>Current Streak</Text>
</BlurView>
   <BlurView intensity={40} tint="dark" style={styles.card}>
  <Text style={styles.emoji}>🏆</Text>
  <Text style={styles.number}>{longest}</Text>
  <Text style={styles.label}>Longest Streak</Text>
</BlurView>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },

  emoji: {
    fontSize: 24,
  },

  number: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    marginTop: 5,
  },

  label: {
    color: "#ffffffff",
    marginTop: 5,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
});