import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type MealsType  = { breakfast: boolean; lunch: boolean; dinner: boolean };
type MealKey    = "breakfast" | "lunch" | "dinner";
type Props      = { meals: MealsType; mealKeys: readonly MealKey[]; onToggleMeal: (k: MealKey) => void; mealScore: number };

const MEAL_META: Record<MealKey, { emoji: string; time: string; color: string }> = {
  breakfast: { emoji: "🌅", time: "Morning",   color: "#facc15" },
  lunch:     { emoji: "☀️", time: "Afternoon", color: "#fb923c" },
  dinner:    { emoji: "🌙", time: "Evening",   color: "#a78bfa" },
};

export const NutritionCheck: React.FC<Props> = ({ meals, mealKeys, onToggleMeal, mealScore }) => (
  <BlurView intensity={40} tint="dark" style={s.card}>
    <View style={s.topRow}>
      <Text style={s.progress}>{mealScore}/3 meals logged</Text>
      <View style={s.badge}>
        <Text style={s.badgeTxt}>{Math.round((mealScore / 3) * 100)}%</Text>
      </View>
    </View>
    <View style={s.track}>
      <View style={[s.fill, { width: `${(mealScore / 3) * 100}%` }]} />
    </View>
    <View style={s.mealRow}>
      {mealKeys.map(key => {
        const meta = MEAL_META[key];
        const active = meals[key];
        return (
          <TouchableOpacity key={key} onPress={() => onToggleMeal(key)} activeOpacity={0.7} style={[s.mealCard, active && { borderColor: meta.color + "60", backgroundColor: meta.color + "12" }]}>
            <Text style={s.mealEmoji}>{meta.emoji}</Text>
            <Text style={[s.mealName, active && { color: meta.color }]}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <Text style={s.mealTime}>{meta.time}</Text>
            <View style={[s.check, active && { backgroundColor: meta.color }]}>
              <Ionicons name={active ? "checkmark" : "add"} size={12} color="#fff" />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  </BlurView>
);

const s = StyleSheet.create({
  card:     { borderRadius: 16, padding: 16, marginBottom: 14, borderColor: "rgba(251,146,60,0.3)", borderWidth: 1, overflow: "hidden" },
  topRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  progress: { color: "#ccc", fontSize: 12, fontFamily: "Poppins_400Regular" },
  badge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: "rgba(251,146,60,0.15)", borderColor: "rgba(251,146,60,0.4)", borderWidth: 1 },
  badgeTxt: { color: "#fb923c", fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  track:    { height: 5, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 14, overflow: "hidden" },
  fill:     { height: 5, backgroundColor: "#fb923c", borderRadius: 3 },
  mealRow:  { flexDirection: "row", gap: 8 },
  mealCard: { flex: 1, padding: 12, borderRadius: 14, alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1 },
  mealEmoji:{ fontSize: 22, marginBottom: 4 },
  mealName: { color: "#ccc", fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  mealTime: { color: "#666", fontSize: 9,  fontFamily: "Poppins_400Regular", marginTop: 2 },
  check:    { width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginTop: 8 },
});