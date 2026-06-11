import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Home from "./Home";
import Dashboard from "./Dashboard";
import WellnessTracker from "./WellnessTracker";

import CustomDrawer from "../components/CustomDrawer";

const Drawer = createDrawerNavigator();

export default function HomeDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawer {...props} />
      )}
      screenOptions={{
        headerShown: false,

        drawerType: "front",

        drawerStyle: {
          backgroundColor: "transparent",
          width: 250,
        },
        

        overlayColor: "rgba(255,255,255,0)",

        drawerActiveBackgroundColor:
          "rgba(255,255,255,0.08)",
        

        drawerInactiveBackgroundColor:
          "transparent",

        drawerActiveTintColor: "#fff",

        drawerInactiveTintColor:
          "#fff",

   drawerItemStyle: {
  borderRadius: 0,
  marginBottom: 15
},

        drawerLabelStyle: {
          fontFamily: "Poppins_400Regular",
          fontSize: 12,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
      />

      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
      />

      <Drawer.Screen
        name="WellnessTracker"
        component={WellnessTracker}
        options={{
          title: "Daily Wellness",
        }}
      />
    </Drawer.Navigator>
  );
}