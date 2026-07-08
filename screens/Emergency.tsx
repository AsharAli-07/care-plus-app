import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, Alert, ImageBackground, StyleSheet,
  StatusBar, ScrollView, TouchableOpacity, Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import SOSButton from "../components/SOSButton";
import { getLocation } from "../utils/location";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BASE_URL } from "../api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.89;

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

// ── Radar pulse ring ─────────────────────────────────────────────────────
const PulseRing = ({ delay, active }: { delay: number; active: boolean }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation;

    const start = () => {
      anim.setValue(0);
      loop = Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        })
      );
      loop.start();
    };

    const timeout = setTimeout(start, delay);

    return () => {
      clearTimeout(timeout);
      loop?.stop();
    };
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.55, 0.35, 0] });

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          borderColor: active ? "#8B0000" : "#ff4444",
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

export default function Emergency({ navigation }: any) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [token, setToken] = useState("");
  const [sendingSOS, setSendingSOS] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    try {
      const t = await AsyncStorage.getItem("token") || "";
      setToken(t);
      const res = await axios.get(`${BASE_URL}/favourite-contact`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setContacts(res.data || []);
    } catch (err) {
      console.log("Load contacts error:", err);
    }
  };

  const buildMessage = async () => {
    const coords = await getLocation();
    if (!coords) return `🚨 Emergency Alert\n\nI need help.\nLocation not available.`;
    return `🚨 Emergency Alert\n\nI need help.\n\nLocation:\nhttps://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
  };

  const sendEmergencyEmail = async (contact: any) => {
    try {
      const coords = await getLocation();
      await axios.post(
        `${BASE_URL}/send-emergency-email`,
        { email: contact.email, latitude: coords?.latitude, longitude: coords?.longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Remove Contact", `Remove ${name} from your emergency contacts?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const t = token || (await AsyncStorage.getItem("token")) || "";
            const res = await axios.delete(`${BASE_URL}/favourite-contact/${id}`, {
              headers: { Authorization: `Bearer ${t}` },
            });
            console.log("Delete contact response:", res.data);
            setContacts((prev) => prev.filter((c) => c.id !== id));
          } catch (err: any) {
            console.log("Delete contact error:", err?.response?.status, err?.response?.data || err?.message);
            Alert.alert(
              "Error",
              err?.response?.data?.message || "Failed to delete contact. Check console for details."
            );
          }
        },
      },
    ]);
  };

  const sendWhatsApp = async (contact: any) => {
    const msg = await buildMessage();
    try {
      await Linking.openURL(`whatsapp://send?phone=${contact.phone}&text=${encodeURIComponent(msg)}`);
    } catch {
      Alert.alert("Error", "WhatsApp not installed.");
    }
  };

  const sendSMS = async (contact: any) => {
    const msg = await buildMessage();
    Linking.openURL(`sms:${contact.phone}?body=${encodeURIComponent(msg)}`);
  };

  const callContact = (contact: any) => {
    Linking.openURL(`tel:${contact.phone}`);
  };

  const emailContact = async (contact: any) => {
    if (!contact.email) {
      Alert.alert("No Email", "This contact has no email address.");
      return;
    }
    const coords = await getLocation();
    try {
      await axios.post(
        `${BASE_URL}/send-emergency-email`,
        { email: contact.email, latitude: coords?.latitude, longitude: coords?.longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Emergency email sent.");
    } catch (err) {
      Alert.alert("Error", "Failed to send emergency email.");
    }
  };

  const sos = async (contact: any) => {
    try {
      setSendingSOS(true);

      await sendEmergencyEmail(contact);
      await sendWhatsApp(contact);
      await sendSMS(contact);

      setTimeout(() => {
        setSendingSOS(false);
        callContact(contact);
      }, 800);
    } catch (err) {
      setSendingSOS(false);
      Alert.alert("Error", "Failed to send emergency alerts.");
    }
  };

  const primaryContact = contacts[0] || null;

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <LinearGradient colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.glowTop} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
         <Ionicons
  name="medkit-outline"
  size={60}
  color="#4ade80"
  style={{ alignSelf: "center", marginBottom: 15 }}
/>

<Text style={styles.pageTitle}>Emergency Support</Text>

<Text style={styles.subtitle}>
  Quickly access emergency contacts, important medical information, and support resources whenever you need immediate assistance.
</Text>

          {/* SOS — radar pulse */}
          <View style={styles.sosWrapper}>
            <PulseRing delay={0} active={sendingSOS} />
            <PulseRing delay={600} active={sendingSOS} />
            <PulseRing delay={1200} active={sendingSOS} />

            <View style={styles.sosButtonWrap}>
              <SOSButton
                disabled={sendingSOS}
                onPress={() => {
                  if (sendingSOS) return;

                  if (!primaryContact) {
                    Alert.alert("No Contact", "Add an emergency contact first.");
                    return;
                  }

                  sos(primaryContact);
                }}
              />
            </View>
          </View>

          {/* Contact List */}
          <View style={styles.sectionRow}>
            <SectionHeader label="Favourite Contacts" icon="happy-outline" color="#4ade80" />
            {contacts.length < 5 && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate("EmergencyContacts", { contact: null })}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {contacts.length === 0 ? (
            <View style={[styles.card, styles.emptyCard]}>
              <Ionicons name="person-add-outline" size={32} color="#4ade80" />
              <Text style={styles.emptyText}>No emergency contacts yet</Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => navigation.navigate("EmergencyContacts", { contact: null })}
              >
                <Text style={styles.emptyAddBtnText}>Add First Contact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            contacts.map((contact, index) => (
              <View key={contact.id} style={[styles.card, index === 0 && styles.primaryCard]}>
                {index === 0 && (
                  <View style={styles.priorityBadge}>
                    <Ionicons name="star" size={10} color="#facc15" />
                    <Text style={styles.priorityText}>Priority Contact</Text>
                  </View>
                )}

                <View style={styles.contactHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                      {contact.name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>{contact.relationship || "Emergency Contact"}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editIconBtn}
                    onPress={() => navigation.navigate("EmergencyContacts", { contact })}
                  >
                    <Ionicons name="create-outline" size={30} color="#999" />
                  </TouchableOpacity>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => callContact(contact)}>
                    <Ionicons name="call" size={16} color="#4ade80" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => sendWhatsApp(contact)}>
                    <Ionicons name="logo-whatsapp" size={16} color="#4ade80" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => sendSMS(contact)}>
                    <Ionicons name="chatbox" size={16} color="#4ade80" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => emailContact(contact)}>
                    <Ionicons name="mail" size={16} color="#4ade80" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(contact.id, contact.name)}>
                  <Ionicons name="trash-outline" size={14} color="#f87171" />
                  <Text style={styles.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {contacts.length >= 5 && (
            <Text style={styles.limitNote}>Maximum 5 emergency contacts reached</Text>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
  },

  scroll: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  pageTitle: {
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle:{
     fontSize: 12,
    color: '#999',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
},
  // ── SOS radar pulse ──
  sosWrapper: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    backgroundColor: '#ff1111ff',
    borderRadius: 100
  },

  pulseRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
  },

  sosButtonWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  card: {
    width: CARD_WIDTH,
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
  },

  primaryCard: {
    borderColor: "rgba(250,204,21,0.35)",
  },

  priorityBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(250,204,21,0.12)",
    borderRadius: 30, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: "rgba(250,204,21,0.3)",
    marginBottom: 15,
  },
  priorityText: { color: "#facc15", fontSize: 10, fontFamily: "Poppins_400Regular" },

  contactHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 15 },
  avatarWrap: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#004927ff",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#4ade80", fontSize: 18, fontFamily: "Poppins_500Medium" },
  contactName: { color: "#fff", fontSize: 14, fontFamily: "Poppins_500Medium" },
  contactRelation: { color: "#4ade80", fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 1 },
  editIconBtn: {},

  actionRow: { flexDirection: "row", gap: 8, marginBottom: 15 },
  actionBtn: {
    flex: 1, flexDirection: "column", alignItems: "center", gap: 4,
    paddingVertical: 12, borderRadius: 12,
    backgroundColor: "rgba(74,222,128,0.08)",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.2)",
  },

  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 12, borderRadius: 12,
    backgroundColor: "rgba(248,113,113,0.08)",
    borderWidth: 1, borderColor: "rgba(248,113,113,0.2)",
  },
  deleteBtnText: { color: "#f87171", fontSize: 12, fontFamily: "Poppins_400Regular" },

  sectionRow: { width: CARD_WIDTH, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: "#004927ff",
    borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,
    marginBottom: 15,
  },
  addBtnText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },

  emptyCard: { alignItems: "center", paddingVertical: 20, gap: 15 },
  emptyText: { color: "#aaa", fontSize: 12, fontFamily: "Poppins_400Regular" },
  emptyAddBtn: {
     paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
    backgroundColor: "#004927ff",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.3)", marginTop: 5
  },
  emptyAddBtnText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },

  limitNote: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 4,
    width: CARD_WIDTH,
  },
});