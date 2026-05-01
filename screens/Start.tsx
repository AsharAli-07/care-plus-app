import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageBackground, View
} from "react-native";
import { Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";

export default function Start({ navigation }: any) {
  const soundRef = useRef<Audio.Sound | null>(null);

  // 🎵 SOUND (ONLY WHEN SCREEN IS FOCUSED)
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const playSound = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require("../assets/audio/birdsong.mp3"),
            {
              isLooping: true,
              volume: 0.5,
            }
          );

          if (isActive) {
            soundRef.current = sound;
            await sound.playAsync();
          }
        } catch (error) {
          console.log("Audio error:", error);
        }
      };

      playSound();

      return () => {
        isActive = false;

        const stopSound = async () => {
          if (soundRef.current) {
            try {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync();
              soundRef.current = null;
            } catch (e) {
              console.log(e);
            }
          }
        };

        stopSound();
      };
    }, [])
  );

  // 🎬 TEXT ANIMATION
  const opacity = useRef(new Animated.Value(1)).current;

  const texts = [
    "Welcome to Care Plus",
    "Connect Your Watch",
    "Explore Health Journey",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % texts.length);

        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
 <ImageBackground
   source={require("../assets/images/home-bg.jpg")}
   style={{ height: "100%", width: "100%",
 
  }}
   resizeMode="cover"
 >
<View style={{  backgroundColor: "rgba(0, 0, 0, 0.20)",
 justifyContent: "center",   // ✅ vertical center
  alignItems: "center",       // ✅ horizontal center
    flex: 1,
  }}>

      {/* Animated Text */}
      <Animated.Text style={[styles.heading, { opacity }]}>
        {texts[index]}
      </Animated.Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Connect Watch</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("BottomTabs")}
      >
        <Text style={styles.btnText}>Explore</Text>
      </TouchableOpacity>


</View>
    </ImageBackground>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({

  heading: {
    fontSize: 20,
    marginBottom: 40,
    color: "#ffffffff",
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "Poppins_500Medium",
  },

  btn: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    width: "80%",
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});