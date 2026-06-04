import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Switch,
  Alert,
} from "react-native";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { BASE_URL } from '../api';


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
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay}>

        <BlurView intensity={50} tint="prominent" style={styles.card}>

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

        </BlurView>

      </View>
    </ImageBackground>
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
});