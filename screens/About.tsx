import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
export const SectionHeader = ({ label, icon, color = "#4ade80" }: any) => (
  <View style={sh.row}>
    <View style={[sh.bar, { backgroundColor: color }]} />
    <Ionicons name={icon} size={14} color={color} />
    <Text style={[sh.txt, { color }]}>{label}</Text>
  </View>
);

const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 15 },
  bar: { width: 3, height: 16, borderRadius: 2 },
  txt: { fontSize: 16, fontFamily: "Poppins_500Medium" },
});
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.89;

export default function About() {
  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {/* HERO */}
          <View style={styles.card}>
            <Ionicons
              name="heart-circle-outline"
              size={70}
              color="#4ade80"
              style={{ alignSelf: "center", marginBottom: 15 }}
            />
            <Text style={styles.heading}>Care Plus</Text>
            <Text style={styles.subtitle}>
              A smart wellness and emergency support app designed to help you
              monitor your mental and physical well-being while providing
              quick emergency assistance when needed.
            </Text>
          </View>

          {/* MISSION */}
           <SectionHeader label="Our Mission" icon="flag-outline" color="#4ade80" />
          <View style={styles.card}>
            <Text style={styles.text}>
              To improve daily wellness tracking and ensure instant emergency
              response support through technology, location sharing, and
              instant communication tools.
            </Text>
          </View>

          {/* FEATURES */}
          <SectionHeader label="Key Features" icon="layers-outline" color="#4ade80" />
          <View style={styles.cardF}>
            <FeatureRow
              icon="pulse-outline"
              title="Daily Wellness Tracking"
              description="Log sleep, water, meals, and meditation to build a complete picture of your day."
            />
            <FeatureRow
              icon="happy-outline"
              title="Mood & Mental Health Monitoring"
              description="Track how you're feeling over time and spot patterns before they become problems."
            />
            <FeatureRow
              icon="chatbubble-ellipses-outline"
              title="Therapy & Meditation"
              description="Chat or talk with Sera, your AI companion, and access guided breathing and meditation."
            />
            <FeatureRow
              icon="alert-circle-outline"
              title="Emergency SOS System"
              description="Trigger an instant alert to your emergency contacts with one tap when it matters most."
            />
            <FeatureRow
              icon="mail-outline"
              title="Instant Email Alerts"
              description="Emergency contacts are notified by email the moment Panic Mode is activated."
            />
            <FeatureRow
              icon="location-outline"
              title="Live Location Sharing"
              description="Share your real-time location with trusted contacts during an emergency."
            />
            <FeatureRow
              icon="people-outline"
              title="Emergency Contact Management"
              description="Add and manage up to 5 trusted contacts who can be reached instantly."
              isLast
            />
          </View>

          {/* VERSION */}
      <SectionHeader label="Version" icon="cube-outline" color="#4ade80" />
          <View style={styles.card}>
            <Text style={styles.text}>Care Plus v1.0.0</Text>
          </View>

          {/* FOOTER */}
          <Text style={styles.footer}>
            Built with ❤️ for better health and safety
          </Text>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const FeatureRow = ({ icon, title, description, isLast }: any) => (
  <View style={[styles.featureRow, !isLast && styles.rowDivider]}>
    <View style={styles.featureIconWrap}>
      <Ionicons name={icon} size={18} color="#4ade80" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)",
    pointerEvents: "none",
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "flex-start",

  },

  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 25,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
    marginBottom: 30,
  },

  cardF: {
    width: CARD_WIDTH,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
    marginBottom: 30,
    paddingVertical: 8,

  },
  heading: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Poppins_500Medium",
  },

  subtitle: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
  },



  text: {
    fontSize: 12,
    color: "#aaa",
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(74,222,128,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  featureTitle: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    marginBottom: 4,
  },

  featureDescription: {
    color: "#aaa",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
  },

  footer: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
});