import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ImageBackground,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import EmergencyCard from "../components/EmergencyCard";
import SOSButton from "../components/SOSButton";
import EmergencyActionButton from "../components/EmergencyActionButton";
import { getLocation } from "../utils/location";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";

export default function Emergency({ navigation }: any) {
  const [contact, setContact] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    const data = await AsyncStorage.getItem("emergency_contact");
    setContact(data ? JSON.parse(data) : null);
  };

  const buildMessage = async () => {
    const coords = await getLocation();

    if (!coords) {
      return `🚨 Emergency Alert\n\nI need help.\nLocation not available.`;
    }

    return `🚨 Emergency Alert\n\nI need help.\n\nLocation:\nhttps://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
  };

  const sendWhatsApp = async () => {
    if (!contact?.phone) {
      Alert.alert("No Contact", "Please add emergency contact first.");
      return;
    }

    const msg = await buildMessage();

    try {
      await Linking.openURL(
        `whatsapp://send?phone=${contact.phone}&text=${encodeURIComponent(msg)}`
      );
    } catch {
      Alert.alert("Error", "WhatsApp not installed.");
    }
  };

  const sendSMS = async () => {
    if (!contact?.phone) {
      Alert.alert("No Contact", "Please add emergency contact first.");
      return;
    }

    const msg = await buildMessage();
    Linking.openURL(`sms:${contact.phone}?body=${encodeURIComponent(msg)}`);
  };

  const call = () => {
    if (!contact?.phone) {
      Alert.alert("No Contact", "Please add emergency contact first.");
      return;
    }

    Linking.openURL(`tel:${contact.phone}`);
  };

  const sos = () => {
    if (!contact?.phone) {
      Alert.alert("No Contact", "Add emergency contact first.");
      return;
    }

    Alert.alert("Emergency SOS", "Send emergency alert?", [
      { text: "Cancel", style: "cancel" },
      { text: "Send", onPress: sendWhatsApp },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: '100%', width: '100%' }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.glowTop} />

        {/* IMPORTANT FIX: flex container */}
        <View style={styles.overlay}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* TITLE */}
            <Text style={styles.title}>Emergency Support</Text>

            {/* CONTACT CARD */}
            <BlurView intensity={50} tint="dark" style={styles.card}>
              <EmergencyCard contact={contact} />

              <EmergencyActionButton
                title="Edit Contact"
                icon="create"
                onPress={() => navigation.navigate("EmergencyContacts")}
                isLast
              />
            </BlurView>

            {/* NO CONTACT */}
            {!contact && (
              <BlurView intensity={50} tint="dark" style={styles.card}>
                <Text style={styles.text}>
                  No emergency contact added
                </Text>

                <EmergencyActionButton
                  title="Add Emergency Contact"
                  icon="person-add"
                  onPress={() =>
                    navigation.navigate("EmergencyContacts")
                    
                  }
                  isLast
                />
              </BlurView>
            )}

            {/* SOS */}
            <BlurView intensity={50} tint="dark" style={styles.sosCard}>
              <SOSButton onPress={sos} />
            </BlurView>

            {/* ACTION BUTTONS */}
            <BlurView intensity={50} tint="dark" style={styles.card}>
              <EmergencyActionButton
                title="WhatsApp Alert"
                icon="logo-whatsapp"
                onPress={sendWhatsApp}
              />

              <EmergencyActionButton
                title="SMS Alert"
                icon="chatbox"
                onPress={sendSMS}
              />

              <EmergencyActionButton
                title="Call Contact"
                icon="call"
                onPress={call}
                isLast
              />
            </BlurView>

          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, // ✅ IMPORTANT FIX
    padding: 20,
  },

  scrollContainer: {
    paddingBottom: 40, // ✅ important for scrolling end space
  },

  title: {
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    borderRadius: 12,
    padding: 15,
    overflow: "hidden",
    marginBottom: 20,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    shadowColor: "#004927",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 6,
  },

  text: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#ddd",
    marginBottom: 10,
  },

  sosCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    overflow: "hidden",
       borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
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