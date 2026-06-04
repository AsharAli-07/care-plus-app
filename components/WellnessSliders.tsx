import React from "react";
import { Text, StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";

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
    <View style={styles.wrapper}>

      {/* MAIN HEADING */}
      <Text style={styles.mainTitle}>🧠 Mental Wellness</Text>

      <BlurView intensity={50} tint="prominent" style={styles.container}>

        {/* STRESS */}
        <Text style={styles.section}>
          😰 Stress Level ({stressLevel}/10)
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={stressLevel}
          onValueChange={setStressLevel}
          minimumTrackTintColor="#ef4444"
          maximumTrackTintColor="#334155"
           thumbTintColor="#ef4444"

        />

        {/* ANXIETY */}
        <Text style={[styles.section, { marginTop: 15 }]}>
          😟 Anxiety Level ({anxietyLevel}/10)
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={anxietyLevel}
          onValueChange={setAnxietyLevel}
          minimumTrackTintColor="#f97316"
          maximumTrackTintColor="#334155"
           thumbTintColor="#f97316"
        />

        {/* ENERGY */}
     <Text style={[styles.section, { marginTop: 15 }]}>
          🔋 Energy Level ({energyLevel}/10)
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={energyLevel}
          onValueChange={setEnergyLevel}
          minimumTrackTintColor="#22c55e"
          maximumTrackTintColor="#334155"
            thumbTintColor="#22c55e"
        />

      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },

  mainTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 15,
  },

  container: {
    padding: 15,
    borderRadius: 12,
    overflow: "hidden",
  },

  section: {
    color: "#fff",
    fontSize: 12,
   
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
});