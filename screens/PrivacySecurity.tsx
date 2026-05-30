import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity, Alert
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

import { BlurView } from 'expo-blur';
import { BASE_URL } from '../api';

const PrivacySecurity = ({ navigation }: any) => {
  



const handleDeleteAccount = () => {
  Alert.alert(
    "Delete Account",
    "This will permanently delete your account, moods, and personal data. This action cannot be undone.",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete Account",
        style: "destructive",
        onPress: async () => {
          try {

            const token = await AsyncStorage.getItem("token");

            const res = await axios.delete(
              `${BASE_URL}/delete-account`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            Alert.alert(
              "Account Deleted",
              res.data.message,
              [
                {
                  text: "OK",
                  onPress: async () => {

                    await AsyncStorage.removeItem("token");

                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Login" }],
                    });

                  },
                },
              ]
            );

          } catch (err) {
            console.log(err);

            Alert.alert(
              "Error",
              "Failed to delete account"
            );
          }
        },
      },
    ]
  );
};


 

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      >

       

          {/* SETTINGS */}
          <View style={styles.overlay}>


  <Text style={styles.heading}>
    Privacy & Security
  </Text>

  <SettingItem icon="key-outline" title="Change Password" onPress={() => navigation.navigate("ChangePassword")}/>

  <SettingItem icon="heart-outline" title="Mood History Privacy" onPress={() => navigation.navigate("MoodHistory")}/>

  <SettingItem icon="document-text-outline" title="Anonymous Journal Mode" onPress={() => navigation.navigate("Privacy")}/>

  <SettingItem icon="download-outline" title="Download My Data" />

  <SettingItem
  icon="trash-outline"
  title="Delete My Account"
  isDanger
  onPress={handleDeleteAccount}
/>

          </View>

      







      </ImageBackground>
    </View>
  );
};

export default PrivacySecurity;




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
    padding: 20,
  
  },




  heading: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    marginBottom: 20,
    alignSelf: 'center'

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