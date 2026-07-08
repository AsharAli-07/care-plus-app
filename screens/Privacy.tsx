import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Switch,
  Alert, StatusBar
} from "react-native";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { BASE_URL } from '../api';
import { LinearGradient } from "expo-linear-gradient";



const Privacy = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    loadPrivacy();
  }, []);

  const loadPrivacy = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEnabled(res.data.privacy_mode);
    } catch (err) {
      console.log(err);
    }
  };

  const togglePrivacy = async (value: boolean) => {
    try {
      setEnabled(value);

      const token = await AsyncStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/toggle-privacy`,
        { privacy_mode: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update privacy mode");
    }
  };

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

          <Text style={styles.title}>
            Privacy & Emotional Safety
          </Text>

          <Text style={styles.desc}>
            Hide sensitive emotional content on dashboard and
            protect your mental health data from being exposed
            in shared environments.
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Enable Privacy Mode
            </Text>

            <Switch
              value={enabled}
              onValueChange={togglePrivacy}
            />
          </View>

        </View>

      </View>
    </ImageBackground>
      </View>

  );
};

export default Privacy;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    padding: 20,
    borderRadius: 15,
     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
   backgroundColor: "rgba(0, 26, 17, 0.50)",
  },

  title: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    fontFamily: "Poppins_500Medium",
  },

  desc: {
    fontSize: 12,
    color: "#fff",
    marginBottom: 15,
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#fff",
    fontSize: 14,
    fontFamily: 'Poppins_400Regular'
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