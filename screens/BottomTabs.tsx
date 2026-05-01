import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Home from "./Home";
import Therapy from "./Therapy";
import Peace from "./Peace";
import Meditation from "./Meditation";
import Settings from "./Settings";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
          tabBarActiveTintColor: "#fff",   // focused icon color
    tabBarInactiveTintColor: "#fff", 
   tabBarStyle: {
  position: "absolute",   // ✅ important
  height: 40,
  backgroundColor: "#004927ff",
  borderRadius: 12,       // ✅ radius here
  overflow: "hidden",     // ✅ required for clipping
  borderTopWidth: 0,      // remove default line
  elevation: 10,          // Android shadow
  margin: 20,
  
},

        tabBarIcon: ({ color, size, focused }) => {
          switch (route.name) {
            case "Home":
              return (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={20}
                  color={color}
                />
              );

            case "Therapy":
              return (
                <Ionicons
                  name={focused ? "fitness" : "fitness-outline"}
                  size={20}
                  color={color}
                />
              );

            case "Peace":
              return (
                <Ionicons
                  name={focused ? "leaf" : "leaf-outline"}
                  size={20}
                  color={color}
                />
              );

            case "Meditation":
              return (
                <Ionicons
                  name={focused ? "moon" : "moon-outline"}
                  size={20}
                  color={color}
                />
              );

            case "Settings":
              return (
                <Ionicons
                  name={focused ? "settings" : "settings-outline"}
                  size={20}
                  color={color}
                />
              );

            default:
              return (
                <Ionicons
                  name="home"
                  size={20}
                  color={color}
                />
              );
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Therapy" component={Therapy} />
      <Tab.Screen name="Peace" component={Peace} />
      <Tab.Screen name="Meditation" component={Meditation} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}