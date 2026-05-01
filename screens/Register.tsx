import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BlurView } from "expo-blur";
import Start from "./Start";

const { width } = Dimensions.get("window");

const Register = ({ navigation }: any) =>{
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const goNext = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const goBack = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const Done = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 2,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay}>

        

        {/* SLIDER */}
<View style={styles.viewport}>

  <Animated.View
    style={[
      styles.track,
      { transform: [{ translateX: slideAnim }] },
    ]}
  >

    {/* CARD 1 */}
    <BlurView intensity={50} tint="prominent" style={[styles.card, { marginRight: 48 }]}>

        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.description}>
                      Create your Care Plus account and start your wellness journey.
                    </Text>
     <TextInput placeholder="Full Name" style={styles.input} />
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Age" style={styles.input} />
      <TextInput placeholder="Phone" style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={goNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </BlurView>

    {/* CARD 2 */}
    <BlurView intensity={50} tint="prominent" style={[styles.card, { marginRight: 48 }]}>
        <Text style={styles.heading}>Confirm Password</Text>
        <Text style={styles.description}>
                      Create your password inorder to set reset.
                    </Text>
    <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={Done}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </BlurView>



        {/* CARD 3 */}
    <BlurView intensity={50} tint="prominent" style={styles.card}>
        <Text style={styles.heading}>Account Created</Text>
        <Ionicons name="checkmark-circle" size={50} color="#fff" />

      <TouchableOpacity style={[styles.button, { marginTop: 15}]} onPress={() => navigation.replace("Onboarding")}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </BlurView>

  </Animated.View>

</View>

      </View>
    </ImageBackground>
  );
};

export default Register;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: '100%',
    width: '100%'
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  },

  heading: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    marginBottom: 20

  },

viewport: {
  width: 320,          // 🔥 FIXED VIEWPORT (NOT SCREEN WIDTH)
  height: 450,

paddingLeft: 20,
paddingRight: 20,
  alignSelf: "center",
 
},

track: {
  flexDirection: "row",
  width: 300 * 2,      // viewport * number of steps
},

card: {
  width: 280,          // EXACT SAME AS VIEWPORT
  height: 450,
  padding: 20,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 12,
  


},

slider: {
  flexDirection: "row",
  width: width * 2,
},



  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    width: "100%",
  },

  button: {
   backgroundColor: "#004927ff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",
  marginTop: 15,
  },

  buttonText: {
    color: "#fff",
  },

  backText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
    description: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 12,
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },
});