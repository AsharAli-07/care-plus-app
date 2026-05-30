import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type HydrationTrackerProps = {
  waterML: number;
  onAdd: () => void;
  onRemove: () => void;
};

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({ waterML, onAdd, onRemove }) => (
  <View style={styles.container}>
    <Text style={styles.section}>💧 Hydration Tracker</Text>
    <View style={styles.row}>
      <TouchableOpacity onPress={onRemove} style={styles.btn}>
        <Text style={styles.btnText}> − 250ml </Text>
      </TouchableOpacity>

      <Text style={styles.scoreText}>{(waterML / 1000).toFixed(2)} L</Text>

      <TouchableOpacity onPress={onAdd} style={styles.btn}>
        <Text style={styles.btnText}> + 250ml </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  section: { color: "#e2e8f0", fontSize: 16, marginBottom: 10, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#111827", padding: 12, borderRadius: 12 },
  btn: { backgroundColor: "#1f2937", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  btnText: { color: "#fff", fontWeight: "600" },
  scoreText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});