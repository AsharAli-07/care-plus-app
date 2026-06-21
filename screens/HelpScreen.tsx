import React, { useState, useRef  } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Dimensions, 
  Animated, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const HelpScreen = ({ navigation }: any) => {

  const scrollX = useRef(new Animated.Value(0)).current;
  

  const [activeIndex, setActiveIndex] = useState(0);
  return (
   <View style={{ flex: 1,backgroundColor: "#050f09", }}>
            <StatusBar barStyle="light-content" />
       <ImageBackground
         source={require("../assets/images/home-bg.jpg")}
         style={{ height: "100%", width: "100%" }}
         resizeMode="cover"
       >
    <LinearGradient
                   colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
                   style={StyleSheet.absoluteFill}
                 />
                 <View style={styles.glowTop} />
                 <View style={styles.overlay}>

   <Animated.ScrollView
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.scrollContainer}
onScroll={Animated.event(
  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
  {
    useNativeDriver: false,
    listener: (event: any) => {
      const slide = Math.round(
        event.nativeEvent.contentOffset.x / width
      );
      setActiveIndex(slide);
    },
  }
)}
  scrollEventThrottle={16}
>

 





          {/* FORGOT PASSWORD */}
          <BlurView intensity={50} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Forgot Password?</Text>
 <Text style={styles.description}>
Enter your email, and we will send an OTP to your email to reset your password.
</Text>
<Text style={styles.label}>
                Email
              </Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#b3b3b3ff"
              style={styles.input}
            />

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </BlurView>






 




           {/* REGISTER */}
          <BlurView intensity={50} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Register Yourself</Text>

            <Text style={styles.description}>
              Create your Care Plus account and start your wellness journey.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.buttonText}>Go To Register</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.ScrollView>


<View style={styles.dotContainer}>
  {[0, 1].map((_, index) => {

    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const animatedWidth = scrollX.interpolate({
      inputRange,
      outputRange: [10, 20, 10],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            width: animatedWidth,
            opacity,
          },
        ]}
      />
    );
  })}
</View>

      </View>
    </ImageBackground>
      </View>

  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20
  },


  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },

card: {
  width: width * 0.80,
  height: 320,
  borderRadius: 12,
  overflow: "hidden",
  padding: 15,
  marginHorizontal: 10,
  justifyContent: "center",
  alignSelf: "center",
        borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
},

  cardTitle: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Poppins_500Medium",
  },

  description: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 12,
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },
  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    alignSelf: 'flex-start'
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 10,
  fontSize: 12,
  color: "#fff",
  fontFamily: 'Poppins_400Regular',
  marginBottom: 15,
  },

  button: {
  backgroundColor: "#004927ff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",
        borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
  
  },

  buttonText: {
  color: "#fff",
  fontSize: 12,
  fontFamily: 'Poppins_400Regular'
  },
dotContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
 
},

dot: {
  height: 10,
  width: 10,
  borderRadius: 5,
  backgroundColor: "#fff",
  marginHorizontal: 5,
},

activeDot: {
  backgroundColor: "#004927ff",
  width: 20,
},
            glowTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)",
    pointerEvents: "none",
  },
});