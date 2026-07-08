// import React from "react";
// import { View, Text, StyleSheet } from "react-native";
// import Slider from "@react-native-community/slider";
// import { BlurView } from "expo-blur";

// type Props = {
//   stressLevel: number;  setStressLevel: (v: number) => void;
//   anxietyLevel: number; setAnxietyLevel: (v: number) => void;
//   energyLevel: number;  setEnergyLevel: (v: number) => void;
// };

// const SliderRow = ({ label, value, onChange, color, invert }: any) => {
//   const score = invert ? 10 - value : value;
//   const statusColor = score >= 7 ? "#4ade80" : score >= 4 ? "#facc15" : "#f87171";
//   return (
//     <View style={sl.row}>
//       <View style={sl.labelRow}>
//         <Text style={sl.label}>{label}</Text>
//         <View style={[sl.pill, { backgroundColor: statusColor + "20", borderColor: statusColor + "60" }]}>
//           <Text style={[sl.pillTxt, { color: statusColor }]}>{value}/10</Text>
//         </View>
//       </View>
//       <Slider
//         minimumValue={0} maximumValue={10} step={1}
//         value={value} onValueChange={onChange}
//         minimumTrackTintColor={color}
//         maximumTrackTintColor="rgba(255,255,255,0.08)"
//         thumbTintColor={color}
//         style={{ height: 32 }}
//       />
//       <View style={sl.ticks}>
//         {[0,2,4,6,8,10].map(t => (
//           <Text key={t} style={sl.tick}>{t}</Text>
//         ))}
//       </View>
//     </View>
//   );
// };

// export const WellnessSliders: React.FC<Props> = ({
//   stressLevel, setStressLevel, anxietyLevel, setAnxietyLevel, energyLevel, setEnergyLevel,
// }) => (
//   <View style={sl.card}>
//     <SliderRow label="😤 Stress Level"  value={stressLevel}  onChange={setStressLevel}  color="#f87171" invert />
//     <SliderRow label="😰 Anxiety Level" value={anxietyLevel} onChange={setAnxietyLevel} color="#fb923c" invert />
//     <SliderRow label="⚡ Energy Level"  value={energyLevel}  onChange={setEnergyLevel}  color="#4ade80" />
//   </View>
// );

// const sl = StyleSheet.create({
//   card:     { borderRadius: 25, padding: 15, marginBottom: 14, borderColor: "rgba(248, 113, 113, 0.17)", borderWidth: 1, overflow: "hidden",  shadowColor: "rgba(248,113,113,0.25)", shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, backgroundColor: "rgba(39, 0, 0, 0.25)"},
//   row:      { marginBottom: 16 },
//   labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
//   label:    { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular" },
//   pill:     { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
//   pillTxt:  { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
//   ticks:    { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
//   tick:     { color: "#999", fontSize: 9, fontFamily: "Poppins_400Regular" },
// });

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  stressLevel: number;  setStressLevel: (v: number) => void;
  anxietyLevel: number; setAnxietyLevel: (v: number) => void;
  energyLevel: number;  setEnergyLevel: (v: number) => void;
};

const SliderRow = ({
  label,
  icon,
  iconColor,
  value,
  onChange,
  invert,
}: any) => {
  const score = invert ? 10 - value : value;
  const statusColor =
    score >= 7 ? "#4ade80" : score >= 4 ? "#facc15" : "#f87171";

  return (
    <View style={sl.row}>
      <View style={sl.labelRow}>
      <View style={sl.labelWrap}>
      <Ionicons
  name={icon}
  size={18}
  color={iconColor}
  style={{ marginRight: 10 }}
/>
  <Text style={[sl.label, { color: iconColor }]}>{label}</Text>
    
</View>
        <View
          style={[
            sl.pill,
            {
              backgroundColor: statusColor + "20",
              borderColor: statusColor + "60",
            },
          ]}
        >
          <Text style={[sl.pillTxt, { color: statusColor }]}>
            {value}/10
          </Text>
        </View>
      </View>

      <Slider
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={statusColor}
        maximumTrackTintColor="rgba(255,255,255,0.08)"
        thumbTintColor={statusColor}
        style={{ height: 32 }}
      />

      <View style={sl.ticks}>
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <Text key={t} style={sl.tick}>
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
};

export const WellnessSliders: React.FC<Props> = ({
  stressLevel, setStressLevel, anxietyLevel, setAnxietyLevel, energyLevel, setEnergyLevel,
}) => (
<View style={sl.card}>
  <SliderRow
    icon="pulse-outline"
    iconColor="#f97316"   // Orange (Stress)
    label="Stress Level"
    value={stressLevel}
    onChange={setStressLevel}
    invert
  />

  <SliderRow
    icon="cloud-outline"
    iconColor="#ef4444"   // Red (Anxiety)
    label="Anxiety Level"
    value={anxietyLevel}
    onChange={setAnxietyLevel}
    invert
  />

  <SliderRow
    icon="flash-outline"
    iconColor="#facc15"   // Yellow (Energy)
    label="Energy Level"
    value={energyLevel}
    onChange={setEnergyLevel}
  />
</View>
);

const sl = StyleSheet.create({
  card:     { borderRadius: 25, padding: 20, marginBottom: 14, borderColor: "rgba(74,222,128,0.3)", borderWidth: 1, overflow: "hidden", backgroundColor: "rgba(0, 26, 17, 0.50)" },
  row:      { marginBottom: 15 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  label:    { fontSize: 12, fontFamily: "Poppins_400Regular",  },
  pill:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  pillTxt:  { fontSize: 10, fontFamily: "Poppins_400Regular" },
  ticks:    { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
  tick:     { color: "#999", fontSize: 9, fontFamily: "Poppins_400Regular" },
  labelWrap: {
  flexDirection: "row",
  alignItems: "center",
},
});