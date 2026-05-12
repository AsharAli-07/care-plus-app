import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";

import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.19:5000";

const Profile = () => {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [profileImage, setProfileImage] = useState("");

  // =========================
  // LOAD USER DATA
  // =========================
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {

      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setName(res.data.name);
      setPhone(res.data.phone_number);
      setEmail(res.data.email);
      setProfileImage(
  `${BASE_URL}/${res.data.profile_image}`
);

    } catch (error) {
      console.log("LOAD USER ERROR:", error);
    }
  };

  // =========================
  // PICK IMAGE
  // =========================
  const pickImage = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 1,
});

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // =========================
  // UPDATE PROFILE
  // =========================
  const updateProfile = async () => {

    

    try {

      const token = await AsyncStorage.getItem("token");

const formData = new FormData();

formData.append("name", name);
formData.append("email", email);
formData.append("phone_number", phone);

// WEB IMAGE FIX
const response = await fetch(profileImage);
const blob = await response.blob();

formData.append(
  "profile_image",
  blob,
  "profile.jpg"
);

console.log(profileImage);

      await axios.put(
        `${BASE_URL}/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert(
        "Success",
        "Profile updated successfully"
      );

      loadUser();

    } catch (error) {
      console.log("UPDATE ERROR:", error);

      Alert.alert(
        "Error",
        "Something went wrong"
      );
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >

          {/* PROFILE CARD */}
          <BlurView
            intensity={50}
            tint="prominent"
            style={styles.card}
          >

            {/* PROFILE IMAGE */}
            <View style={styles.imageWrapper}>

              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />

              <TouchableOpacity
                style={styles.editImageBtn}
                onPress={pickImage}
              >
                <Ionicons
                  name="camera"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>

            </View>

            <Text style={styles.heading}>
              Edit Profile
            </Text>

            {/* NAME */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                Full Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                  placeholderTextColor="#b3b3b3ff"
                style={styles.input}
              />
            </View>

            {/* EMAIL */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                Email
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                  placeholderTextColor="#b3b3b3ff"
                style={styles.input}
              />
            </View>

            {/* PHONE */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                Phone Number
              </Text>

              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                  placeholderTextColor="#b3b3b3ff"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* SAVE BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={updateProfile}
            >
              <Text style={styles.buttonText}>
                Save Changes
              </Text>
            </TouchableOpacity>

          </BlurView>

        </ScrollView>

      </View>
    </ImageBackground>
  );
};

export default Profile;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  card: {
    borderRadius: 12,
    overflow: "hidden",
    padding: 20,
    marginTop: 40,
  },

  imageWrapper: {
    alignSelf: "center",
    marginBottom: 20,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#fff",
  },

  editImageBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#045d33",
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins_500Medium",
    
  },

  inputWrapper: {
    marginBottom: 18,
  },

  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 10,
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
  marginTop: 15,
  },

  buttonText: {
      color: "#fff",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
  },
});