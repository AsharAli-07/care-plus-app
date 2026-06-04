import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

type SleepInputProps = {
  value: number;
  onChange: (hours: number) => void;
};

export const SleepInput: React.FC<SleepInputProps> = ({
  value,
  onChange,
}) => (
  <View style={styles.container}>
    <Text style={styles.section}>💤 Sleep Hours</Text>

    <TextInput
      placeholder="Enter sleep hours"
      placeholderTextColor="#ffffffff"
      keyboardType="numeric"
      value={value === 0 ? "" : value.toString()}
      onChangeText={(v) =>
        onChange(Number(v.replace(/[^0-9.]/g, "")))
      }
      style={styles.input}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  section: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 15,
    fontFamily: "Poppins_500Medium",
  },

  input: {
  width: "100%",
  padding: 10,

  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.08)",

  color: "#fff",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
  },
});