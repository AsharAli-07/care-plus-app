// import React, { useEffect, useRef } from "react";
// import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { BlurView } from "expo-blur";
// import { Ionicons } from "@expo/vector-icons";

// type VitalSignsProps = {
//   isConnected: boolean;
//   heartRate: string;
//   spo2: string;
//   temperature: string;
//   isLive: boolean;
//   statusLabel: string;
//   onConnect: () => void;
// };

// export const VitalSigns: React.FC<VitalSignsProps> = ({
//   isConnected,
//   heartRate,
//   spo2,
//   temperature,

// }) => {
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const dotAnim = useRef(new Animated.Value(0.4)).current;

//   useEffect(() => {
//     if (isConnected) {
//       // Heartbeat pulse animation
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
//           Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
//           Animated.timing(pulseAnim, { toValue: 1.1, duration: 250, useNativeDriver: true }),
//           Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
//         ])
//       ).start();

//       // Live dot blink
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
//           Animated.timing(dotAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
//         ])
//       ).start();
//     } else {
//       pulseAnim.setValue(1);
//       dotAnim.setValue(0.4);
//     }
//   }, [isConnected]);

//   const isLive = isConnected && heartRate !== "--";
// // 🔢 Convert float temperature string to a clean Integer string
//  // 🔢 Cut off the decimal completely without rounding up
// const parsedTemp = parseFloat(temperature);
// const displayTemperature = isNaN(parsedTemp) ? temperature : String(Math.trunc(parsedTemp));
//   const vitals = [
//     {
//       label: "Heart Rate",
//       value: heartRate,
//       unit: "bpm",
//       icon: "heart" as const,
//       color: "#f87171",
//     },
//     {
//       label: "SpO₂",
//       value: spo2,
//       unit: "%",
//       icon: "water" as const,
//       color: "#60a5fa",
//     },
//     {
//       label: "Temperature",
//       value: displayTemperature,
//       unit: "°F",
//       icon: "thermometer" as const,
//       color: "#4ade80",
//     },
//   ];

//   return (

//     <View style={styles.container}>
//       <LinearGradient
//         colors={
//           isConnected
//             ? ["rgba(74,222,128,0.06)", "transparent"]
//             : ["rgba(255,255,255,0.03)", "transparent"]
//         }
//         style={StyleSheet.absoluteFill}
//       />

//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <Animated.Text style={{ fontSize: 18, transform: [{ scale: isLive ? pulseAnim : 1 }] }}>
//             <Ionicons name="heart" size={20} color="#f87171" />
//           </Animated.Text>
//           <Text style={styles.headerTitle}>Vital Signs</Text>
//         </View>

//         <View
//           style={[
//             styles.statusBadge,
//             isConnected ? styles.statusConnected : styles.statusDisconnected,
//           ]}
//         >
//           {isConnected ? (
//             <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
//           ) : (
//             <View style={{ width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "#999",
//     }}></View>
//           )}
//           <Text
//             style={[
//               styles.statusText,
//               isConnected ? styles.statusTextConnected : styles.statusTextDisconnected,
//             ]}
//           >
//             {isConnected ? "Live" : "Offline"}
//           </Text>
//         </View>
//       </View>

//       {/* Vitals Grid */}
//       <View style={styles.vitalsRow}>
//         {vitals.map((v, i) => (
//           <View key={v.label} style={[styles.vitalCol, i < vitals.length - 1 && styles.vitalBorder]}>
//             <View style={[styles.iconWrap, { backgroundColor: v.color + "18" }]}>
//               <Ionicons name={v.icon} size={18} color={v.color} />
//             </View>
//             <Text style={[styles.vitalValue, { color: isLive ? v.color : "#999" }]}>
//               {v.value}
//             </Text>
//             <Text style={styles.vitalUnit}>{v.unit}</Text>
//             <Text style={styles.vitalLabel}>{v.label}</Text>
//           </View>
//         ))}
//       </View>
//     </View>

