import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type MealsType = {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

type NutritionCheckProps = {
  meals: MealsType;
  mealKeys: readonly ("breakfast" | "lunch" | "dinner")[];
  onToggleMeal: (key: "breakfast" | "lunch" | "dinner") => void;
  mealScore: number;
};

export const NutritionCheck: React.FC<NutritionCheckProps> = ({
  meals,
  mealKeys,
  onToggleMeal,
  mealScore,
}) => (
  <View style={styles.container}>
    <Text style={styles.section}>🍽 Nutrition Check</Text>
    {mealKeys.map((item) => (
      <TouchableOpacity
        key={item}
        onPress={() => onToggleMeal(item)}
        style={[styles.mealBtn, meals[item] && styles.mealActive]}
      >
        <Text style={styles.mealText}>{item.toUpperCase()}</Text>
      </TouchableOpacity>
    ))}
    <Text style={styles.info}>Logged Meals Progress: {mealScore}/3</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  section: { color: "#e2e8f0", fontSize: 16, marginBottom: 10, fontWeight: "600" },
  mealBtn: { padding: 14, backgroundColor: "#111827", marginVertical: 6, borderRadius: 12 },
  mealActive: { backgroundColor: "#22c55e" },
  mealText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  info: { color: "#94a3b8", marginTop: 5, fontSize: 13 },
});