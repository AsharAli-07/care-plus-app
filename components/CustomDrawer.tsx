import React from "react";
import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const drawerItems = [
    { label: "Watch",      screen: "Watch",      icon: "watch-outline",  iconFocused: "watch"  },
  { label: "Dashboard",      screen: "Dashboard",      icon: "grid-outline",  iconFocused: "grid"  },
  { label: "Daily Wellness", screen: "WellnessTracker", icon: "heart-outline", iconFocused: "heart" },
];

export default function CustomDrawer(props: any) {
  const currentRoute = props.state?.routes[props.state.index]?.name;

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    props.navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
    );
  };

  return (
    <View style={styles.container}>
      {/* Same dark green gradient as notification panel */}
      <LinearGradient
        colors={["rgba(0,40,20,0.97)", "rgba(0,20,10,0.99)"]}
        style={StyleSheet.absoluteFill}
      />
      {/* Green right border accent */}
      <View style={styles.rightBorder} />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo */}
        <View style={styles.headerContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
        </View>

        {/* Nav Items */}
        <View style={styles.itemsContainer}>
          {drawerItems.map((item) => {
            const focused = currentRoute === item.screen;
            return (
              <TouchableOpacity
                key={item.screen}
                style={[styles.item, focused && styles.itemFocused]}
                onPress={() => props.navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
                  <Ionicons
                    name={focused ? item.iconFocused as any : item.icon as any}
                    size={18}
                    color={focused ? "#004927" : "rgba(255,255,255,0.75)"}
                  />
                </View>
                <Text style={[styles.label, focused && styles.labelFocused]}>
                  {item.label}
                </Text>
                {focused && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutItem}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconWrapper}>
            <Ionicons name="log-out-outline" size={18} color="#ff6b6b" />
          </View>
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  rightBorder: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(74,222,128,0.2)",
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(74,222,128,0.2)",
    marginHorizontal: 20,
    marginVertical: 16,
  },
  itemsContainer: {
    paddingHorizontal: 7,
    gap: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    backgroundColor: "transparent",
  },
  itemFocused: {
    backgroundColor: "rgba(74,222,128,0.15)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperFocused: {
    backgroundColor: "rgba(74,222,128,0.9)",
  },
  label: {
    flex: 1,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
  },
  labelFocused: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(74,222,128,0.9)",
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 7,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    backgroundColor: "rgba(255,107,107,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.2)",
    marginTop: 10,
  },
  logoutIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,107,107,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutLabel: {
    color: "#ff6b6b",
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
});