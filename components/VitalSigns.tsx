import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type VitalSignsProps = {
  status: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  onCheck: () => void;
};

export const VitalSigns: React.FC<VitalSignsProps> = ({
  status,
  bloodPressure,
  heartRate,
  temperature,
  onCheck,
}) => {
  return (
    <BlurView intensity={50} tint="dark" style={{ marginBottom: 20, borderRadius: 12,  borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1, }}>
      <TouchableOpacity style={styles.largeBox} onPress={onCheck}>
        <View style={styles.firstRow}>
          <Text style={styles.checkText}>Status: {status}</Text>
        </View>

        <View style={styles.rowInside}>
          <View style={styles.col}>
            <Text style={styles.boxHeading}>Blood Pressure</Text>
            <Text style={styles.boxText}>{bloodPressure}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.boxHeading}>Heart Rate</Text>
            <Text style={styles.boxText}>{heartRate}</Text>
          </View>
          <View style={[styles.col, styles.lastCol]}>
            <Text style={styles.boxHeading}>temperature</Text>
            <Text style={styles.boxText}>{temperature}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.checkText}>Check</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  largeBox: { height: 160, borderRadius: 12, justifyContent: "space-between", elevation: 3, paddingTop: 15, paddingBottom: 15 },
  firstRow: { alignItems: "center" },
  checkText: { fontSize: 12, color: "#fff", fontFamily: "Poppins_400Regular" },
  rowInside: { flexDirection: "row", width: "100%" },
  col: { flex: 1, paddingLeft: 15, paddingRight: 15, justifyContent: "center", borderRightWidth: 1, borderColor: "#fff", height: 60 },
  lastCol: { borderRightWidth: 0 },
  boxHeading: { paddingTop: 10, fontSize: 8, color: "#fff", fontFamily: "Poppins_500Medium" },
  boxText: { fontSize: 40, color: "#fff", textAlign: "center", fontFamily: "Poppins_400Regular" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 15, paddingLeft: 15 },
});