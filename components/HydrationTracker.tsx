import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type Props = { waterML: number; onAdd: () => void; onRemove: () => void; goalL: number };

export const HydrationTracker: React.FC<Props> = ({ waterML, onAdd, onRemove, goalL }) => {
  const liters   = waterML / 1000;
  const pct      = Math.min(liters / goalL, 1);
  const cups     = Math.round(waterML / 250);
  const totalCups= Math.round((goalL * 1000) / 250); // e.g. 2L → 8 cups, 3L → 12

  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <View>
          <Text style={s.value}>{liters.toFixed(2)}<Text style={s.unit}> L</Text></Text>
          <Text style={s.sub}>of {goalL}L goal</Text>
        </View>
        <View style={[s.pctBadge, { borderColor: pct >= 1 ? "#4ade80" : "rgba(52,211,153,0.4)" }]}>
          <Text style={[s.pctTxt, { color: pct >= 1 ? "#4ade80" : "#34d399" }]}>
            {pct >= 1 ? "✓ Goal met!" : `${Math.round(pct * 100)}%`}
          </Text>
        </View>
      </View>
      <View style={s.track}>
        <View style={[s.fill, {
          width: `${pct * 100}%`,
          backgroundColor: pct >= 1 ? "#4ade80" : "#34d399",
        }]} />
      </View>
      <View style={s.cupsGrid}>
        {Array.from({ length: totalCups }).map((_, i) => (
          <View key={i} style={[s.cup, i < cups && s.cupFilled]}>
            <Text style={{ fontSize: 14 }}>{i < cups ? "💧" : "○"}</Text>
          </View>
        ))}
      </View>
      <View style={s.btnRow}>
        <TouchableOpacity style={s.btn} onPress={onRemove}>
          <Ionicons name="remove" size={16} color="#34d399" />
          <Text style={s.btnTxt}>250ml</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.btnAdd]} onPress={onAdd}>
          <Ionicons name="add" size={16} color="#34d399" />
          <Text style={[s.btnTxt, { color: "#34d399" }]}>250ml</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card:      { borderRadius: 25, padding: 15, marginBottom: 30, borderColor: "rgba(52,211,153,0.3)", borderWidth: 1, overflow: "hidden", backgroundColor: "rgba(0,26,17,0.53)",shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, shadowColor: "#004927" },
  topRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  value:     { color: "#fff", fontSize: 28, fontFamily: "Poppins_700Bold" },
  unit:      { fontSize: 14, color: "#888" },
  sub:       { color: "#888", fontSize: 10, fontFamily: "Poppins_400Regular" },
  pctBadge:  { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: "rgba(52,211,153,0.15)", borderColor: "rgba(52,211,153,0.4)", borderWidth: 1 },
  pctTxt:    { color: "#34d399", fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  track:     { height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 14, overflow: "hidden" },
  fill:      { height: 6, backgroundColor: "#34d399", borderRadius: 3 },
  cupsGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 14 },
  cup:       { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  cupFilled: { backgroundColor: "rgba(52,211,153,0.15)" },
  btnRow:    { flexDirection: "row", gap: 10 },
  btn:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(52,211,153,0.2)", borderWidth: 1 },
  btnAdd:    { backgroundColor: "rgba(52,211,153,0.1)", borderColor: "rgba(52,211,153,0.4)" },
  btnTxt:    { color: "#aaa", fontSize: 12, fontFamily: "Poppins_500Medium" },
});