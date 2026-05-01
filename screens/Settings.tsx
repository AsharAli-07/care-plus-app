import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from 'expo-blur';

const BASE_URL = "192.168.100.207:5000";

const Settings = ({ navigation }: any) => {

  const [user, setUser] = useState<any>(null);

  // -------------------------
  // GET USER FROM API
  // -------------------------
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: token,
        },
      });

      setUser(res.data);

    } catch (err) {
      console.log("Load user error:", err);
    }
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <View style={styles.overlay}>

          {/* PROFILE */}
          <View style={styles.profileCard}>
            <Image
              source={require("../assets/images/profile.png")}
              style={styles.profileImage}
            />

            <Text style={styles.userName}>
              {user?.name || "Loading..."}
            </Text>

            <Text style={styles.userEmail}>
              {user?.email || ""}
            </Text>
            <TouchableOpacity style={{backgroundColor: '#004927ff', paddingVertical: 8,paddingHorizontal: 15, marginTop: 10, borderRadius: 12 }}>
              <Text style={{fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#fff'}}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* SETTINGS */}
          <View>

            <SettingItem
              icon="person-outline"
              title="Account"
              onPress={() => navigation.navigate("Account")}
            />

            <SettingItem icon="notifications-outline" title="Notifications" />
            <SettingItem icon="lock-closed-outline" title="Privacy" />
            <SettingItem icon="moon-outline" title="Dark Mode" />
            <SettingItem icon="help-circle-outline" title="Help & Support" />

            <SettingItem
              icon="log-out-outline"
              title="Logout"
              isDanger
              onPress={handleLogout}
            />

          </View>

        </View>
      </ImageBackground>
    </View>
  );
};

export default Settings;




const SettingItem = ({ icon, title, isDanger, onPress }: any) => {
  return (
    <BlurView intensity={50} tint="prominent" style={styles.itemRow}>

      <TouchableOpacity onPress={onPress} style={styles.touchRow}>

        <View style={styles.leftRow}>
          <Ionicons
            name={icon}
            size={20}
            color={isDanger ? "#ff4d4d" : "#fff"}
          />

          <Text
            style={[
              styles.itemText,
              { color: isDanger ? "#ff4d4d" : "#fff" },
            ]}
          >
            {title}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#ccc" style={{marginRight: 5}}/>

      </TouchableOpacity>

    </BlurView>
  );
};





/* 🔹 STYLES */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 20
  },

  profileCard: {
    alignItems: "center",
    marginBottom: 20,
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },

  userName: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },

  userEmail: {
    color: "#ddd",
    fontSize: 12,
    fontFamily: 'Poppins_400Regular'
  },

itemRow: {

  borderRadius: 12,
  marginBottom: 15,
  overflow: "hidden",
},

  leftRow: {
      padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  touchRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
},

  itemText: {
    marginLeft: 10,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});