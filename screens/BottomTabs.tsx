// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { Ionicons } from "@expo/vector-icons";

// import Home from "./Home";
// import Therapy from "./Therapy";
// import Peace from "./Peace";
// import Meditation from "./Meditation";
// import Settings from "./Settings";
// import HomeDrawer from "./HomeDrawer";

// const Tab = createBottomTabNavigator();

// export default function BottomTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//           tabBarActiveTintColor: "#fff",   // focused icon color
//     tabBarInactiveTintColor: "#fff", 
//    tabBarStyle: {
//   position: "absolute",   // ✅ important
//   height: 40,
//   backgroundColor: "#004927ff",
//   borderRadius: 12,       // ✅ radius here
//   overflow: "hidden",     // ✅ required for clipping     // remove default line
//   elevation: 6,          // Android shadow
//   margin: 20,
//    borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
//        shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.55, shadowRadius: 14,
  
// },

//         tabBarIcon: ({ color, size, focused }) => {
//           switch (route.name) {
//             case "Home":
//               return (
//                 <Ionicons
//                   name={focused ? "home" : "home-outline"}
//                   size={20}
//                   color={color}
//                 />
//               );

//             case "Therapy":
//               return (
//                 <Ionicons
//                   name={focused ? "fitness" : "fitness-outline"}
//                   size={20}
//                   color={color}
//                 />
//               );

//             case "Peace":
//               return (
//                 <Ionicons
//                   name={focused ? "leaf" : "leaf-outline"}
//                   size={20}
//                   color={color}
//                 />
//               );

//             case "Meditation":
//               return (
//                 <Ionicons
//                   name={focused ? "moon" : "moon-outline"}
//                   size={20}
//                   color={color}
//                 />
//               );

//             case "Settings":
//               return (
//                 <Ionicons
//                   name={focused ? "settings" : "settings-outline"}
//                   size={20}
//                   color={color}
//                 />
//               );

//             default:
//               return (
//                 <Ionicons
//                   name="home"
//                   size={20}
//                   color={color}
//                 />
//               );
//           }
//         },
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeDrawer} />
//       <Tab.Screen name="Therapy" component={Therapy} />
//       <Tab.Screen name="Peace" component={Peace} />
//       <Tab.Screen name="Meditation" component={Meditation} />
//       <Tab.Screen name="Settings" component={Settings} />
//     </Tab.Navigator>
//   );
// }

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Home from "./Home";
import Therapy from "./Therapy";
import Peace from "./Peace";
import Meditation from "./Meditation";
import Settings from "./Settings";
import HomeDrawer from "./HomeDrawer";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: {
          position: "absolute",
          height: 40,
          backgroundColor: "#004927ff",
          borderRadius: 12,
          overflow: "hidden",
          elevation: 6,
          margin: 20,
          borderColor: "rgba(74,222,128,0.3)",
          borderWidth: 1,
          shadowColor: "#004927",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.55,
          shadowRadius: 14,
        },
        tabBarIcon: ({ color, focused }) => {
          switch (route.name) {
            case "Home":
              return <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />;
            case "Therapy":
              return <Ionicons name={focused ? "fitness" : "fitness-outline"} size={20} color={color} />;
            case "Peace":
              return <Ionicons name={focused ? "leaf" : "leaf-outline"} size={20} color={color} />;
            case "Meditation":
              return <Ionicons name={focused ? "moon" : "moon-outline"} size={20} color={color} />;
            case "Settings":
              return <Ionicons name={focused ? "settings" : "settings-outline"} size={20} color={color} />;
            default:
              return <Ionicons name="home" size={20} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeDrawer}
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Reset drawer back to Home screen when Home tab is pressed
            navigation.navigate("Home", {
              screen: "Home",
            });
          },
        })}
      />
      <Tab.Screen name="Therapy" component={Therapy} />
      <Tab.Screen name="Peace" component={Peace} />
      <Tab.Screen name="Meditation" component={Meditation} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}