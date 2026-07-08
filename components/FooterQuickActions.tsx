import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export const FooterQuickActions: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.circleRow}>
      <TouchableOpacity style={styles.circleBox} onPress={() => navigation.navigate("Dashboard")}>
        <Ionicons name="speedometer" size={20} color="#4ade80" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.circleBox} onPress={() => navigation.navigate("WellnessTracker")}>
        <Ionicons name="body" size={20} color="#4ade80" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.circleBox} onPress={() => navigation.navigate("ChatTherapy")}>
        <Ionicons name="chatbubble-ellipses" size={20} color="#4ade80" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  circleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  circleBox: {
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",

  },
});