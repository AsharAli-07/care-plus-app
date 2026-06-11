import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export const MentalMetrics = ({ data }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Mental Wellness</Text>

    <BlurView intensity={50} tint="dark" style={styles.metric}>
      <Text style={styles.text}>Stress Level</Text>
      <Text style={styles.value}>
        {data?.stress_level || 0}/10
      </Text>
    </BlurView>

    <BlurView intensity={50} tint="dark" style={styles.metric}>
      <Text style={styles.text}>Anxiety Level</Text>
      <Text style={styles.value}>
        {data?.anxiety_level || 0}/10
      </Text>
    </BlurView>

    <BlurView intensity={50} tint="dark" style={styles.metric}>
      <Text style={styles.text}>Energy Level</Text>
      <Text style={styles.value}>
        {data?.energy_level || 0}/10
      </Text>
    </BlurView>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginTop: 5,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    marginBottom: 15,
  },

  metric: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
        borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },

  text: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  value: {
    color: "#ffffffff",
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
});