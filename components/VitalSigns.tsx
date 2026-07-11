import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type RiskInfo = { probability: number; category: string };

type VitalSignsProps = {
  isConnected: boolean;
  heartRate: string;
  spo2: string;
  temperature: string;
  onConnect: () => void;
  risk?: RiskInfo | null;
  sensorSource?: "live" | "last-known" | null;   // ← add this
  lastUpdatedAt?: string | null;                  // ← add this
};

export const VitalSigns: React.FC<VitalSignsProps> = ({
  isConnected,
  heartRate,
  spo2,
  temperature,
  risk,
  sensorSource,
  lastUpdatedAt,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 250, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      dotAnim.setValue(0.4);
    }
  }, [isConnected]);

const isLive = isConnected && heartRate !== "--";
const parsedTemp = parseFloat(temperature);
const displayTemperature = isNaN(parsedTemp) ? temperature : String(Math.trunc(parsedTemp));

// Per-vital abnormal-range check — same thresholds as the server-side
// health-monitoring alerts, so a dangerous reading escalates visually
// even before/without an ML risk classification.
const hrNum   = parseFloat(heartRate);
const spo2Num = parseFloat(spo2);
const tempNum = parseFloat(temperature);

const hrAbnormal   = !isNaN(hrNum)   && (hrNum > 120 || hrNum < 50);
const spo2Abnormal = !isNaN(spo2Num) && spo2Num < 94;
const tempAbnormal = !isNaN(tempNum) && tempNum > 101;

const ALERT_COLOR = "#ff6b6b";

const vitals = [
  { label: "Heart Rate",  value: heartRate,          unit: "bpm", icon: "heart" as const,       color: hrAbnormal   ? ALERT_COLOR : "#f87171", abnormal: hrAbnormal },
  { label: "SpO₂",        value: spo2,               unit: "%",   icon: "water" as const,       color: spo2Abnormal ? ALERT_COLOR : "#60a5fa", abnormal: spo2Abnormal },
  { label: "Temperature", value: displayTemperature, unit: "°F",  icon: "thermometer" as const, color: tempAbnormal ? ALERT_COLOR : "#4ade80", abnormal: tempAbnormal },
];

// Three-tier risk color — "Moderate Risk" was previously falling into the
// same green/checkmark styling as "no risk", which hides real signal.
const isHighRisk     = risk?.category === "High Risk";
const isModerateRisk = risk?.category === "Moderate Risk";
const riskColor = isHighRisk ? "#ff6b6b" : isModerateRisk ? "#facc15" : "#4ade80";
const riskIcon: any = isHighRisk ? "alert-circle" : isModerateRisk ? "warning" : "shield-checkmark";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isConnected
            ? ["rgba(74,222,128,0.06)", "transparent"]
            : ["rgba(255,255,255,0.03)", "transparent"]
        }
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.Text style={{ fontSize: 18, transform: [{ scale: isLive ? pulseAnim : 1 }] }}>
            <Ionicons name="heart" size={20} color="#f87171" />
          </Animated.Text>
          <Text style={styles.headerTitle}>Vital Signs</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isConnected ? styles.statusConnected : styles.statusDisconnected,
          ]}
        >
          {isConnected ? (
            <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
          ) : (
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#999" }} />
          )}
          <Text
            style={[
              styles.statusText,
              isConnected ? styles.statusTextConnected : styles.statusTextDisconnected,
            ]}
          >
            {isConnected ? "Live" : "Offline"}
          </Text>
        </View>
      </View>

      {/* Vitals Grid */}
      <View style={styles.vitalsRow}>
        {vitals.map((v, i) => (
          <View key={v.label} style={[styles.vitalCol, i < vitals.length - 1 && styles.vitalBorder]}>
            <View style={[styles.iconWrap, { backgroundColor: v.color + "18" }]}>
              <Ionicons name={v.icon} size={18} color={v.color} />
            </View>
            <Text style={[styles.vitalValue, { color: isLive ? v.color : "#999" }]}>
              {v.value}
            </Text>
            <Text style={styles.vitalUnit}>{v.unit}</Text>
            <Text style={styles.vitalLabel}>{v.label}</Text>
          </View>
        ))}
      </View>

      {/* ML Risk Row — inside the card, below the vitals grid */}
      {risk && (
        <View style={styles.riskRow}>
          <View style={[styles.riskDivider]} />
          <View style={styles.riskContent}>
            <View style={styles.riskLeft}>
   <Ionicons name={riskIcon} size={16} color={riskColor} />
              <Text style={[styles.riskLabel, { color: riskColor }]}>
                {risk.category}
              </Text>
            </View>
            <Text style={styles.riskConfidence}>
              {Math.round(risk.probability * 100)}% confidence
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 14,
    borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
  
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#fff", fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusConnected: { backgroundColor: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)" },
  statusDisconnected: { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ade80", marginRight: 5 },
  statusText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  statusTextConnected: { color: "#4ade80" },
  statusTextDisconnected: { color: "#999" },
  vitalsRow: { flexDirection: "row", paddingHorizontal: 8 },
  vitalCol: { flex: 1, alignItems: "center", paddingVertical: 6 },
  vitalBorder: { borderRightWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  vitalValue: { fontSize: 26, fontFamily: "Poppins_700Bold", lineHeight: 30 },
  vitalUnit: { color: "#777", fontSize: 9, fontFamily: "Poppins_400Regular" },
  vitalLabel: { color: "#999", fontSize: 10, fontFamily: "Poppins_400Regular", marginTop: 2 },

  // Risk row (inside the card)
  riskRow: { marginTop: 14 },
  riskDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 16, marginBottom: 12 },
  riskContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  riskLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  riskLabel: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  riskConfidence: { fontSize: 10, color: "#999", fontFamily: "Poppins_400Regular" },
});