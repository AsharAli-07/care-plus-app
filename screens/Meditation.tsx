import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';

const Meditation = () => {
  return (
 <View style={{ flex: 1}}>
<ImageBackground
  source={require("../assets/images/home-bg.jpg")}
  style={{ height: "100%", width: "100%"}}
  resizeMode="cover"
>
<View style={styles.overlay}>
<BlurView
  intensity={50}
  tint="prominent"
  style={{
    width: 60,
    height: 60,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  }}
>
  <TouchableOpacity   
  style={{
    width: 60,
    height: 60,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  }}>
    <Image
      source={require("../assets/images/cd.png")}
      style={{
        width: 50,
        height: 50,
      }}
      resizeMode="contain"
    />
  </TouchableOpacity>
</BlurView>
</View>




</ImageBackground>
  </View>
  );
};

export default Meditation;

const styles = StyleSheet.create({
  overlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.30)", // dark overlay
},
});