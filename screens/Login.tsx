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
  source={require("../assets/images/bg.jpg")} // your image path
  style={styles.container}
  resizeMode="cover"
>
  
        <View style={styles.logoContainer}>
          <Image source={require('../assets/Logo.png')} style={styles.logo} />
        </View>
        <View style={styles.formContainer}>
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
              secureTextEntry={true}
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
  
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  width: "100%",
  height: "100%",
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 160,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
  marginHorizontal: 20,
  padding: 20,
  borderRadius: 20,
  backgroundColor: 'rgba(4, 93, 52, 0.2)', // 👈 lower opacity
},
  card: {
     backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
    padding:10,
  },
  input: {
    height: 20,
    fontSize: 12,
    color: '#045d33',
    fontFamily: "Poppins_400Regular",
   
 
  },
  loginButton: {
    backgroundColor: '#045d33',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#e9fff4',
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  helpText: {
  color: '#045d33',
  fontSize: 12,
  textDecorationLine: 'underline',
  fontFamily: "Poppins_400Regular",
},
});

export default LoginScreen;