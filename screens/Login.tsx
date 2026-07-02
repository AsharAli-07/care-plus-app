import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../api';






const Login = ({ navigation }: any) => {
const [error, setError] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ======================
  // 🔐 LOGIN
  // ======================
const handleLogin = async () => {
  setError("");

  if (!email.trim() || !password.trim()) {
    setError("Please fill all fields");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    setError("Please enter a valid email address");
    return;
  }

  if (password.length < 6) {
    setError("Password is too short");
    return;
  }

  try {
    setLoading(true);

    const res = await axios.post(`${BASE_URL}/login`, {
      email: email.trim(),
      password,
    });

    await AsyncStorage.setItem("token", res.data.token);

    navigation.replace("Start");

  } catch (err: any) {
    const message = err?.response?.data?.message;

    if (
      message?.toLowerCase().includes("invalid") ||
      message?.toLowerCase().includes("incorrect")
    ) {
      setError("Incorrect email or password");
    } else {
      setError(message || "Login failed");
    }
  } finally {
    setLoading(false);
  }
};

  // ======================
  // 🔐 AUTO LOGIN CHECK
  // ======================
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) return;

      // optional but BEST practice
      const res = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: token,
        },
      });

      if (res.data) {
        navigation.replace("Start");
      }

    } catch (err) {
      console.log("Auto login failed");
      await AsyncStorage.removeItem("token");
    }
  };

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
      <View style={styles.centerWrapper}>

        <View style={styles.cardWrapper}>

          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
          />
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
<Text style={styles.label}>
                            Email
                          </Text>
          
            <View style={styles.inputWrap}>
  <Ionicons name="mail-outline" size={16} color="rgba(255,255,255,0.4)" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              style={styles.input}
              value={email}
              onChangeText={(text) => {
  setEmail(text);
  if (error) setError("");
}}
            />
          </View>
<Text style={styles.label}>
                            Password
                          </Text>
          
            
  <View style={styles.inputWrap}>
  <Ionicons name="lock-closed-outline" size={16} color="rgba(255,255,255,0.4)" />
  <TextInput
    style={styles.passwordInput}
    placeholder="Password"
    placeholderTextColor="#999"
    secureTextEntry={!showPassword}
    value={password}
    onChangeText={(text) => {
  setPassword(text);
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
            
        

          <TouchableOpacity onPress={() => navigation.navigate('Help')}>
            <Text style={styles.helpText}>Need Help?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

        </View>

      </View>
    </ImageBackground>
    </View>
  );
};


const styles = StyleSheet.create({

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
  container: {
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
centerWrapper: {
  flex: 1,
  justifyContent: "center",   // ✅ vertical center
  alignItems: "center",       // ✅ horizontal center
  padding: 20,
},

cardWrapper: {
  width: '100%',
  paddingRight: 20,
  paddingBottom: 20,
  paddingLeft: 20,
  borderRadius: 25,
  alignItems: "center",
  borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
 backgroundColor: "rgba(0, 26, 17, 0.53)",
  shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
},

logo: {
  width: 150,
  height: 150,
},


passwordInput: {
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
loginButton: {
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

loginButtonText: {
  color: "#fff",
  fontSize: 12,
  fontFamily: 'Poppins_400Regular',
 
},

helpText: {
  color: "#ffffffff",
  fontSize: 12,
  textDecorationLine: "underline",
  fontFamily: "Poppins_400Regular",

}
});

export default Login;