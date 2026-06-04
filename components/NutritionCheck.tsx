import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

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
  <View style={styles.wrapper}>
    <Text style={styles.section}>🍽 Nutrition Check</Text>

    <BlurView intensity={50} tint="prominent" style={styles.container}>
      {mealKeys.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => onToggleMeal(item)}
          style={[
            styles.mealCard,
            meals[item] && styles.mealActive,
          ]}
        >
          <Text style={styles.mealText}>{item.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.info}>
        Logged Meals Progress: {mealScore}/3
      </Text>
    </BlurView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },

  section: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 15,
    fontFamily: "Poppins_500Medium",
  },

  container: {
    padding: 15,
    borderRadius: 12,
    overflow: "hidden",
  },

  mealCard: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 15,
    alignItems: "center",
  },

  mealActive: {
    backgroundColor: "#004927ff",
  },

  mealText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  info: {
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
});