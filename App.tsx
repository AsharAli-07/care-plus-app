import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import HelpScreen from './screens/HelpScreen';
import Start from './screens/Start';
import BottomTabs from './screens/BottomTabs';
import Register from './screens/Register';
import Onboarding from './screens/Onboarding';
import Profile from './screens/Profile';
import PrivacySecurity from './screens/PrivacySecurity';
import ChangePassword from './screens/ChangePassword';

import { useFonts,  Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";



const Stack = createNativeStackNavigator();

export default function App() {
 const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_500Medium, 
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
   return null;
  }

  return (
    <NavigationContainer>
    {/* <Stack.Navigator> */}
<Stack.Navigator>
        {/* Login will open first */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="BottomTabs" component={BottomTabs} />
        <Stack.Screen name="Help" component={HelpScreen} />
         <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />



      </Stack.Navigator>
    </NavigationContainer>
  );
}


// git add .
// git commit -m "Added bottom navigation and animations"
// git push