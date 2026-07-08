import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type VitalSignsProps = {
  status?: string;
  isConnected?: boolean;
  heartRate?: string;
  spo2?: string;
  temperature?: string;
  oxygen?: number;
  onCheck?: () => void;
  onConnect?: () => void;
};

export const VitalSigns: React.FC<VitalSignsProps> = ({
  status = "Good",
  isConnected = false,
  heartRate = "--",
  spo2 = "--",
  temperature = "--",
  oxygen = 0,
  onCheck,
  onConnect,
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

  const vitals = [
    {
      label: "Heart Rate",
      value: heartRate,
      unit: "bpm",
      icon: "heart-outline",
      color: "#f87171",
    },
    {
      label: "Temperature",
      value: temperature,
      unit: "°C",
      icon: "thermometer-outline",
      color: "#60a5fa",
    },
    {
      label: "Oxygen",
      value: `${oxygen}`,
      unit: "%",
      icon: "pulse-outline",
      color: "#34d399",
    },
    {
      label: "SpO₂",
      value: spo2,
      unit: "%",
      icon: "water-outline",
      color: "#60a5fa",
    },
  ];

  return (
    <BlurView intensity={50} tint="dark" style={styles.container}>
      <LinearGradient
        colors={isConnected ? ["rgba(74,222,128,0.08)", "transparent"] : ["rgba(255,255,255,0.03)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.Text style={[styles.heartIcon, { transform: [{ scale: isConnected ? pulseAnim : 1 }] }]}>❤️</Animated.Text>
          <View>
            <Text style={styles.headerTitle}>Vital Signs</Text>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.statusBadge, isConnected ? styles.statusConnected : styles.statusDisconnected]}
          onPress={onConnect}
          activeOpacity={0.8}
        >
          {isConnected ? <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} /> : <Ionicons name="watch-outline" size={12} color="#888" />}
          <Text style={[styles.statusText, isConnected ? styles.statusTextConnected : styles.statusTextDisconnected]}>
            {isConnected ? "Live" : "Connect Watch"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vitalsRow}>
        {vitals.map((v) => (
          <View key={v.label} style={styles.vitalCol}>
            <View style={[styles.iconWrap, { backgroundColor: `${v.color}20` }]}> 
              <Ionicons name={v.icon as any} size={20} color={v.color} />
            </View>
            <Text style={[styles.vitalValue, { color: isConnected ? v.color : "#fff" }]}>{v.value}</Text>
            <Text style={styles.vitalUnit}>{v.unit}</Text>
            <Text style={styles.vitalLabel}>{v.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.footer} onPress={onCheck} activeOpacity={0.85}>
        <Text style={styles.footerText}>{isConnected ? "Refresh vitals" : "Check watch status"}</Text>
        <Ionicons name="arrow-forward" size={16} color="#4ade80" />
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
    overflow: "hidden",
    backgroundColor: "rgba(3,16,11,0.72)",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heartIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  statusConnected: {
    backgroundColor: "rgba(74,222,128,0.12)",
    borderColor: "rgba(74,222,128,0.28)",
  },
  statusDisconnected: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  statusText: {
    color: "#aaa",
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  statusTextConnected: {
    color: "#4ade80",
  },
  statusTextDisconnected: {
    color: "#888",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginRight: 6,
  },
  vitalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  vitalCol: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  vitalValue: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    marginBottom: 2,
  },
  vitalUnit: {
    color: "#aaa",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
  vitalLabel: {
    color: "#aaa",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  footerText: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});
