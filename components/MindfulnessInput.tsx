// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { BlurView } from "expo-blur";
// import { Ionicons } from "@expo/vector-icons";

// type Props = { value: number; onChange: (m: number) => void };

// export const MindfulnessInput: React.FC<Props> = ({ value, onChange }) => {
//   const presets = [5, 10, 15, 20, 30];
//   return (
//     <View style={s.card}>
//       <View style={s.row}>
//         <TouchableOpacity style={s.btn} onPress={() => onChange(Math.max(0, value - 5))}>
//           <Ionicons name="remove" size={18} color="#60a5fa" />
//         </TouchableOpacity>
//         <View style={s.center}>
//           <Text style={s.value}>{value === 0 ? "—" : `${value}`}</Text>
//           <Text style={s.sub}>minutes meditated</Text>
//         </View>
//         <TouchableOpacity style={s.btn} onPress={() => onChange(value + 5)}>
//           <Ionicons name="add" size={18} color="#60a5fa" />
//         </TouchableOpacity>
//       </View>
//       <View style={s.presets}>
//         {presets.map(m => (
//           <TouchableOpacity
//             key={m}
//             style={[s.preset, value === m && s.presetActive]}
//             onPress={() => onChange(m)}
//           >
//             <Text style={[s.presetTxt, value === m && { color: "#60a5fa" }]}>{m}m</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// };

// const s = StyleSheet.create({
//   card:         { borderRadius: 25, padding: 15, marginBottom: 30, borderColor: "rgba(96,165,250,0.3)", borderWidth: 1, overflow: "hidden", backgroundColor: "rgba(0, 32, 71, 0.3)" , shadowColor: "#rgba(0, 32, 71, 1)", shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,},
//   row:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   btn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(96,165,250,0.12)", alignItems: "center", justifyContent: "center", borderColor: "rgba(96,165,250,0.3)", borderWidth: 1 },
//   center:       { alignItems: "center" },
//   value:        { color: "#fff", fontSize: 32, fontFamily: "Poppins_700Bold" },
//   sub:          { color: "#999", fontSize: 10, fontFamily: "Poppins_400Regular" },
//   presets:      { flexDirection: "row", justifyContent: "space-between", marginTop: 14, gap: 6 },
//   preset:       { flex: 1, padding: 7, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1 },
//   presetActive: { backgroundColor: "rgba(96,165,250,0.18)", borderColor: "rgba(96,165,250,0.5)" },
//   presetTxt:    { color: "#999", fontSize: 12, fontFamily: "Poppins_500Medium" },
// });

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = { value: number; onChange: (m: number) => void };

export const MindfulnessInput: React.FC<Props> = ({ value, onChange }) => {
  const presets = [5, 10, 15, 20, 30];
  return (
    <View style={s.card}>
      <View style={s.row}>
        <TouchableOpacity style={s.btn} onPress={() => onChange(Math.max(0, value - 5))}>
          <Ionicons name="remove" size={18} color="#4ade80" />
        </TouchableOpacity>
        <View style={s.center}>
          <Text style={s.value}>{value === 0 ? "—" : `${value}`}</Text>
          <Text style={s.sub}>minutes meditated</Text>
        </View>
        <TouchableOpacity style={s.btn} onPress={() => onChange(value + 5)}>
          <Ionicons name="add" size={18} color="#4ade80" />
        </TouchableOpacity>
      </View>
      <View style={s.presets}>
        {presets.map(m => (
          <TouchableOpacity
            key={m}
            style={[s.preset, value === m && s.presetActive]}
            onPress={() => onChange(m)}
          >
            <Text style={[s.presetTxt, value === m && { color: "#4ade80" }]}>{m}m</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card:         { borderRadius: 25, padding: 20, marginBottom: 30, borderColor: "rgba(74,222,128,0.3)", borderWidth: 1, overflow: "hidden", backgroundColor: "rgba(0, 26, 17, 0.50)" },
  row:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  btn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(74,222,128,0.12)", alignItems: "center", justifyContent: "center", borderColor: "rgba(74,222,128,0.3)", borderWidth: 1 },
  center:       { alignItems: "center" },
  value:        { color: "#fff", fontSize: 25, fontFamily: "Poppins_700Bold" },
  sub:          { color: "#999", fontSize: 10, fontFamily: "Poppins_400Regular" },
  presets:      { flexDirection: "row", justifyContent: "space-between", marginTop: 14, gap: 15 },
  preset:       { flex: 1, padding: 7, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1 },
  presetActive: { backgroundColor: "rgba(74,222,128,0.18)", borderColor: "rgba(74,222,128,0.5)" },
  presetTxt:    { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular" },
});