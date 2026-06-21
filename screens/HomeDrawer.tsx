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
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          backgroundColor: "transparent",
          width: 260,
        },
        overlayColor: "rgba(0, 0, 0, 0)",
        // Hide the default drawer items — CustomDrawer renders its own
        drawerItemStyle: { display: "none" },
      }}
    >
      <Drawer.Screen name="Home"           component={Home}           />
      <Drawer.Screen name="Dashboard"      component={Dashboard}      />
      <Drawer.Screen name="WellnessTracker" component={WellnessTracker} />
    </Drawer.Navigator>
  );
}