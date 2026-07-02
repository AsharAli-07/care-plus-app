import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, Alert, ImageBackground, StyleSheet,
  StatusBar, ScrollView, TouchableOpacity, Animated,
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

export default function Emergency({ navigation }: any) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [token, setToken] = useState("");
  const [sendingSOS, setSendingSOS] = useState(false);

  // ── Blinking SOS animation ──────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false, // color interpolation needs JS driver
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const animatedBackgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 55, 55, 0.30)", "rgba(220, 0, 0, 0.75)"],
  });

  const animatedBorderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(248, 113, 113, 0.25)", "rgba(255, 60, 60, 1)"],
  });

  const animatedShadowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

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

  // ── FIXED: surface the real error so we can see why delete fails ───────
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

    // Send email first
    await sendEmergencyEmail(contact);

    // Send WhatsApp
    await sendWhatsApp(contact);

    // Send SMS
    await sendSMS(contact);

    // Keep button dark for a short moment so user sees success
    setTimeout(() => {
      setSendingSOS(false);

      // Open call AFTER the UI has updated
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

        <View style={styles.overlay}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.pageTitle}>Emergency Support</Text>

            {/* SOS — animated blinking red card */}
<Animated.View
  style={[
    styles.sosCard,
    {
      backgroundColor: sendingSOS
        ? "#8B0000"
        : animatedBackgroundColor,
      borderColor: sendingSOS
        ? "#ff4444"
        : animatedBorderColor,
      shadowOpacity: sendingSOS
        ? 0.6
        : animatedShadowOpacity,
    },
  ]}
><SOSButton
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
            </Animated.View>

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
                <Ionicons name="person-add-outline" size={32} color="rgba(74,222,128,0.4)" />
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
                      <Ionicons name="create-outline" size={18} color="#aaa" />
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
        </View>
      </ImageBackground>
    </View>
  );
}

const cardBase = {
  borderColor: "rgba(74,222,128,0.3)",
  borderWidth: 1,
  backgroundColor: "rgba(0, 26, 17, 0.53)",
  shadowColor: "#004927",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.55,
  shadowRadius: 14,
  elevation: 6,
};

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  scroll: { marginTop: 40, paddingHorizontal: 20 },
  glowTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
  },
  pageTitle: {
    fontSize: 20, fontFamily: "Poppins_500Medium",
    color: "#fff", textAlign: "center", marginBottom: 30,
  },
  sosCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 8, borderRadius: 25,
    borderWidth: 1, marginBottom: 30,
    shadowColor: "#ff0000",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    ...cardBase,
    borderRadius: 25,
    padding: 16,
    marginBottom: 15,
  },
  primaryCard: {
    borderColor: "rgba(250,204,21,0.35)",
    shadowColor: "#bd712eff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  priorityBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(250,204,21,0.12)",
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: "rgba(250,204,21,0.3)",
    marginBottom: 12,
  },
  priorityText: { color: "#facc15", fontSize: 10, fontFamily: "Poppins_400Regular" },

  contactHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 15 },
  avatarWrap: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "rgba(0,73,39,0.6)",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#4ade80", fontSize: 18, fontFamily: "Poppins_600SemiBold" },
  contactName: { color: "#fff", fontSize: 14, fontFamily: "Poppins_400Regular" },
  contactRelation: { color: "#4ade80", fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 1 },
  editIconBtn: {},

  actionRow: { flexDirection: "row", gap: 8, marginBottom: 15 },
  actionBtn: {
    flex: 1, flexDirection: "column", alignItems: "center", gap: 4,
    paddingVertical: 10, borderRadius: 12,
    backgroundColor: "rgba(74,222,128,0.08)",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.2)",
  },

  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 8, borderRadius: 12,
    backgroundColor: "rgba(248,113,113,0.08)",
    borderWidth: 1, borderColor: "rgba(248,113,113,0.2)",
  },
  deleteBtnText: { color: "#f87171", fontSize: 12, fontFamily: "Poppins_400Regular" },

  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: "#004927",
    borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,
    shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, marginBottom: 15,
  },
  addBtnText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },

  emptyCard: { alignItems: "center", paddingVertical: 30, gap: 10 },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Poppins_400Regular" },
  emptyAddBtn: {
    marginTop: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
    backgroundColor: "#004927",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.3)",
  },
  emptyAddBtnText: { color: "#ffffffff", fontSize: 12, fontFamily: "Poppins_400Regular" },

  limitNote: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Poppins_400Regular", textAlign: "center", marginTop: 4 },
});