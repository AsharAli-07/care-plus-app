import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground, StatusBar
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { BASE_URL } from "../api";
import { LinearGradient } from "expo-linear-gradient";

const ChangePassword = ({ navigation }: any) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
    const [privacyMode, setPrivacyMode] = useState(false);

  // 🔒 Password validation: 8+ chars + number
  const isValidPassword = (password: string) => {
    return /^(?=.*[0-9]).{8,}$/.test(password);
  };

const changePassword = async () => {
  setError("");

  // Privacy mode enabled
  if (privacyMode) {
    setError("Password changes are disabled while Privacy Mode is enabled");
    return;
  }

  if (!newPassword || !confirmPassword) {
    setError("Please fill all fields");
    return;
  }

  if (newPassword !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  if (!isValidPassword(newPassword)) {
    setError(
      "Password must be at least 8 characters and include 1 number"
    );
    return;
  }

  try {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.put(
      `${BASE_URL}/change-password`,
      {
        newPassword,
        confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Alert.alert("Success", res.data.message);

    setNewPassword("");
    setConfirmPassword("");

    navigation.goBack();
  } catch (err: any) {
    setError(
      err?.response?.data?.message || "Something went wrong"
    );
  }
};
const loadUser = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    setPrivacyMode(res.data.privacy_mode);

  } catch (error) {
    console.log("LOAD USER ERROR:", error);
  }
};

  useEffect(() => {
    loadUser();
  }, []);
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

          <Text style={styles.heading}>Change Password</Text>

          {/* ERROR MESSAGE */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}



          {/* NEW PASSWORD */}
          <Text style={styles.label}>New Password</Text>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            editable={!privacyMode}
          />

          {/* CONFIRM PASSWORD */}
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            editable={!privacyMode}
          />

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={changePassword}
          >
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>

        </BlurView>
        </View>
</ImageBackground>
      </View>
    
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  card: {
    padding: 20,
    borderRadius: 12,
      borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
  },

  heading: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Poppins_500Medium",
  },

  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    paddingHorizontal: 15,

    backgroundColor: "#1f2820e1",

    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",

    marginBottom: 15,
  },

  button: {
    backgroundColor: "#004927",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
      borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
  },

  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },

  errorText: {
    color: "#ff4d4d",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 15,
    textAlign:'center'
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