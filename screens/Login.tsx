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
import { BlurView } from 'expo-blur';
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../api';






const Login = ({ navigation }: any) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

        <BlurView intensity={50} tint="dark" style={styles.cardWrapper}>

          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
          />
<Text style={styles.label}>
                            Email
                          </Text>
          
            
            <TextInput
              placeholder="Email"
              placeholderTextColor="#b3b3b3ff"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          
<Text style={styles.label}>
                            Password
                          </Text>
          
            
            <TextInput
              placeholder="Password"
              placeholderTextColor="#b3b3b3ff"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
        

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
    </View>
  );
};


const styles = StyleSheet.create({
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
  borderRadius: 12,
  alignItems: "center",
  borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
},

logo: {
  width: 150,
  height: 150,
},


label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    alignSelf: 'flex-start'
  },

input: {
  width: "100%",
  padding: 10,
  marginBottom: 15,

  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.08)",

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