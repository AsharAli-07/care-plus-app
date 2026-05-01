import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.100.207:5000";

const Account = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [birthdate, setBirthdate] = useState("");

  // GET USER
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: token },
      });

      setName(res.data.name);
      setEmail(res.data.email);
      setPhone_number(res.data.phone_number);
      setBirthdate(res.data.birthdate?.split("T")[0] || "");
    } catch (err) {
      console.log(err);
    }
  };

  // UPDATE USER
const updateProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    await axios.put(
      `${BASE_URL}/update-profile`,
      {
        name,
        email,
        phone_number,
        birthdate,
      },
      {
        headers: { Authorization: token },
      }
    );

    alert("Profile updated!");
  } catch (err) {
    console.log(err);
    alert("Update failed");
  }
};

  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/images/profile.png")}
          style={styles.image}
        />

        <TextInput value={name} onChangeText={setName} style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput value={phone_number} onChangeText={setPhone_number} style={styles.input} />
        <TextInput value={birthdate} onChangeText={setBirthdate} style={styles.input} />

        <TouchableOpacity style={styles.button} onPress={updateProfile}>
          <Text style={{ color: "#fff" }}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  input: {
    padding: 10,
    marginBottom: 15,
    borderRadius: 12,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  button: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
});