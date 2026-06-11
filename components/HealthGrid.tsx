import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from "expo-blur";

export const HealthGrid = ({ data }: any) => (
  <View style={styles.grid}>
     <BlurView intensity={40} tint="dark" style={styles.card}><Text style={styles.cardEmoji}>💤</Text><Text style={styles.cardTitle}>Sleep</Text><Text style={styles.cardValue}>{data?.sleep_hours || 0} hrs</Text></BlurView>
     <BlurView intensity={40} tint="dark" style={styles.card}><Text style={styles.cardEmoji}>💧</Text><Text style={styles.cardTitle}>Water</Text><Text style={styles.cardValue}>{data?.water_intake || 0} L</Text></BlurView>
     <BlurView intensity={40} tint="dark" style={styles.card}><Text style={styles.cardEmoji}>🍽</Text><Text style={styles.cardTitle}>Meals</Text><Text style={styles.cardValue}>{data?.meals_count || 0}/3</Text></BlurView>
     <BlurView intensity={40} tint="dark" style={styles.card}><Text style={styles.cardEmoji}>🧘</Text><Text style={styles.cardTitle}>Meditation</Text><Text style={styles.cardValue}>{data?.meditation_minutes || 0} min</Text></BlurView>
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },

card: {
  width: "48%",
  padding: 15,
  borderRadius: 12,
  marginBottom: 15,
  overflow: "hidden",
      borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
},

  cardEmoji: {
    fontSize: 24,
  },

  cardTitle: {
    color: "#ffffffff",
    marginTop: 8,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  cardValue: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    marginTop: 4,
  },
});