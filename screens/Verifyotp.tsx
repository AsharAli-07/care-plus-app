import React, { useState, useRef, useEffect } from "react";
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function VerifyOTP({ navigation, route }: any) {
  const { email } = route.params;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (text: string, index: number) => {
    // Only allow single digit
    const clean = text.replace(/[^0-9]/g, "");
    const newDigits = [...digits];

    if (clean.length > 1) {
      // Handle paste of full code
      const pasted = clean.slice(0, OTP_LENGTH).split("");
      pasted.forEach((d, i) => {
        if (i < OTP_LENGTH) newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = clean;
    setDigits(newDigits);

    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setError("");
    const otp = digits.join("");

    if (otp.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
      navigation.navigate("ResetPasswordScreen", { resetToken: res.data.resetToken });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/forgot-password`, { email });
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: '100%', width: '100%' }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.6)", "rgba(5,15,10,0.92)"]}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
           

            <View style={styles.iconWrap}>
              <Ionicons name="shield-checkmark-outline" size={32} color="#4ade80" />
            </View>

            <Text style={styles.title}>Verify Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{"\n"}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <View style={styles.otpRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[styles.otpBox, digit && styles.otpBoxFilled]}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH} // allow paste detection
                  textAlign="center"
                  selectionColor="#4ade80"
                />
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendWrap}
              onPress={handleResend}
              disabled={cooldown > 0 || resending}
            >
              <Text style={styles.resendText}>
                {resending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : "Didn't get the code? Resend"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18, alignSelf: 'center',
   
   
     backgroundColor: "rgba(74,222,128,0.10)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.30)",
    alignItems: "center", justifyContent: "center", marginBottom: 15,

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
    color: "#aaa",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 32,
  },
  emailText: {
    color: "#4ade80",
    fontFamily: "Poppins_500Medium",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpBox: {
    width: 38,
    height: 45,
    borderRadius: 14,
     backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    paddingLeft: 13
  },
  otpBoxFilled: {
    borderColor: "rgba(74,222,128,0.5)",
    backgroundColor: "rgba(74,222,128,0.08)",
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 14,
    textAlign: "center",
  },
  submitBtn: {
  backgroundColor: "#004927ff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",
  paddingVertical: 12,
 
   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
  },
  submitText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  resendWrap: {
    alignItems: "center",
    marginTop: 15,
  },
  resendText: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});