import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

export default function SOSButton({ onPress }: any) {
  return (
  
      
      <View style={styles.row}>

        {/* BUTTON */}
        
        
       

        <TouchableOpacity onPress={onPress}>
        <View style={styles.textWrap}>
          
        </View>
 </TouchableOpacity>
      </View>


  );
}

const styles = StyleSheet.create({

  row: {
    alignItems: "center",
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