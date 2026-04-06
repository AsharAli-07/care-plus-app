import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import HelpScreen from './screens/HelpScreen';
import RegisterStep1 from './screens/RegisterStep1';
import RegisterStep2 from './screens/RegisterStep2';
import RegisterStep3 from './screens/RegisterStep3';
import Start from './screens/Start';
import BottomTabs from './screens/BottomTabs';
import Dashboard from './screens/Dashboard';
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
<Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Login will open first */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="BottomTabs" component={BottomTabs} />
        {/* <Stack.Screen name="Dashboard" component={Dashboard} /> */}
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Register1" component={RegisterStep1} />
        <Stack.Screen name="Register2" component={RegisterStep2} />
        <Stack.Screen name="Register3" component={RegisterStep3} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}