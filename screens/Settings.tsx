import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity, Alert, StatusBar 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from 'expo-blur';
import { BASE_URL } from '../api';


const Settings = ({ navigation }: any) => {


const [privacyMode, setPrivacyMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  // -------------------------
  // GET USER FROM API
  // -------------------------
useEffect(() => {

  const unsubscribe = navigation.addListener("focus", async () => {

    try {

      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);

    } catch (err) {
      console.log(err);
    }

  });

  return unsubscribe;

}, [navigation]);


 

  // -------------------------
  // LOGOUT
  // -------------------------
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  return (
    <View style={{ flex: 1,backgroundColor: "#050f09" }}>
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
        <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.overlay}
            >

          {/* PROFILE */}
          <View style={styles.profileCard}>
<Image
  source={
    user?.privacy_mode
      ? require("../assets/images/profile.png")
      : { uri: `${BASE_URL}/${user?.profile_image}` }
  }
  style={styles.profileImage}
/>

<Text style={styles.userName}>
  {user?.privacy_mode ? "Anonymous User" : user?.name || "Loading..."}
</Text>

<Text style={styles.userEmail}>
  {user?.privacy_mode ? "Hidden for privacy" : user?.email || ""}
</Text>
            <TouchableOpacity style={{backgroundColor: '#004927ff', paddingVertical: 8,paddingHorizontal: 15, marginTop: 15, borderRadius: 12,     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,     shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, }} onPress={()=>navigation.navigate('Profile')}>
              <Text style={{fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#fff'}}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* SETTINGS */}
          <View>


<SettingItem
  icon="shield-checkmark-outline"
  title="Privacy & Security"
  onPress={() => navigation.navigate("PrivacySecurity")}
/>

<SettingItem
  icon="notifications-outline"
  title="Notifications"
  onPress={() => navigation.navigate("Notifications")}
/>

<SettingItem
  icon="heart-outline"
  title="Wellness Preferences"
  onPress={() => navigation.navigate("Wellness")}
/>

<SettingItem
  icon="medkit-outline"
  title="Emergency Support"
  onPress={() => navigation.navigate("Emergency")}
/>

<SettingItem
  icon="information-circle-outline"
  title="About Care Plus"
  onPress={() => navigation.navigate("About")}
/>

<SettingItem
  icon="log-out-outline"
  title="Logout"
  isDanger
  onPress={handleLogout}
/>

          </View>

        </ScrollView>







      </ImageBackground>
    </View>
  );
};

export default Settings;




const SettingItem = ({ icon, title, isDanger, onPress }: any) => {
  return (
    <BlurView intensity={50} tint="dark" style={styles.itemRow}>

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
    padding: 20,
    paddingBottom: 80
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
    borderColor: "rgba(74,222,128,0.3)",
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
    borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
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