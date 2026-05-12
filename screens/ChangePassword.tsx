import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";

const ChangePassword = ({ navigation }: any) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.put(
        "http://192.168.1.19:5000/change-password",
        {
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", res.data.message);

      setNewPassword("");
      setConfirmPassword("");

      navigation.goBack();

    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay}>

        <BlurView intensity={50} tint="prominent" style={styles.card}>

          <Text style={styles.heading}>Change Password</Text>
<Text style={styles.label}>
                            New Password
                          </Text>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
          />
<Text style={styles.label}>
                            Confirm Password
                          </Text>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={changePassword}>
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>

        </BlurView>

      </View>
    </ImageBackground>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: "100%", 
    width: "100%"
  },
 overlay: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
    justifyContent: 'center'
  },
  card: {
    padding: 20,
    borderRadius: 12,
    
  },
  heading: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: 'Poppins_500Medium'
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
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    marginBottom: 15,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12
  },
  button: {
    backgroundColor: "#004927",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontFamily: 'Poppins_400Regular',
    fontSize: 12
  },
});