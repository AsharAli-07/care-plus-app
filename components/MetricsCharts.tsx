import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CircleChart } from "./CircleChart";

type MetricsChartsProps = {
  food: number;
  sleep: number;
  hydration: number;
  onCheck: () => void;
};

export const MetricsCharts: React.FC<MetricsChartsProps> = ({
  food,
  sleep,
  hydration,
  onCheck,
}) => {
  return (
    <View style={styles.card}>

      <TouchableOpacity
        style={styles.chartBox}
        onPress={onCheck}
        activeOpacity={0.85}
      >
        <View style={styles.chartInside}>
          <View style={styles.chartCol}>
            <CircleChart value={food} />
            <Text style={styles.chartHeading}>Food</Text>
          </View>

          <View style={styles.chartCol}>
            <CircleChart value={sleep} />
            <Text style={styles.chartHeading}>Sleep</Text>
          </View>

          <View style={[styles.chartCol, styles.lastChartCol]}>
            <CircleChart value={hydration} />
            <Text style={styles.chartHeading}>Hydration</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
    backgroundColor: 'rgba(0, 26, 17, 0.50)',
    overflow: "hidden",


  },

  chartBox: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 25,
  },

  chartInside: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chartCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRightWidth: 1,
    borderColor: "rgba(74,222,128,0.15)",
  },

  lastChartCol: {
    borderRightWidth: 0,
  },

  chartHeading: {
    marginTop: 8,
    color: "#aaa",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
});