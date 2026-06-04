// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ImageBackground,
//   Animated,
//   Dimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import { Alert } from "react-native";

// import { BlurView } from "expo-blur";
// import Start from "./Start";
// import { BASE_URL } from '../api';

// const { width } = Dimensions.get("window");



// const Register = ({ navigation }: any) =>{


//   const registerUser = async () => {

//   if (
//     !name ||
//     !email ||
//     !phone ||
//     !password ||
//     !confirmPassword
//   ) {
//     Alert.alert("Please fill all fields");
//     return;
//   }

//   if (password !== confirmPassword) {
//     Alert.alert("Passwords do not match");
//     return;
//   }

//   try {

//     const response = await axios.post(
//       `${BASE_URL}/register`,
//       {
//         name,
//         email,
//         password,
//         phone_number: phone
//       }
//     );

//     console.log(response.data);

//     Done();

//   } catch (error: any) {

//     console.log(error?.response?.data);

//     Alert.alert(
//       "Error",
//       error?.response?.data?.message ||
//       "Registration failed"
//     );
//   }
// };
//   const slideAnim = useRef(new Animated.Value(0)).current;

//   // Step 1
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");

//   // Step 2
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const goNext = () => {
//     Animated.timing(slideAnim, {
//       toValue: -width,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   };

//   const goBack = () => {
//     Animated.timing(slideAnim, {
//       toValue: 0,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   };

//   const Done = () => {
//     Animated.timing(slideAnim, {
//       toValue: -width * 2,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   };


  
//   return (
//     <ImageBackground
//       source={require("../assets/images/home-bg.jpg")}
//       style={styles.background}
//     >
//       <View style={styles.overlay}>

        

//         {/* SLIDER */}
// <View style={styles.viewport}>

//   <Animated.View
//     style={[
//       styles.track,
//       { transform: [{ translateX: slideAnim }] },
//     ]}
//   >

//     {/* CARD 1 */}
//     <BlurView intensity={50} tint="prominent" style={[styles.card, { marginRight: 48 }]}>

//         <Text style={styles.heading}>Create Account</Text>
//                     <Text style={styles.label}>
//                                     Full Name
//                                   </Text>
                    
//      <TextInput
//   placeholder="Full Name"
//   placeholderTextColor="#b3b3b3ff"
//   style={styles.input}
//   value={name}
//   onChangeText={setName}
// />
// <Text style={styles.label}>
//                 Email
//               </Text>

// <TextInput
//   placeholder="Email"
//   placeholderTextColor="#b3b3b3ff"
//   style={styles.input}
//   value={email}
//   onChangeText={setEmail}
// />
// <Text style={styles.label}>
//                 Phone Number
//               </Text>

// <TextInput
//   placeholder="Phone"
//   placeholderTextColor="#b3b3b3ff"
//   style={styles.input}
//   value={phone}
//   onChangeText={setPhone}
// />

//       <TouchableOpacity style={styles.button} onPress={goNext}>
//         <Text style={styles.buttonText}>Next</Text>
//       </TouchableOpacity>
//     </BlurView>

//     {/* CARD 2 */}
//     <BlurView intensity={50} tint="prominent" style={[styles.card, { marginRight: 48 }]}>
//         <Text style={styles.heading}>Confirm Password</Text>
//                     <Text style={styles.label}>
//                                     Set password
//                                   </Text>
//   <TextInput
//   placeholder="Password"
//     placeholderTextColor="#b3b3b3ff"
//   secureTextEntry
//   style={styles.input}
//   value={password}
//   onChangeText={setPassword}
// />
// <Text style={styles.label}>
//                 Confirm Password
//               </Text>
// <TextInput
//   placeholder="Confirm Password"
//     placeholderTextColor="#b3b3b3ff"
//   secureTextEntry
//   style={styles.input}
//   value={confirmPassword}
//   onChangeText={setConfirmPassword}
// />

//       <TouchableOpacity style={styles.button} onPress={registerUser}>
//         <Text style={styles.buttonText}>Register</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={goBack}>
//         <Text style={styles.backText}>Back</Text>
//       </TouchableOpacity>
//     </BlurView>



//         {/* CARD 3 */}
//     <BlurView intensity={50} tint="prominent" style={styles.card}>
//         <Text style={styles.heading}>Account Created</Text>
//         <Ionicons name="checkmark-circle" size={50} color="#fff" />

//       <TouchableOpacity style={[styles.button, { marginTop: 15}]} onPress={() => navigation.replace("Onboarding")}>
//         <Text style={styles.buttonText}>Start</Text>
//       </TouchableOpacity>
//     </BlurView>

//   </Animated.View>

// </View>

//       </View>
//     </ImageBackground>
//   );
// };

// export default Register;

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     height: '100%',
//     width: '100%'
//   },

//   overlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",

//   },

//   heading: {
//     fontSize: 20,
//     color: "#fff",
//     fontFamily: "Poppins_500Medium",
//     marginBottom: 20

//   },

// viewport: {
//   width: 320,          // 🔥 FIXED VIEWPORT (NOT SCREEN WIDTH)


// paddingLeft: 20,
// paddingRight: 20,
//   alignSelf: "center",
 
// },

// track: {
//   flexDirection: "row",
//   width: 300 * 2,      // viewport * number of steps
// },

// card: {
//   width: 280,          // EXACT SAME AS VIEWPORT
//   padding: 20,
//   justifyContent: "center",
//   alignItems: "center",
//   borderRadius: 12,
  


// },

// slider: {
//   flexDirection: "row",
//   width: width * 2,
// },
// label: {
//     color: "#fff",
//     marginBottom: 8,
//     fontSize: 12,
//     fontFamily: "Poppins_500Medium",
//     alignSelf: 'flex-start'
//   },


//   input: {
//     color: '#fff',
//     borderRadius: 12,
//     padding: 10,
//     marginBottom: 15,
//     width: "100%",
//     fontSize: 12,
//     fontFamily: 'Poppins_400Regular',
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },

