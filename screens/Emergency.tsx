import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ImageBackground,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import EmergencyCard from "../components/EmergencyCard";
import SOSButton from "../components/SOSButton";
import EmergencyActionButton from "../components/EmergencyActionButton";
import { getLocation } from "../utils/location";
import * as Linking from "expo-linking";
import { ScrollView } from "react-native";

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
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: '100%', width: '100%' }}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.overlay}>

            {/* TITLE */}
            <Text style={styles.title}>Emergency Support</Text>

            {/* CONTACT CARD */}
            <BlurView intensity={50} tint="prominent" style={styles.card}>
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
              <BlurView intensity={50} tint="prominent" style={styles.card}>
                <Text style={styles.text}>
                  No emergency contact added
                </Text>

                <EmergencyActionButton
                  title="Add Emergency Contact"
                  icon="person-add"
                  onPress={() =>
                    navigation.navigate("EmergencyContacts")
                  }
                />

              </BlurView>
            )}

            {/* SOS SECTION (NEW DESIGN) */}
 <BlurView intensity={40} tint="prominent" style={styles.sosCard}>
  <SOSButton onPress={sos} />
</BlurView>

            {/* ACTION BUTTONS */}
            <BlurView intensity={40} tint="prominent" style={styles.card}>
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

          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    padding: 20,
  },

  scrollContainer: {
    flexGrow: 1,
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
    overflow: "hidden",
    marginBottom: 20
  },

  text: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#ddd",
    marginBottom: 10,
  },

  /* SOS SECTION */
  sosCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    overflow: "hidden",
  },

  sosRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between'
  },

sosButtonWrap: {
  marginRight: 12,
  alignItems: "center",
  justifyContent: "center",
},

  sosTextWrap: {
    flex: 1,
  },

  sosTitle: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
  },

  sosSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#bbb",
    marginTop: 2,
  },
  sosButtonSmall: {
  transform: [{ scale: 0.5 }], // 👈 main fix (controls size)
},
});