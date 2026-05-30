import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

type SleepInputProps = {
  value: number;
  onChange: (hours: number) => void;
};

export const SleepInput: React.FC<SleepInputProps> = ({ value, onChange }) => (
  <View style={styles.container}>
    <Text style={styles.section}>💤 Sleep Hours</Text>
    <TextInput
      placeholder="Enter sleep hours"
      placeholderTextColor="#94a3b8"
      keyboardType="numeric"
      value={value === 0 ? "" : value.toString()}
      onChangeText={(v) => onChange(Number(v.replace(/[^0-9.]/g, "")))}
      style={styles.input}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  section: { color: "#e2e8f0", fontSize: 16, marginBottom: 10, fontWeight: "600" },
  input: { backgroundColor: "#111827", padding: 14, borderRadius: 12, color: "#fff", fontSize: 15 },
});