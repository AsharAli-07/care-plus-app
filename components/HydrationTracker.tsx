import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

type HydrationTrackerProps = {
  waterML: number;
  onAdd: () => void;
  onRemove: () => void;
};

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({
  waterML,
  onAdd,
  onRemove,
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={styles.section}>Hydration Tracker</Text>

    <BlurView intensity={50} tint="dark" style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onRemove} style={styles.btn}>
          <Text style={styles.btnText}>− 250ml</Text>
        </TouchableOpacity>

        <Text style={styles.scoreText}>
          {(waterML / 1000).toFixed(2)} L
        </Text>

        <TouchableOpacity onPress={onAdd} style={styles.btn}>
          <Text style={styles.btnText}>+ 250ml</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 12,
    overflow: "hidden",
     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
    
  },

  section: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 15,
    fontFamily: "Poppins_500Medium",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  btn: {
   backgroundColor: "rgba(255,255,255,0.08)",
    padding: 10,
    borderRadius: 12,
    minWidth: 90,
    alignItems: "center",
     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  scoreText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
});