import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

export default function SOSButton({ onPress }: any) {
  return (
  
      
      <View style={styles.row}>

        {/* BUTTON */}
        <TouchableOpacity style={styles.btn} onPress={onPress}>
          <Text style={styles.text}>🆘 SOS</Text>
        </TouchableOpacity>

        {/* TEXT */}
        <View style={styles.textWrap}>
          <Text style={styles.title}>Panic Button</Text>
          <Text style={styles.subtitle}>
            or press panic button from your watch
          </Text>
        </View>

      </View>


  );
}

const styles = StyleSheet.create({

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  btn: {
    width: 60,
    height: 60,
    borderRadius: 35,

    backgroundColor: "rgba(255,0,0,0.7)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12, // ✅ SPACE BETWEEN BUTTON & TEXT
  },

  text: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
  },

  textWrap: {
    flex: 1,
  },

  title: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
  },

  subtitle: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#bbb",
    marginTop: 2,
  },
});