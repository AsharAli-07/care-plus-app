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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "../api";

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
  setError(
    "Password must be at least 8 characters and include 1 number"
  );
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
      navigation.reset({
  index: 0,
  routes: [{ name: "Login" }],
});
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
      <View style={styles.overlay}>
         <View style={styles.iconWrap}>
                  <Ionicons name="key-outline" size={32} color="#4ade80" />
                </View>
  <View style={styles.card}>
          

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
               

                <Text style={styles.title}>Choose New Password</Text>
                <Text style={styles.subtitle}>
                  Create a strong password you haven't used before.
                </Text>
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

   <Text style={styles.label}>New Password</Text>

<View style={styles.inputWrap}>
    <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.4)" />
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
  />

  <TouchableOpacity
    onPress={() => setShowPassword((s) => !s)}
  >
    <Ionicons
      name={showPassword ? "eye-outline" : "eye-off-outline"}
      size={18}
      color={showPassword ? "#4ade80" : "#999"}
    />
  </TouchableOpacity>
</View>
<Text style={styles.label}>Confirm New Password</Text>
                <View style={[styles.inputWrap, {marginBottom: 0}]}>
                  <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.4)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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
                    <ActivityIndicator color="#052e16" />
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
    paddingHorizontal: 20

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
    width: '100%',
  padding: 20,
  borderRadius: 25,
  alignItems: "center",
  borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
 backgroundColor: "rgba(0, 26, 17, 0.53)",
  shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
    },
  backBtn: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#004927",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
 inputWrap: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: 10,
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
    alignSelf: 'flex-start'
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
  marginTop: 15,
  marginBottom: 5,
  width: "100%",
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
  marginTop: 15,
  borderColor: "rgba(74,222,128,0.3)",
  borderWidth: 1,
  shadowColor: "#004927",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.55,
  shadowRadius: 14,
  elevation: 6,
  width: '100%'
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