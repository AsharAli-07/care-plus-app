import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EmergencyActionButton({
  title,
  icon,
  color,
  onPress,
  isLast = false,
}: any) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isLast ? styles.noMargin : styles.withMargin,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={18}
        color={color || "#fff"}
      />

      <Text style={[styles.text, { color: color || "#fff" }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",

    padding: 10,
    borderRadius: 12,

    backgroundColor: "rgba(255,255,255,0.08)",

    width: "100%",
  },

  withMargin: {
    marginBottom: 15,
     backgroundColor: "rgba(255,255,255,0.08)",
  },

  noMargin: {
    marginBottom: 0,
     backgroundColor: "rgba(255,255,255,0.08)",
  },

  text: {
    marginLeft: 10,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#fff",
  },
});