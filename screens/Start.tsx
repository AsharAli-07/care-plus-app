import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, StyleSheet, Animated, ImageBackground } from "react-native";
import { Audio } from "expo-av";

let sound: Audio.Sound | null = null;




export default function Start({ navigation }: any) {

     useEffect(() => {
    playSound();

    return () => {
      stopSound();
    };
  }, []);

  const playSound = async () => {
    const { sound: loadedSound } = await Audio.Sound.createAsync(
      require("../assets/audio/birdsong.mp3"),
      {
        isLooping: true,
        volume: 0.5,
      }
    );

    sound = loadedSound;
    await sound.playAsync();
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  };

  const opacity = useRef(new Animated.Value(1)).current;

  const texts = [
    "Welcome to Care Plus",
    "Connect Your Watch",
    "Explore Health Journey"
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
      source={require("../assets/images/bg.jpg")} // your image path
      style={styles.container}
      resizeMode="cover"
    >

      {/* Animated Text */}
      <Animated.Text style={[styles.heading, { opacity }]}>
        {texts[index]}
      </Animated.Text>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Connect Watch</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("BottomTabs")}
      >
        <Text style={styles.btnText}>Explore</Text>
      </TouchableOpacity>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
     width: "100%",
  height: "100%",
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 40,
    color: "#045d33",
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: 'Poppins_500Medium'
  },

  btn: {
    backgroundColor: "#045d33",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    width: "80%",
  },

  btnText: {
    color: "#e9fff4",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
});