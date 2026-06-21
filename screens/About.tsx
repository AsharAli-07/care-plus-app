import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView, StatusBar
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

export default function About() {
  return (
  <View style={{ flex: 1,backgroundColor: "#050f09", }}>
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
                <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>

          {/* HEADER */}
          <Text style={styles.title}>About Care Plus</Text>

          {/* APP INFO */}
          <BlurView intensity={50} tint="dark" style={styles.card}>
            <Text style={styles.heading}>Care Plus</Text>
            <Text style={styles.text}>
              Care Plus is a smart wellness and emergency support application designed to help users
              monitor their mental and physical well-being while providing quick emergency assistance
              when needed.
            </Text>
          </BlurView>

          {/* MISSION */}
          <BlurView intensity={50} tint="dark" style={styles.card}>
            <Text style={styles.heading}>Our Mission</Text>
            <Text style={styles.text}>
              To improve daily wellness tracking and ensure instant emergency response support
              through technology, location sharing, and instant communication tools.
            </Text>
          </BlurView>

          {/* FEATURES */}
          <BlurView intensity={50} tint="dark" style={styles.card}>
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
          <BlurView intensity={50} tint="dark" style={styles.card}>
            <Text style={styles.heading}>Version</Text>
            <Text style={styles.text}>Care Plus v1.0.0</Text>
          </BlurView>

          {/* FOOTER */}
          <Text style={styles.footer}>
            Built with ❤️ for better health and safety
          </Text>

        </ScrollView>
    </View>

      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
    overlay: {
    flex: 1,

    justifyContent: "center",
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
          borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
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
});