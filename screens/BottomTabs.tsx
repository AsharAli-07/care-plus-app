import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Start from "./Start";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator

screenOptions={({ route }) => ({
  tabBarIcon: ({ color, size }) => {
    let iconName: keyof typeof Ionicons.glyphMap;

    if (route.name === "Dashboard") iconName = "home";
    else if (route.name === "Login") iconName = "person";
    else iconName = "settings";

    return <Ionicons name={iconName} size={size} color={color} />;
  },
})}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="Start" component={Start} />
    </Tab.Navigator>
  );
}