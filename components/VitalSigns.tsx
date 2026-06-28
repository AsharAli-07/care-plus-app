import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type VitalSignsProps = {
  isConnected: boolean;
  heartRate: string;
  spo2: string;
  temperature: string;
  onConnect: () => void;
};

export const VitalSigns: React.FC<VitalSignsProps> = ({
  isConnected,
  heartRate,
  spo2,
  temperature,
  onConnect,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isConnected) {
      // Heartbeat pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 250, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      // Live dot blink
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

  const vitals = [
    {
      label: "Heart Rate",
      value: heartRate,
      unit: "bpm",
      icon: "heart" as const,
      color: "#f87171",
    },
    {
      label: "SpO₂",
      value: spo2,
      unit: "%",
      icon: "water" as const,
      color: "#60a5fa",
    },
    {
      label: "Temperature",
      value: temperature,
      unit: "°C",
      icon: "thermometer" as const,
      color: "#4ade80",
    },
  ];

  return (
    <BlurView
      intensity={50}
      tint="dark"
      style={styles.container}
    >
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
            ❤️
          </Animated.Text>
          <Text style={styles.headerTitle}>Vital Signs</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.statusBadge,
            isConnected ? styles.statusConnected : styles.statusDisconnected,
          ]}
          onPress={onConnect}
          activeOpacity={0.7}
        >
          {isConnected ? (
            <Animated.View
              style={[styles.liveDot, { opacity: dotAnim }]}
            />
          ) : (
            <Ionicons name="watch-outline" size={12} color="#888" />
          )}
          <Text
            style={[
              styles.statusText,
              isConnected ? styles.statusTextConnected : styles.statusTextDisconnected,
            ]}
          >
            {isConnected ? "Live" : "Connect Watch"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vitals Grid */}
      <View style={styles.vitalsRow}>
        {vitals.map((v, i) => (
          <View
            key={v.label}
            style={[styles.vitalCol, i < 2 && styles.vitalBorder]}
          >
            <View style={[styles.iconWrap, { backgroundColor: v.color + "18" }]}>
              <Ionicons name={v.icon} size={18} color={v.color} />
            </View>
            <Text style={[styles.vitalValue, { color: isLive ? v.color : "#555" }]}>
              {v.value}
            </Text>
            <Text style={styles.vitalUnit}>{v.unit}</Text>
            <Text style={styles.vitalLabel}>{v.label}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <TouchableOpacity style={styles.footer} onPress={onConnect}>
        <Text style={styles.footerText}>
          {isConnected ? "View Details" : "Connect Watch to See Live Data"}
        </Text>
        <Ionicons name="arrow-forward" size={16} color="#4ade80" />
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 16,
    borderColor: "rgba(74,222,128,0.25)",
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusConnected: {
    backgroundColor: "rgba(74,222,128,0.1)",
    borderColor: "rgba(74,222,128,0.3)",
  },
  statusDisconnected: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
  },
  statusTextConnected: {
    color: "#4ade80",
  },
  statusTextDisconnected: {
    color: "#888",
  },
  vitalsRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  vitalCol: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  vitalBorder: {
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  vitalValue: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    lineHeight: 30,
  },
  vitalUnit: {
    color: "#777",
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
  },
  vitalLabel: {
    color: "#aaa",
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  footerText: {
    color: "#888",
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
});