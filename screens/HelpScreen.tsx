import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Dimensions,
  Animated,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "../api";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HelpScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSendOTP = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/forgot-password`, {
        email: email.trim(),
      });

      navigation.navigate("VerifyOTP", {
        email: email.trim(),
      });
    } catch (err: any) {
      const message = err?.response?.data?.message;

      if (message === "User not found") {
        setError("No account found with this email");
      } else {
        setError("Unable to send reset code. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

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
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: false,
                listener: (event: any) => {
                  const slide = Math.round(
                    event.nativeEvent.contentOffset.x / width
                  );
                  setActiveIndex(slide);
                },
              }
            )}
            scrollEventThrottle={16}
          >
            {/* FORGOT PASSWORD */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Forgot Password?</Text>
              {!keyboardVisible && (
                <Text style={styles.description}>
                  Enter your email, and we will send an OTP to your email to reset your password.
                </Text>
              )}
              {error ? (
                <View style={styles.errorWrap}>
                  <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={16} color="#999" />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#999"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError("");
                  }}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Send Code</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* REGISTER */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Register Yourself</Text>
              <Text style={styles.description}>
                Create your Care Plus account and start your wellness journey.
              </Text>
              <TouchableOpacity
                style={[styles.button, { marginTop: 0 }]}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.buttonText}>Go To Register</Text>
              </TouchableOpacity>
            </View>
          </Animated.ScrollView>

          {!keyboardVisible && (
            <View style={styles.dotContainer}>
              {[0, 1].map((_, index) => {
                const inputRange = [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ];

                const animatedWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [10, 20, 10],
                  extrapolate: "clamp",
                });

                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.4, 1, 0.4],
                  extrapolate: "clamp",
                });

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        width: animatedWidth,
                        opacity,
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    alignItems: "center",
    height: "100%",
    justifyContent: 'center',
  },
  card: {
    width: width * 0.89,
    height: 350,
    borderRadius: 25,
    overflow: "hidden",
    padding: 20,
    marginHorizontal: 20,
    justifyContent: "center",
    alignSelf: "center",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
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
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Poppins_500Medium",
  },
  description: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
    fontSize: 12,
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },
  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    marginTop: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: 'Poppins_400Regular'
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: 'absolute',
    bottom: 200,
  },
  submitText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 5,
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
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});