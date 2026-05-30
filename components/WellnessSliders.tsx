import React from "react";
import { Text, StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";

type WellnessSlidersProps = {
  stressLevel: number;
  setStressLevel: (val: number) => void;
  anxietyLevel: number;
  setAnxietyLevel: (val: number) => void;
  energyLevel: number;
  setEnergyLevel: (val: number) => void;
};

export const WellnessSliders: React.FC<WellnessSlidersProps> = ({
  stressLevel,
  setStressLevel,
  anxietyLevel,
  setAnxietyLevel,
  energyLevel,
  setEnergyLevel,
}) => {
  return (
    <View style={styles.container}>
      {/* STRESS SLIDER CONTAINER */}
      <Text style={styles.section}>😰 Stress Level ({stressLevel}/10)</Text>
      <Slider
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={stressLevel}
        onValueChange={setStressLevel}
        minimumTrackTintColor="#ef4444"
        maximumTrackTintColor="#334155"
      />

      {/* ANXIETY SLIDER */}
      <Text style={styles.section}>😟 Anxiety Level ({anxietyLevel}/10)</Text>
      <Slider
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={anxietyLevel}
        onValueChange={setAnxietyLevel}
        minimumTrackTintColor="#f97316"
        maximumTrackTintColor="#334155"
      />

      {/* ENERGY GAIN SLIDER */}
      <Text style={styles.section}>🔋 Energy Level ({energyLevel}/10)</Text>
      <Slider
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={energyLevel}
        onValueChange={setEnergyLevel}
        minimumTrackTintColor="#22c55e"
        maximumTrackTintColor="#334155"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  section: { color: "#e2e8f0", fontSize: 16, marginTop: 22, marginBottom: 10, fontWeight: "600" },
});