import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "../api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.89;

export default function ResetPasswordScreen({ navigation, route }: any) {
  const { resetToken } = route.params;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields");
      return;
    }

    if (!/^(?=.*[0-9]).{8,}$/.test(newPassword)) {
      setError("Password must be at least 8 characters and include 1 number");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/reset-password`, {
        resetToken,
        newPassword,
        confirmPassword,
      });

      // Show the success card first, then redirect after a short delay
      // so the user actually sees confirmation before landing on Login.
      setSuccess(true);

      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.6)", "rgba(5,15,10,0.92)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          style={{ flex: 1 }}
        >
          <View style={styles.overlay}>

            <View style={styles.card}>
             <Ionicons
  name="lock-closed-outline"
  size={60}
  color="#4ade80"
  style={{ alignSelf: "center", marginBottom: 15 }}
/>
                  <Text style={styles.title}>Choose New Password</Text>
                  <Text style={styles.subtitle}>
                    Create a strong password you haven't used before.
                  </Text>
 {success ? (
                <View style={styles.successWrap}>
                  <View style={styles.successIconWrap}>
                    <Ionicons name="checkmark-circle" size={64} color="#4ade80" />
                  </View>
                  <Text style={styles.title}>Password Reset!</Text>
                  <Text style={styles.subtitle}>
                    Your password has been changed successfully.{"\n"}Redirecting to login...
                  </Text>
                </View>
              ) : (
                <>
                  {error ? (
                    <View style={styles.errorWrap}>
                      <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color="#999" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (error) setError("");
                      }}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={18}
                        color={showPassword ? "#4ade80" : "#999"}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color="#999" />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showConfirm}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (error) setError("");
                      }}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirm((s) => !s)}>
                      <Ionicons
                        name={showConfirm ? "eye-outline" : "eye-off-outline"}
                        size={18}
                        color={showConfirm ? "#4ade80" : "#999"}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleReset}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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

  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(0,73,39,0.5)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    alignSelf: "center",
  },

  title: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 12,
    color: "#aaa",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
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

  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    alignSelf: "flex-start",
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
    width: "100%",
  },

  errorText: {
    color: "#f87171",
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
    marginTop: 5,
    paddingVertical: 12,
  },

  submitText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  successWrap: {
    alignItems: "center",
  },

  successIconWrap: {
    marginBottom: 20,
  },
});