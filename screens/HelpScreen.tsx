import React, { useState, useRef  } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Dimensions, 
  Animated
} from 'react-native';

import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const HelpScreen = ({ navigation }: any) => {

  const scrollX = useRef(new Animated.Value(0)).current;
  

  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
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
          <BlurView intensity={50} tint="prominent" style={styles.card}>
            <Text style={styles.cardTitle}>Forgot Password?</Text>
 <Text style={styles.description}>
Enter your email, and we will send an OTP to your email to reset your password.
</Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              style={styles.input}
            />

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </BlurView>




          {/* FORGOT EMAIL */}
          <BlurView intensity={50} tint="prominent" style={styles.card}>
            <Text style={styles.cardTitle}>Forgot Email?</Text>

   <Text style={styles.description}>
We’ll help you recover your registered email using your phone number.
</Text>
            <TextInput
              placeholder="Phone"
              placeholderTextColor="#999"
              style={styles.input}
            />

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Recover Email</Text>
            </TouchableOpacity>
          </BlurView>



 




           {/* REGISTER */}
          <BlurView intensity={50} tint="prominent" style={styles.card}>
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
  {[0, 1, 2].map((_, index) => {

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
            transform: [
              {
                scale: scrollX.interpolate({
                  inputRange,
                  outputRange: [1, 1, 1],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      />
    );
  })}
</View>

      </View>
    </ImageBackground>
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
  padding: 25,
  marginHorizontal: 10,
  justifyContent: "center",
  alignSelf: "center",
},

  cardTitle: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 25,
    fontFamily: "Poppins_500Medium",
  },

  description: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 12,
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },

  input: {
    backgroundColor: "#fff",
  borderRadius: 12,
  padding: 10,
  fontSize: 12,
  color: "#004927ff",
  fontFamily: 'Poppins_400Regular'
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
  fontSize: 12,
  fontFamily: 'Poppins_400Regular'
  },
dotContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 25,
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
});