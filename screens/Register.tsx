import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedSuccessIcon from "../components/AnimatedSuccessIcon";

const { width } = Dimensions.get("window");

// Same sizing approach as HelpScreen: full-width card with ~20px gutters
const CARD_WIDTH = width * 0.89;

const Register = ({ navigation }: any) => {
  const [error, setError] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [showConfirm, setShowConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1 State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValidPassword = (password: string) => {
    return /^(?=.*[0-9]).{8,}$/.test(password);
  };

  const goNext = () => {
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    if (phone.replace(/\D/g, "").length !== 11) {
      setError("Please enter a valid phone number");
      return;
    }
    Animated.timing(slideAnim, {
      toValue: -CARD_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const goBack = () => {
    setError("");
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const registerUser = async () => {
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters and include 1 number");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/register`, {
        name,
        email,
        password,
        phone_number: phone,
      });

      // Store the token right away — same as /login — so the new user
      // is authenticated immediately and Settings/Dashboard/Notifications
      // don't 401 on first load.
      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
      }

      // Slide to success card
      Animated.timing(slideAnim, {
        toValue: -CARD_WIDTH * 2,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("Account already exists with this email");
      } else {
        setError(err?.response?.data?.message || "Registration failed");
      }
    }
  };

  function formatDisplayPhone(text: string) {
    let cleaned = text.replace(/\D/g, "");

    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }

    if (cleaned.length > 4) {
      return cleaned.slice(0, 4) + " " + cleaned.slice(4);
    }

    return cleaned;
  }

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
          <View style={styles.viewport}>
            <Animated.View
              style={[styles.track, { transform: [{ translateX: slideAnim }] }]}
            >
              {/* CARD 1 */}
              <View style={styles.card}>
                <Text style={styles.heading}>Create Account</Text>
                {error ? (
                  <View style={styles.errorWrap}>
                    <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                <Text style={styles.label}>Full Name</Text>

                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={16} color="#999" />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                    placeholderTextColor="#999"
                  />
                </View>

                <Text style={styles.label}>Email</Text>

                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={16} color="#999" />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.label}>Phone Number</Text>

                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={16} color="#999" />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    keyboardType="numeric"
                    onChangeText={(text) => setPhone(formatDisplayPhone(text))}
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#999"
                  />
                </View>

                <TouchableOpacity style={styles.button} onPress={goNext}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>

              {/* CARD 2 */}
              <View style={styles.card}>
                <Text style={styles.heading}>Set Password</Text>
                {error ? (
                  <View style={styles.errorWrap}>
                    <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                <Text style={styles.label}>Password</Text>

                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={16} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Create Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
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

                <Text style={styles.label}>Confirm Password</Text>

                <View style={styles.inputWrap}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#999" />
                  <TextInput
                    style={styles.input}
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
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

                <TouchableOpacity style={styles.button} onPress={registerUser}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goBack}>
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
              </View>

              {/* CARD 3 */}
              <View style={styles.card}>
                <Text style={styles.heading}>Account Created</Text>
                <AnimatedSuccessIcon />
                <TouchableOpacity
                  style={[styles.button, { marginTop: 20 }]}
                  onPress={() => navigation.replace("Onboarding")}
                >
                  <Text style={styles.buttonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    marginBottom: 30,
  },

  viewport: {
    width: CARD_WIDTH,
    overflow: "hidden",
    alignSelf: "center",
  },

  track: {
    flexDirection: "row",
    width: CARD_WIDTH * 3,
  },

  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
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

  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  backText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
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
    marginBottom: 15,
    width: "100%",
  },

  errorText: {
    color: "#f87171",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    flex: 1,
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