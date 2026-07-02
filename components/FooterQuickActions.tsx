import React from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

export const FooterQuickActions: React.FC = () => {
  return (
    <View style={styles.circleRow}>
      <View style={styles.circleBox}>
        <Ionicons name="heart" size={20} color="#4ade80" />
      </View>
      <View style={styles.circleBox}>
        <Ionicons name="moon" size={20} color="#4ade80" />
      </View>
      <View style={styles.circleBox}>
        <Ionicons name="leaf" size={20} color="#4ade80" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  circleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" , marginTop: 5},
  circleBox: { width: 40, height: 40, borderRadius: 30, justifyContent: "center", alignItems: "center",   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
 backgroundColor: "rgba(0, 26, 17, 0.53)",
  shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,},
});