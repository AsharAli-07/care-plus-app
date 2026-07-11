import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width * 0.89; // same ratio as Help/Register/Login
const STEP = CARD_WIDTH; // no gap needed, cards sit edge to edge in the track

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
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
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
              <View style={styles.card}>
                <Text style={styles.heading}>Welcome to Care Plus</Text>

                <Text style={styles.description}>
                  Care Plus helps you monitor your wellness,
                  relax your mind, track health data, and
                  improve your daily lifestyle.
                </Text>

                <TouchableOpacity style={styles.button} onPress={goNext}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.replace("BottomTabs")}>
                  <Text style={styles.backText}>Skip</Text>
                </TouchableOpacity>
              </View>

              {/* CARD 2 */}
              <View style={styles.card}>
                <Text style={styles.heading}>Connect Your Watch</Text>

                <Text style={styles.description}>
                  Easily connect your smartwatch using
                  Bluetooth to track heart rate, sleep,
                  temperature, and daily activity.
                </Text>

                <TouchableOpacity style={styles.button} onPress={() => navigation.replace("ConnectWatch")}>
                  <Text style={styles.buttonText}>Connect Now</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={goThird}>
                  <Text style={styles.backText}>Skip</Text>
                </TouchableOpacity>
              </View>

              {/* CARD 3 */}
              <View style={styles.card}>
                <Text style={styles.heading}>Explore Dashboard</Text>

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
                  <Text style={styles.buttonText}>Explore Dashboard</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  viewport: {
    width: CARD_WIDTH,
    height: 330,
    overflow: "hidden",
    borderRadius: 25,
  },

  track: {
    flexDirection: "row",
    width: STEP * 3,
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

  card: {
    width: CARD_WIDTH,
    height: 330,
    borderRadius: 25,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
  },

  heading: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
    fontFamily: "Poppins_500Medium",
  },

  description: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
    fontSize: 12,
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },

  button: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    marginTop: 5,
    paddingVertical: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  backText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});