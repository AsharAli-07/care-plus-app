import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ImageBackground, StatusBar, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "../api";

export default function EmergencyContacts({ navigation, route }: any) {
  const existingContact = route?.params?.contact || null;
  const isEditing = !!existingContact;

  const [name, setName] = useState(existingContact?.name || "");
  const [phone, setPhone] = useState(existingContact?.phone ? formatDisplayPhone(existingContact.phone) : "");
  const [email, setEmail] = useState(existingContact?.email || "");
  const [relationship, setRelationship] = useState(existingContact?.relationship || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function formatDisplayPhone(text: string) {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
    if (cleaned.length > 4) return cleaned.slice(0, 4) + " " + cleaned.slice(4);
    return cleaned;
  }

  const getCleanPhone = (text: string) => text.replace(/\D/g, "");

  const save = async () => {
    setError("");
    setSuccess("");
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone number are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const payload = {
        name: name.trim(),
        phone: getCleanPhone(phone),
        email: email.trim() || null,
        relationship: relationship.trim(),
      };

      if (isEditing) {
        await axios.put(`${BASE_URL}/favourite-contact/${existingContact.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Contact updated successfully");
      } else {
        await axios.post(`${BASE_URL}/favourite-contact`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Contact saved successfully");
      }

      setTimeout(() => navigation.goBack(), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save contact. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const RELATIONSHIP_OPTIONS = ["Parent", "Sibling", "Partner", "Friend", "Doctor", "Other"];

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: '100%', width: '100%' }}
        resizeMode="cover"
      >
        <LinearGradient colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.glowTop} />

        <View style={styles.overlay}>
          {/* Back button */}
       

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            {/* Header */}


            <View style={styles.card}>
                    <Ionicons
  name="person-add-outline"
  size={60}
  color="#4ade80"
  style={{ alignSelf: "center", marginBottom: 15 }}
/>

<Text style={styles.title}>Add Emergency Contacts</Text>

<Text style={styles.subtitle}>
  Add trusted family members or friends who can be contacted quickly during an emergency or when urgent assistance is needed.
</Text>
              {error ? (
                <View style={styles.errorWrap}>
                  <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              {success ? (
                <View style={styles.successWrap}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4ade80" />
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}

              {/* Name */}
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={16} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Phone */}
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={16} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="0300 1234567"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={phone}
                  onChangeText={(t) => setPhone(formatDisplayPhone(t))}
                />
              </View>

              {/* Email */}
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={16} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Relationship */}
              <Text style={styles.label}>Relationship</Text>
              <View style={styles.chipRow}>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, relationship === r && styles.chipActive]}
                    onPress={() => setRelationship(relationship === r ? "" : r)}
                  >
                    <Text style={[styles.chipText, relationship === r && styles.chipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Custom relationship input */}
              {!RELATIONSHIP_OPTIONS.includes(relationship) ? (
                <View style={[styles.inputWrap, { marginTop: 10 }]}>
                  <Ionicons name="heart-outline" size={16} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Or type a relationship"
                    placeholderTextColor="#999"
                    value={relationship}
                    onChangeText={setRelationship}
                  />
                </View>
              ) : null}

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={save}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name={isEditing ? "checkmark-circle-outline" : "person-add-outline"} size={18} color="#ffffffff" />
                    <Text style={styles.saveBtnText}>{isEditing ? "Update Contact" : "Save Contact"}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
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
  overlay: { flex: 1,  },
  scroll:  { paddingBottom: 40, paddingHorizontal: 20,paddingTop: 40 },



  headerWrap: { alignItems: "center", marginBottom: 30 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 18,
     backgroundColor: "rgba(74,222,128,0.10)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.30)",
    alignItems: "center", justifyContent: "center", marginBottom: 15,
  },
  title: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium", marginBottom: 5, textAlign: 'center' },
  subtitle: {
    color: "#aaa", fontSize: 12,
    fontFamily: "Poppins_400Regular", textAlign: "center",
     lineHeight: 18,
     marginBottom: 30
  },

  card: {
    borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,
  backgroundColor: "rgba(0, 26, 17, 0.50)",
    borderRadius: 25, padding: 20,
  },

  errorWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(248,113,113,0.1)", borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: "rgba(248,113,113,0.2)", marginBottom: 16,
  },
  errorText: { color: "#f87171", fontSize: 10, fontFamily: "Poppins_400Regular", flex: 1 },

  successWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(74,222,128,0.1)", borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", marginBottom: 16,
  },
  successText: { color: "#4ade80", fontSize: 12, fontFamily: "Poppins_400Regular", flex: 1 },

  label: { color: "#fff", fontSize: 12, fontFamily: "Poppins_500Medium", marginBottom: 8 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  input: {
    flex: 1, color: "#fff", fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 15, marginBottom: 10 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  chipActive: {
    backgroundColor: "#004927",
    borderColor: "rgba(74,222,128,0.4)",
  },
  chipText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  chipTextActive: { color: "#fff", fontFamily: "Poppins_500Medium" },

  saveBtn: {
    flexDirection: "row",   backgroundColor: "#004927ff",
  padding: 10,
  paddingVertical: 12,
  borderRadius: 13,
  alignItems: "center",
  width: "100%",
  marginTop: 10,
   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
     gap: 10,
    justifyContent: 'center'
  },
  saveBtnText: { color: "#ffffffff", fontSize: 12, fontFamily: "Poppins_400Regular" },
});