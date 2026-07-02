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
import { Ionicons } from "@expo/vector-icons";

const ChangePassword = ({ navigation }: any) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
    const [privacyMode, setPrivacyMode] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        <View style={styles.card}>

          <Text style={styles.heading}>Change Password</Text>

          {/* ERROR MESSAGE */}
         {error ? (
  <View style={styles.errorWrap}>
    <Ionicons
      name="alert-circle-outline"
      size={16}
      color="#f87171"
    />
    <Text style={styles.errorText}>{error}</Text>
  </View>
) : null}



          {/* NEW PASSWORD */}
<Text style={styles.label}>New Password</Text>

<View style={styles.passwordWrap}>
  <TextInput
    style={styles.passwordInput}
    placeholder="New Password"
    placeholderTextColor="#999"
    secureTextEntry={!showNewPassword}
    value={newPassword}
    onChangeText={setNewPassword}
    editable={!privacyMode}
    autoCapitalize="none"
  />

  <TouchableOpacity
    onPress={() => setShowNewPassword((s) => !s)}
  >
    <Ionicons
      name={showNewPassword ? "eye-outline" : "eye-off-outline"}
      size={18}
      color={showNewPassword ? "#4ade80" : "#999"}
    />
  </TouchableOpacity>
</View>

          {/* CONFIRM PASSWORD */}
<Text style={styles.label}>Confirm Password</Text>

<View style={styles.passwordWrap}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Confirm Password"
    placeholderTextColor="#999"
    secureTextEntry={!showConfirmPassword}
    value={confirmPassword}
    onChangeText={setConfirmPassword}
    editable={!privacyMode}
    autoCapitalize="none"
  />

  <TouchableOpacity
    onPress={() => setShowConfirmPassword((s) => !s)}
  >
    <Ionicons
      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
      size={18}
      color={showConfirmPassword ? "#4ade80" : "#999"}
    />
  </TouchableOpacity>
</View>

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={changePassword}
          >
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>

        </View>
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
    borderRadius: 25,
      borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
     backgroundColor: "rgba(0, 26, 17, 0.53)",
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
passwordWrap: {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10,
  marginBottom: 15,
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.08)",
},

passwordInput: {
  flex: 1,
  paddingVertical: 10,
  color: "#fff",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
},

errorWrap: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  backgroundColor: "rgba(248,113,113,0.1)",
  borderRadius: 10,
  padding: 10,
  borderWidth: 1,
  borderColor: "rgba(248,113,113,0.2)",
  marginBottom: 16,
},

errorText: {
  color: "#f87171",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
  flex: 1,
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