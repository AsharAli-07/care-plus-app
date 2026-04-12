import React, { useState } from 'react';
import { StyleSheet, View, Image, TextInput, TouchableOpacity, Text, ImageBackground } from 'react-native';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
   
  navigation.navigate("Start");

  };
  return (
 <ImageBackground
   source={require("../assets/images/home-bg.jpg")}
   style={{ height: "100%", width: "100%" }}
   resizeMode="cover"
 >
  <View style={styles.centerWrapper}>
    
    <View style={styles.cardWrapper}>
      
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />

      <View style={styles.card}>
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.card}>
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Help')}>
        <Text style={styles.helpText}>Need Help?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

    </View>

  </View>
</ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
},

centerWrapper: {
  flex: 1,
  justifyContent: "center",   // ✅ vertical center
  alignItems: "center",       // ✅ horizontal center
  padding: 20,
  backgroundColor: "rgba(0, 0, 0, 0.30)", // dark overlay
},

cardWrapper: {
  width: '100%',
  backgroundColor: "rgba(255,255,255,0.20)", // soft glass effect
  paddingRight: 20,
  paddingBottom: 20,
  paddingLeft: 20,
  borderRadius: 12,
  alignItems: "center",
},

logo: {
  width: 150,
  height: 150,
},

card: {
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: 12,
  marginBottom: 15,
  padding: 10,
  elevation: 5,
},

input: {
  fontSize: 12,
  color: "#045d33",
  fontFamily: "Poppins_400Regular",
},

loginButton: {
  backgroundColor: "#045d33",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",
  marginTop: 15,
},

loginButtonText: {
  color: "#fff",
  fontSize: 12,
  fontFamily: 'Poppins_400Regular'
},

helpText: {
  color: "#ffffffff",
  fontSize: 12,
  textDecorationLine: "underline",
  fontFamily: "Poppins_400Regular",

}
});

export default LoginScreen;