import React from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

export const FooterQuickActions: React.FC = () => {
  return (
    <View style={styles.circleRow}>
      <BlurView intensity={50} tint="prominent" style={styles.circleBox}>
        <Ionicons name="heart" size={20} color="#fff" />
      </BlurView>
      <BlurView intensity={50} tint="prominent" style={styles.circleBox}>
        <Ionicons name="moon" size={20} color="#fff" />
      </BlurView>
      <BlurView intensity={50} tint="prominent" style={styles.circleBox}>
        <Ionicons name="leaf" size={20} color="#fff" />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  circleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" , marginTop: 5},
  circleBox: { width: 40, height: 40, borderRadius: 30, backgroundColor: "rgba(255, 255, 255, 0.10)", justifyContent: "center", alignItems: "center", elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5 },
});