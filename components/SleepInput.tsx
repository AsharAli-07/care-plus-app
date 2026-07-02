// import React from "react";
// import { View, Text, TextInput, StyleSheet } from "react-native";

// type SleepInputProps = {
//   value: number;
//   onChange: (hours: number) => void;
// };

// export const SleepInput: React.FC<SleepInputProps> = ({
//   value,
//   onChange,
// }) => (
//   <View style={styles.container}>
//     <Text style={styles.section}>Sleep Hours</Text>

//     <TextInput
//       placeholder="Enter sleep hours"
//       placeholderTextColor="#ffffffff"
//       keyboardType="numeric"
//       value={value === 0 ? "" : value.toString()}
//       onChangeText={(v) =>
//         onChange(Number(v.replace(/[^0-9.]/g, "")))
//       }
//       style={styles.input}
//     />
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 20,
//   },

//   section: {
//     color: "#fff",
//     fontSize: 20,
//     marginBottom: 15,
//     fontFamily: "Poppins_500Medium",
//   },

//   input: {
//   width: "100%",
//   padding: 10,

//   borderRadius: 12,
//   backgroundColor: "rgba(255,255,255,0.08)",

//   color: "#fff",
//   fontSize: 12,
//   fontFamily: "Poppins_400Regular",
//   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
//   },
// });
import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type Props = { value: number; onChange: (h: number) => void; goal: number };

export const SleepInput: React.FC<Props> = ({ value, onChange, goal }) => {
  // build presets around the goal
  const presets = Array.from({ length: 5 }, (_, i) => Math.max(1, goal - 2 + i));

  return (
    <View style={s.card}>
      <View style={s.goalRow}>
        <Text style={s.goalTxt}>Goal: {goal}h</Text>
        <View style={[s.goalBadge, { borderColor: value >= goal ? "#4ade80" : "rgba(167,139,250,0.4)" }]}>
          <Text style={[s.goalBadgeTxt, { color: value >= goal ? "#4ade80" : "#a78bfa" }]}>
            {value >= goal ? "✓ Reached" : `${(goal - value).toFixed(1)}h left`}
          </Text>
        </View>
      </View>
      <View style={s.row}>
        <TouchableOpacity style={s.btn} onPress={() => onChange(Math.max(0, value - 0.5))}>
          <Ionicons name="remove" size={18} color="#a78bfa" />
        </TouchableOpacity>
        <View style={s.center}>
          <Text style={s.value}>{value === 0 ? "—" : `${value}h`}</Text>
          <Text style={s.sub}>hours of sleep</Text>
        </View>
        <TouchableOpacity style={s.btn} onPress={() => onChange(Math.min(12, value + 0.5))}>
          <Ionicons name="add" size={18} color="#a78bfa" />
        </TouchableOpacity>
      </View>
      {/* Progress toward goal */}
      <View style={s.track}>
        <View style={[s.fill, {
          width: `${Math.min((value / goal) * 100, 100)}%`,
          backgroundColor: value >= goal ? "#4ade80" : "#a78bfa",
        }]} />
      </View>
      <View style={s.presets}>
        {presets.map(h => (
          <TouchableOpacity
            key={h}
            style={[s.preset, value === h && s.presetActive]}
            onPress={() => onChange(h)}
          >
            <Text style={[s.presetTxt, value === h && { color: "#a78bfa" }]}>{h}h</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card:         { borderRadius: 25, padding: 15, marginBottom: 30, borderColor: "rgba(167,139,250,0.3)", borderWidth: 1, overflow: "hidden", backgroundColor: '#0a00274d' },
  goalRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  goalTxt:      { color: "#999", fontSize: 11, fontFamily: "Poppins_400Regular" },
  goalBadge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, backgroundColor: "rgba(167,139,250,0.1)" },
  goalBadgeTxt: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  row:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  btn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(167,139,250,0.12)", alignItems: "center", justifyContent: "center", borderColor: "rgba(167,139,250,0.3)", borderWidth: 1 },
  center:       { alignItems: "center" },
  value:        { color: "#fff", fontSize: 32, fontFamily: "Poppins_700Bold" },
  sub:          { color: "#999", fontSize: 10, fontFamily: "Poppins_400Regular" },
  track:        { height: 5, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, marginTop: 12, marginBottom: 12, overflow: "hidden" },
  fill:         { height: 5, borderRadius: 3 },
  presets:      { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  preset:       { flex: 1, padding: 7, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1 },
  presetActive: { backgroundColor: "rgba(167,139,250,0.18)", borderColor: "rgba(167,139,250,0.5)" },
  presetTxt:    { color: "#999", fontSize: 11, fontFamily: "Poppins_500Medium" },
});