//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: "hidden",
//     paddingVertical: 14,
//      borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
//  backgroundColor: "rgba(0, 26, 17, 0.53)",
//   shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginBottom: 14,
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 14,
//     fontFamily: "Poppins_600SemiBold",
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     borderWidth: 1,
//   },
//   statusConnected: {
//     backgroundColor: "rgba(74,222,128,0.1)",
//     borderColor: "rgba(74,222,128,0.3)",
//   },
//   statusDisconnected: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   liveDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "#4ade80",
//     marginRight: 5,
//   },
//   statusText: {
//     fontSize: 10,
//     fontFamily: "Poppins_400Regular",
//   },
//   statusTextConnected: {
//     color: "#4ade80",
//   },
//   statusTextDisconnected: {
//     color: "#999",
//   },
//   vitalsRow: {
//     flexDirection: "row",
//     paddingHorizontal: 8,
    
//   },
//   vitalCol: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 6,
//   },
//   vitalBorder: {
//     borderRightWidth: 1,
//     borderColor: "rgba(255,255,255,0.08)",
//   },
//   iconWrap: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 6,
//   },
//   vitalValue: {
//     fontSize: 26,
//     fontFamily: "Poppins_700Bold",
//     lineHeight: 30,
//   },
//   vitalUnit: {
//     color: "#777",
//     fontSize: 9,
//     fontFamily: "Poppins_400Regular",
//   },
//   vitalLabel: {
//     color: "#999",
//     fontSize: 10,
//     fontFamily: "Poppins_400Regular",
//     marginTop: 2,
//   },
// });

import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type VitalSignsProps = {
  isConnected: boolean;
  heartRate: string;
  spo2: string;
  temperature: string;
  sensorSource: "live" | "last-known" | null;
  lastUpdatedAt: string | null; 
  onConnect: () => void;
};

const timeAgo = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

export const VitalSigns: React.FC<VitalSignsProps> = ({
  isConnected,
  heartRate,
  spo2,
  temperature,
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

const isLive = sensorSource === "live";

  const parsedTemp = parseFloat(temperature);
  const displayTemperature = isNaN(parsedTemp) ? temperature : String(Math.trunc(parsedTemp));

  // Status label: "Live" when actively connected, "Last known · Xm ago" when
  // there's a previous reading but no active connection, "Offline" only when
  // there's genuinely no data at all.
  const statusText = isLive
    ? "Live"
    : sensorSource === "last-known" && lastUpdatedAt
    ? `Last known · ${timeAgo(lastUpdatedAt)}`
    : "Offline";

  const showLiveDot = isLive;
  const showLastKnownDot = !isLive && sensorSource === "last-known";

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
      value: displayTemperature,
      unit: "°F",
      icon: "thermometer" as const,
      color: "#4ade80",
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isLive
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
            isLive
              ? styles.statusConnected
              : showLastKnownDot
              ? styles.statusLastKnown
              : styles.statusDisconnected,
          ]}
        >
          {showLiveDot ? (
            <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
          ) : (
            <View
              style={[
                styles.staticDot,
                { backgroundColor: showLastKnownDot ? "#999" : "#4ade80" },
              ]}
            />
          )}
          <Text
            style={[
              styles.statusText,
              isLive
                ? styles.statusTextConnected
                : showLastKnownDot
                ? styles.statusTextLastKnown
                : styles.statusTextDisconnected,
            ]}
          >
            {statusText}
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
<Text style={[styles.vitalValue, { color: v.color }]}>
  {v.value}
</Text>
            <Text style={styles.vitalUnit}>{v.unit}</Text>
            <Text style={styles.vitalLabel}>{v.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 14,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.53)",
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
  statusLastKnown: {
  backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(71, 71, 71, 1)",
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
    marginRight: 5,
  },
  staticDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
  statusTextConnected: {
    color: "#4ade80",
  },
  statusTextLastKnown: {
    color: "#999",
  },
  statusTextDisconnected: {
    color: "#999",
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
    borderColor: "rgba(255,255,255,0.08)",
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
    color: "#999",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
});