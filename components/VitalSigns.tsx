import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type VitalSignsProps = {
  status: string;
  heartRate: string;
  temperature: string;
  oxygen: number;
  onCheck: () => void;
};

export const VitalSigns: React.FC<VitalSignsProps> = ({
  status,
  heartRate,
  temperature,
  oxygen,
  onCheck,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
  ];

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onCheck}>
      <View style={styles.card}>


        <View style={styles.header}>
          <Animated.Text
            style={{
              fontSize: 22,
              transform: [{ scale: pulseAnim }],
            }}
          >
            ❤️
          </Animated.Text>

          <Text style={styles.title}>Vital Signs</Text>

          <View style={styles.statusBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.statusTxt}>{status}</Text>
          </View>
        </View>

        <View style={styles.row}>
          {vitals.map((v, i) => (
            <View
              key={i}
              style={[styles.col, i < vitals.length - 1 && styles.border]}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor:
                      v.color === "#34d399"
                        ? "rgba(52,211,153,0.18)"
                        : v.color === "#60a5fa"
                        ? "rgba(96,165,250,0.18)"
                        : "rgba(248,113,113,0.18)",
                  },
                ]}
              >
                <Ionicons name={v.icon as any} size={25} color={v.color} />
              </View>

              <Text style={[styles.val, { color: v.color }]}>
                {v.value}
              </Text>

              <Text style={styles.unit}>{v.unit}</Text>

              <Text style={styles.lbl}>{v.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 30,
    padding: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
    backgroundColor: "rgba(0, 26, 17, 0.53)",
    overflow: "hidden",

    shadowColor: "#004927",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    flex: 1,
    marginLeft: 10,
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(74,222,128,0.10)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.30)",
  },

  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginRight: 5,
  },

  statusTxt: {
    color: "#4ade80",
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  col: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },

  border: {
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  val: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginTop: 4,
  },

  unit: {
    color: "#aaa",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },

  lbl: {
    color: "#aaa",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },
});