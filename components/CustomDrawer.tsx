import React from "react";
import { View, Image, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList, DrawerItem
} from "@react-navigation/drawer";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

export default function CustomDrawer(props: any) {

const handleLogout = async () => {
  await AsyncStorage.removeItem("token");
  
  // Use CommonActions.reset to clear the history
  props.navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: "Login" }],
    })
  );
};
  return (
    <BlurView intensity={50} tint="prominent" style={styles.blur}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ padding: 0 }}
      >
        <View style={styles.headerContainer}>
          <Image
            source={require("../assets/images/logo.png")} // Update this path
            style={styles.logo}
          />
        </View>

        {/* This renders the navigation items */}
        <DrawerItemList {...props} />
   <DrawerItem
  label="Logout"
  onPress={handleLogout}
  // 1. Match your font settings
  labelStyle={{ 
    color: "#ff4d4d", 
    fontFamily: "Poppins_500Medium", 
    fontSize: 12,
  }}
  style={{
    borderRadius: 0, 
  }}
/>
      </DrawerContentScrollView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    flex: 1,
  },
  headerContainer: {
   marginVertical: 20,
    alignItems: "center", // Centers the image horizontally
    justifyContent: "center",
    
  },
  logo: {
    width: 150,
    height: 150,
  },

});