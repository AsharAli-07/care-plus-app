import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";

const Peace = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView style={styles.overlay} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>🌿 Peace & Mindfulness</Text>
          <Text style={styles.text}>
            Welcome to your quiet space. Take a deep breath, settle into the present moment, and let your mind rest.
          </Text>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default Peace;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  background: { 
    height: "100%", 
    width: "100%", 
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.40)", // Slightly darkened overlay for readability
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 16,
  },
  text: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    lineHeight: 24,
    opacity: 0.9,
  },
});