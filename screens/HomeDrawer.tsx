import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Home from "./Home";
import Dashboard from "./Dashboard";
import WellnessTracker from "./WellnessTracker";


const Drawer = createDrawerNavigator();

export default function HomeDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="WellnessTracker" component={WellnessTracker} />


    </Drawer.Navigator>
  );
}