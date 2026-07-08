import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.89;

const ChangePassword = ({ navigation }: any) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔒 Password validation: 8+ chars + number
  const isValidPassword = (password: string) => {
    return /^(?=.*[0-9]).{8,}$/.test(password);
  };

  const changePassword = async () => {
    setError("");

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
      setError("Password must be at least 8 characters and include 1 number");
      return;
    }

    try {
      setLoading(true);

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
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
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

    setPrivacyMode(!!res.data.privacy_mode); // coerce 0/1 to false/true
  } catch (error) {
    console.log("LOAD USER ERROR:", error);
  }
};

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
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

        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={styles.card}>
             <Ionicons
                          name={"shield-checkmark-outline"}
                          size={60}
                          color={"#4ade80"}
                          style={{alignSelf: 'center', marginBottom: 15}}
                       
                        />
            <Text style={styles.heading}>Change Password</Text>
            <Text style={styles.subtitle}>
      
              Connect your smartwatch to sync health data, monitor vitals, and get real-time alerts.
            </Text>

            {error ? (
              <View style={styles.errorWrap}>
                <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {privacyMode && (
              <View style={styles.infoWrap}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#4ade80" />
                <Text style={styles.infoText}>
                  Turn off Privacy Mode in Settings to change your password.
                </Text>
              </View>
            )}

            {/* NEW PASSWORD */}
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={16} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#999"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (error) setError("");
                }}
                editable={!privacyMode}
                autoCapitalize="none"
                maxLength={64}
              />
              <TouchableOpacity onPress={() => setShowNewPassword((s) => !s)}>
                <Ionicons
                  name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color={showNewPassword ? "#4ade80" : "#999"}
                />
              </TouchableOpacity>
            </View>

            {/* CONFIRM PASSWORD */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) setError("");
                }}
                editable={!privacyMode}
                autoCapitalize="none"
                maxLength={64}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((s) => !s)}>
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color={showConfirmPassword ? "#4ade80" : "#999"}
                />
              </TouchableOpacity>
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.button, (loading || privacyMode) && { opacity: 0.7 }]}
              onPress={changePassword}
              disabled={loading || privacyMode}
            >
              <Text style={styles.buttonText}>
                {loading ? "Updating..." : "Update Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 25,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
  },

  heading: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
    fontFamily: "Poppins_500Medium",
  },
subtitle:{
     fontSize: 12,
    color: '#aaa',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
},
  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    alignSelf: "flex-start",
  },

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
    flex: 1,
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

  infoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(74,222,128,0.08)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.2)",
    marginBottom: 16,
  },

  infoText: {
    color: "#4ade80",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },

  button: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    marginTop: 10,
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