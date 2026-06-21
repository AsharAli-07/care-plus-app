import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = { moodEmoji: string | null; moodText: string | null; onMoodPress: (e: string | null) => void };

export const MoodSelector: React.FC<Props> = ({ moodEmoji, moodText, onMoodPress }) => {
  const anims = useRef(["😄","🙂","😐","😕","😔"].map(() => new Animated.Value(1))).current;

  const moodColors: Record<string, string> = {
    "😄": "#4ade80", "🙂": "#86efac", "😐": "#facc15", "😕": "#fb923c", "😔": "#f87171",
  };

  const handlePress = (emoji: string, i: number) => {
    Animated.sequence([
      Animated.spring(anims[i], { toValue: 1.5, useNativeDriver: true }),
      Animated.spring(anims[i], { toValue: 1,   useNativeDriver: true }),
    ]).start();
    onMoodPress(emoji);
  };

  return (
    <BlurView intensity={50} tint="dark" style={s.card}>
      <LinearGradient colors={["rgba(74,222,128,0.06)", "transparent"]} style={StyleSheet.absoluteFill} />

      {moodEmoji ? (
        <View style={s.selectedWrap}>
          <View style={[s.circle, { borderColor: (moodColors[moodEmoji] || "#4ade80") + "80" }]}>
            <Text style={s.bigEmoji}>{moodEmoji}</Text>
          </View>
          <Text style={[s.moodLabel, { color: moodColors[moodEmoji] || "#fff" }]}>Feeling {moodText}</Text>
          <TouchableOpacity onPress={() => onMoodPress(null)} style={s.changeBtn}>
            <Ionicons name="refresh" size={11} color="#4ade80" />
            <Text style={s.changeTxt}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.pickerWrap}>
          <Text style={s.question}>How are you feeling today?</Text>
          <View style={s.emojiRow}>
            {["😄","🙂","😐","😕","😔"].map((e, i) => (
              <TouchableOpacity key={e} onPress={() => handlePress(e, i)} activeOpacity={0.7}>
                <Animated.View style={[s.emojiBtn, { transform: [{ scale: anims[i] }] }]}>
                  <Text style={s.emojiTxt}>{e}</Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </BlurView>
  );
};

const s = StyleSheet.create({
  card:         { borderRadius: 18, padding: 18, marginBottom: 14, overflow: "hidden", borderColor: "rgba(74,222,128,0.2)", borderWidth: 1 },
  selectedWrap: { alignItems: "center", paddingVertical: 6 },
  circle:       { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)", marginBottom: 8 },
  bigEmoji:     { fontSize: 40 },
  moodLabel:    { fontSize: 14, fontFamily: "Poppins_600SemiBold", marginBottom: 10 },
  changeBtn:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", borderWidth: 1 },
  changeTxt:    { color: "#4ade80", fontSize: 11, fontFamily: "Poppins_500Medium" },
  pickerWrap:   { alignItems: "center" },
  question:     { color: "#aaa", fontSize: 12, fontFamily: "Poppins_400Regular", marginBottom: 14 },
  emojiRow:     { flexDirection: "row", gap: 20 },
  emojiBtn:     { width: 35, height: 35, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1 },
  emojiTxt:     { fontSize: 20 },
});