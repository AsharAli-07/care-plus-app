import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

// Screen Imports
import Login from './screens/Login';
import HelpScreen from './screens/HelpScreen';
import Start from './screens/Start';
import BottomTabs from './screens/BottomTabs';
import Register from './screens/Register';
import Onboarding from './screens/Onboarding';
import Profile from './screens/Profile';
import PrivacySecurity from './screens/PrivacySecurity';
import ChangePassword from './screens/ChangePassword';
import MoodHistory from './screens/MoodHistory';
import Privacy from './screens/Privacy';
import NotificationSettings from './screens/NotificationSettings';
import Wellness from './screens/Wellness'; 
import Emergency from './screens/Emergency';
import EmergencyContacts from './screens/EmergencyContacts';
import About from "./screens/About";
import WellnessTracker from './screens/WellnessTracker';

import { 
  useFonts,  
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from "@expo-google-fonts/poppins";

// 1. STRONGLY TYPED NAVIGATION STRATEGY
export type RootStackParamList = {
  Login: undefined;
  Start: undefined;
  Register: undefined;
  Onboarding: undefined;
  BottomTabs: undefined;
  Help: undefined;
  Profile: undefined;
  PrivacySecurity: undefined;
  ChangePassword: undefined;
  MoodHistory: undefined;
  Privacy: undefined;
  Notifications: undefined;
  Wellness: undefined;
  WellnessTracker: { targetSection?: string } | undefined; 
  Emergency: undefined;
  EmergencyContacts: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 2. PASS TYPES TO REFS (Clears 'never' assignment typescript errors completely!)
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_500Medium, 
    Poppins_600SemiBold,
  });

useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    // 1. Safe extraction using explicit string checks or type-casting
    const screen = typeof data?.screen === 'string' ? data.screen : undefined;
    const targetSection = typeof data?.targetSection === 'string' ? data.targetSection : undefined;

    // 2. Route safely now that TypeScript knows they are strings
    if (navigationRef.isReady() && screen === 'WellnessTracker') {
      navigationRef.navigate('WellnessTracker', { targetSection });
    }
  });

  return () => subscription.remove();
}, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
<Stack.Navigator screenOptions={{ headerShown: false }}>
{/* <Stack.Navigator > */}

        {/* Auth & Setup Stack */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="BottomTabs" component={BottomTabs} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="MoodHistory" component={MoodHistory} />
        <Stack.Screen name="Privacy" component={Privacy} />
        <Stack.Screen name="Notifications" component={NotificationSettings} />
        <Stack.Screen name="Wellness" component={Wellness} />
        <Stack.Screen name="WellnessTracker" component={WellnessTracker} />
        <Stack.Screen name="Emergency" component={Emergency} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContacts} />
        <Stack.Screen name="About" component={About} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


// git add .
// git commit -m "Added bottom navigation and animations"
// git push