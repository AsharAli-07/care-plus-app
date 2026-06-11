import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { CircleChart } from "./CircleChart";

type MetricsChartsProps = {
  status: string;
  oxygen: number;
  food: number;
  sleep: number;
  onCheck: () => void;
};

export const MetricsCharts: React.FC<MetricsChartsProps> = ({
  status,
  oxygen,
  food,
  sleep,
  onCheck,
}) => {
  return (
     <BlurView intensity={50} tint="dark" style={{ marginBottom: 20, borderRadius: 12,  borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1, }}>
      <TouchableOpacity style={styles.chartBox} onPress={onCheck}>
        <View style={styles.firstRow}>
          <Text style={styles.checkText}>Status: {status}</Text>
        </View>

        <View style={styles.chartInside}>
          <View style={styles.chartcol}>
            <CircleChart value={oxygen} />
            <Text style={styles.chartHeading}>Oxygen</Text>
          </View>
          <View style={styles.col}>
            <CircleChart value={food} />
            <Text style={styles.chartHeading}>Food</Text>
          </View>
          <View style={[styles.col, styles.chartLastCol]}>
            <CircleChart value={sleep} />
            <Text style={styles.chartHeading}>Sleep</Text>
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
  chartBox: { height: 160, borderRadius: 12, justifyContent: "space-between", elevation: 3, paddingTop: 15, paddingBottom: 15 },
  firstRow: { alignItems: "center" },
  checkText: { fontSize: 12, color: "#fff", fontFamily: "Poppins_400Regular" },
  chartInside: { flexDirection: "row", width: "100%" },
  chartcol: { flex: 1, paddingLeft: 15, paddingRight: 15, justifyContent: "center", borderRightWidth: 1, borderColor: "#fff", height: 60 },
  col: { flex: 1, paddingLeft: 15, paddingRight: 15, justifyContent: "center", borderRightWidth: 1, borderColor: "#fff", height: 60 },
  chartLastCol: { borderRightWidth: 0 },
  chartHeading: { paddingTop: 5, fontSize: 8, color: "#fff", fontFamily: "Poppins_500Medium", textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 15, paddingLeft: 15 },
});