//   button: {
//    backgroundColor: "#004927ff",
//   padding: 10,
//   borderRadius: 12,
//   alignItems: "center",
//   width: "100%",
//   marginTop: 15,

//   },

//   buttonText: {
//     color: "#fff",
//       fontSize: 12,
//   fontFamily: 'Poppins_400Regular'
//   },

//   backText: {
//     color: "#fff",
//     textAlign: "center",
//     marginTop: 10,
//   },

// });

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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import { BASE_URL } from "../api";

const { width } = Dimensions.get("window");

const Register = ({ navigation }: any) => {
  const [error, setError] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 1 State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValidPassword = (password: string) => {
    return /^(?=.*[0-9]).{8,}$/.test(password);
  };

  const goNext = () => {
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill all fields");
      return;
    }
    Animated.timing(slideAnim, {
      toValue: -328,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const goBack = () => {
    setError("");
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const registerUser = async () => {
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters and include 1 number");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/register`, {
        name,
        email,
        password,
        phone_number: phone,
      });
      // Slide to success card
      Animated.timing(slideAnim, {
        toValue: -656,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay}>
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
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" placeholderTextColor="#999" />
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#999" />
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#999" />
              <TouchableOpacity style={styles.button} onPress={goNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </BlurView>

            {/* CARD 2 */}
            <BlurView intensity={50} tint="prominent" style={[styles.card, { marginRight: 48 }]}>
              <Text style={styles.heading}>Set Password</Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#999" />
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm" placeholderTextColor="#999" />
              <TouchableOpacity style={styles.button} onPress={registerUser}>
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
              <TouchableOpacity style={[styles.button, { marginTop: 15 }]} onPress={() => navigation.replace("Onboarding")}>
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

// const styles = StyleSheet.create({
//   background: { flex: 1 },
//   overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
//   viewport: { width: 320, alignSelf: "center" },
//   track: { flexDirection: "row", width: 1000 },
//   card: { width: 280, padding: 20, borderRadius: 12, alignItems: "center" },
//   heading: { fontSize: 20, color: "#fff", marginBottom: 15, fontFamily: "Poppins_500Medium" },
//   label: { color: "#fff", marginBottom: 5, fontSize: 12, alignSelf: 'flex-start', fontFamily: "Poppins_500Medium" },
//   input: { width: "100%", padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", marginBottom: 15, fontSize: 12 },
//   button: { backgroundColor: "#004927", padding: 10, borderRadius: 12, alignItems: "center", width: "100%" },
//   buttonText: { color: "#fff", fontSize: 12 },
//   errorText: { color: "#ff4d4d", fontSize: 12, marginBottom: 10, textAlign: 'center' },
//   backText: { color: "#fff", marginTop: 10, fontSize: 12 }
// });

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
    marginBottom: 15

  },

viewport: {
  width: 320,          // 🔥 FIXED VIEWPORT (NOT SCREEN WIDTH)


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
  padding: 20,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 12,
  


},

slider: {
  flexDirection: "row",
  width: width * 2,
},
label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    alignSelf: 'flex-start'
  },


  input: {
    color: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    width: "100%",
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  button: {
   backgroundColor: "#004927ff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",

  },

  buttonText: {
    color: "#fff",
      fontSize: 12,
  fontFamily: 'Poppins_400Regular'
  },

  backText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  errorText: { color: "#ff4d4d", fontSize: 12, marginBottom: 15, textAlign: 'center' },

});