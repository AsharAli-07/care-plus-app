import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
} from "react-native";

import { BlurView } from "expo-blur";

const CARD_WIDTH = 280;
const GAP = 40;
const STEP = CARD_WIDTH + GAP;

const Onboarding = ({ navigation }: any) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    Animated.timing(slideAnim, {
      toValue: -STEP,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };


  const goThird = () => {
    Animated.timing(slideAnim, {
      toValue: -(STEP * 2),
      duration: 350,
      useNativeDriver: true,
    }).start();
  };


  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        {/* VIEWPORT */}
        <View style={styles.viewport}>

          {/* TRACK */}
          <Animated.View
            style={[
              styles.track,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >

            {/* CARD 1 */}
            <BlurView
              intensity={50}
              tint="prominent"
              style={[styles.card, { marginRight: GAP }]}
            >
              <Text style={styles.heading}>
                Welcome to Care Plus
              </Text>

              <Text style={styles.description}>
                Care Plus helps you monitor your wellness,
                relax your mind, track health data, and
                improve your daily lifestyle.
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={goNext}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.replace("BottomTabs")}>
                <Text style={styles.backText}>Skip</Text>
              </TouchableOpacity>
            </BlurView>

            {/* CARD 2 */}
            <BlurView
              intensity={50}
              tint="prominent"
              style={[styles.card, { marginRight: GAP }]}
            >
              <Text style={styles.heading}>
                Connect Your Watch
              </Text>

              <Text style={styles.description}>
                Easily connect your smartwatch using
                Bluetooth to track heart rate, sleep,
                temperature, and daily activity.
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={goThird}
              >
                <Text style={styles.buttonText}>
                  Next
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.replace("BottomTabs")}>
                <Text style={styles.backText}>Skip</Text>
              </TouchableOpacity>
            </BlurView>

            {/* CARD 3 */}
            <BlurView
              intensity={50}
              tint="prominent"
              style={styles.card}
            >
              <Text style={styles.heading}>
                Explore Dashboard
              </Text>

              <Text style={styles.description}>
                Access therapy chat, relaxing sounds,
                breathing exercises, Quran, health
                tracking, reports, and more inside
                your dashboard.
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.replace("BottomTabs")}
              >
                <Text style={styles.buttonText}>
                  Explore Dashboard
                </Text>
              </TouchableOpacity>
            </BlurView>

          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  viewport: {
    width: CARD_WIDTH,
    height: 400,
    overflow: "hidden",
  },

  track: {
    flexDirection: "row",
    width: STEP * 3,
  },

  card: {
    width: CARD_WIDTH,
    height: 400,
    borderRadius: 20,
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  heading: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 18,
    textAlign: "center",
    fontFamily: "Poppins_500Medium",
  },

  description: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 13,
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    width: "100%",
    fontFamily: "Poppins_400Regular",
  },

  button: {
    backgroundColor: "#004927",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },

  backText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
});