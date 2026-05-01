import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";






const Login = ({ navigation }: any) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://192.168.100.207:5000";

  // ======================
  // 🔐 LOGIN
  // ======================
  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });

      await AsyncStorage.setItem("token", res.data.token);

      navigation.replace("Start");

    } catch (err: any) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
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
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={{ height: "100%", width: "100%" }}
      resizeMode="cover"
    >
      <View style={styles.centerWrapper}>

        <BlurView intensity={50} tint="prominent" style={styles.cardWrapper}>

          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
          />

          <View style={styles.card}>
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.card}>
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
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

        </BlurView>

      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  container: {
  flex: 1,
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
  borderRadius: 12,
  alignItems: "center",
},

logo: {
  width: 150,
  height: 150,
},

card: {
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: 12,
  marginBottom: 15,
  padding: 10,
  elevation: 5,
},

input: {
  fontSize: 12,
  color: "#004927ff",
  fontFamily: "Poppins_400Regular",
},

loginButton: {
  backgroundColor: "#004927ff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",
  marginTop: 15,
},

loginButtonText: {
  color: "#fff",
  fontSize: 12,
  fontFamily: 'Poppins_400Regular'
},

helpText: {
  color: "#ffffffff",
  fontSize: 12,
  textDecorationLine: "underline",
  fontFamily: "Poppins_400Regular",

}
});

export default Login;