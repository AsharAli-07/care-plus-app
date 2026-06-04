import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";

export default function About() {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.container}>

          {/* HEADER */}
          <Text style={styles.title}>About Care Plus</Text>

          {/* APP INFO */}
          <BlurView intensity={50} tint="prominent" style={styles.card}>
            <Text style={styles.heading}>Care Plus</Text>
            <Text style={styles.text}>
              Care Plus is a smart wellness and emergency support application designed to help users
              monitor their mental and physical well-being while providing quick emergency assistance
              when needed.
            </Text>
          </BlurView>

          {/* MISSION */}
          <BlurView intensity={50} tint="prominent" style={styles.card}>
            <Text style={styles.heading}>Our Mission</Text>
            <Text style={styles.text}>
              To improve daily wellness tracking and ensure instant emergency response support
              through technology, location sharing, and instant communication tools.
            </Text>
          </BlurView>

          {/* FEATURES */}
          <BlurView intensity={50} tint="prominent" style={styles.card}>
            <Text style={styles.heading}>Key Features</Text>

            <Text style={[styles.text, { lineHeight: 20 }]}>•  Daily Wellness Tracking</Text>
            <Text style={[styles.text, { lineHeight: 20 }]}>•  Mood & Mental Health Monitoring</Text>
            <Text style={[styles.text, { lineHeight: 20 }]}>•  Therapy & Meditation</Text>
            <Text style={[styles.text, { lineHeight: 20 }]}>•  Emergency SOS System</Text>
            <Text style={[styles.text, { lineHeight: 20 }]}>•  WhatsApp & SMS Alerts</Text>
            <Text style={[styles.text, { lineHeight: 20 }]}>•  Live Location Sharing</Text>
            <Text style={styles.text}>•  Emergency Contact Management</Text>

          </BlurView>

          {/* VERSION */}
          <BlurView intensity={50} tint="prominent" style={styles.card}>
            <Text style={styles.heading}>Version</Text>
            <Text style={styles.text}>Care Plus v1.0.0</Text>
          </BlurView>

          {/* FOOTER */}
          <Text style={styles.footer}>
            Built with ❤️ for better health and safety
          </Text>

        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },

  title: {
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
    marginBottom: 20,
    textAlign: 'center'
  },

  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    overflow: "hidden",
  },

  heading: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
    marginBottom: 15,
  },

  text: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#ffffffff",

  },

  footer: {
    textAlign: "center",
    color: "#ffffffff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});