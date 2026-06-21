import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground, StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
export default function EmergencyContacts() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await AsyncStorage.getItem("emergency_contact");
    if (data) {
      const c = JSON.parse(data);
      setName(c.name);
      setPhone(formatDisplayPhone(c.phone));
      setRelationship(c.relationship);
    }
  };

  // ✅ display format: 0300 1234567
  const formatDisplayPhone = (text: string) => {
    let cleaned = text.replace(/\D/g, "");

    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);

    if (cleaned.length > 4) {
      return cleaned.slice(0, 4) + " " + cleaned.slice(4);
    }

    return cleaned;
  };

  // ✅ save clean number only
  const getCleanPhone = (text: string) => {
    return text.replace(/\D/g, "");
  };

  const save = async () => {
    setMessage("");

    if (!name || !phone) {
      setMessage("Name and Phone are required");
      return;
    }

    const cleanPhone = getCleanPhone(phone);

    await AsyncStorage.setItem(
      "emergency_contact",
      JSON.stringify({
        name,
        phone: cleanPhone,
        relationship,
      })
    );

    setMessage("Contact saved successfully");
  };

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

        <BlurView intensity={50} tint="dark" style={styles.card}>

          <Text style={styles.title}>Emergency Contact</Text>

          {message ? (
            <Text style={styles.success}>{message}</Text>
          ) : null}

          {/* NAME */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Enter name"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          {/* PHONE */}
          <Text style={styles.label}>Phone</Text>
          <TextInput
            placeholder="0300 1234567"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            style={styles.input}
            value={phone}
            onChangeText={(text) =>
              setPhone(formatDisplayPhone(text))
            }
          />

          {/* RELATIONSHIP */}
          <Text style={styles.label}>Relationship</Text>
          <TextInput
            placeholder="Enter relationship"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={relationship}
            onChangeText={setRelationship}
          />

          {/* BUTTON */}
          <TouchableOpacity style={styles.btn} onPress={save}>
            <Text style={styles.btnText}>Save Contact</Text>
          </TouchableOpacity>

        </BlurView>

      </View>
    </ImageBackground>
      </View>

  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
      borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
    alignSelf: 'center',

  },

  title: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    marginBottom: 15,
  },

  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    alignSelf: "flex-start",
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  btn: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
       borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  success: {
    color: "#00ff88",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 15,
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
    overlay: {
 flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});