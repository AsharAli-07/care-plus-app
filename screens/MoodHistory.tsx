import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView, TouchableOpacity, StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "expo-blur";
import { BASE_URL } from '../api';
import { LinearGradient } from "expo-linear-gradient";




const MoodHistory = () => {

const [moods, setMoods] = useState<any[]>([]);
const [offset, setOffset] = useState(0);
const [loadingMore, setLoadingMore] = useState(false);

const LIMIT = 7;



const loadMoods = async (reset = false) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const currentOffset = reset ? 0 : offset;

    if (!reset) setLoadingMore(true);

    const res = await axios.get(
      `${BASE_URL}/mood-history?limit=${LIMIT}&offset=${currentOffset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

const newData = res.data;

if (reset) {

  setMoods(newData);

  if (newData.length < LIMIT) {
    setOffset(-1);
  } else {
    setOffset(LIMIT);
  }

} else {

  setMoods((prev) => [...prev, ...newData]);

  if (newData.length < LIMIT) {
    setOffset(-1);
  } else {
    setOffset((prev) => prev + LIMIT);
  }

}

  } catch (err) {
    console.log(err);
  } finally {
    setLoadingMore(false);
  }
};

useEffect(() => {
  loadMoods(true);
}, []);
const deleteMood = async (id: number) => {

  try {

    const token = await AsyncStorage.getItem("token");

    await axios.delete(
      `${BASE_URL}/delete-mood/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMoods((prev) =>
      prev.filter((item) => item.id !== id)
    );

  } catch (err) {
    console.log(err);
  }
};


if (moods.length === 0) {
  return (
    <ImageBackground
      source={require("../assets/images/home-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No mood history found
          </Text>
        </View>

      </View>
    </ImageBackground>
  );
}
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
        <ScrollView
          showsVerticalScrollIndicator={false} style={{paddingHorizontal: 20,}}
        >

        <Text style={styles.heading}>
          Mood History
        </Text>


          {moods.map((item, index) => (

    <View
  style={styles.card}
>

  <Text style={styles.emoji}>
    {item.mood_emoji}
  </Text>

  <View style={{ flex: 1 }}>

    <Text style={styles.moodText}>
      {item.mood_text}
    </Text>

    <Text style={styles.date}>
      {new Date(item.created_at).toLocaleString()}
    </Text>

  </View>

  <TouchableOpacity
    onPress={() => deleteMood(item.id)}
  >
    <Ionicons
      name="trash"
      size={22}
      color="red"
    />
  </TouchableOpacity>

</View>

          ))}

{offset !== -1 && moods.length > 0 && (
  <TouchableOpacity
    style={styles.loadMoreBtn}
    onPress={() => loadMoods()}
    disabled={loadingMore}
  >
    <Text style={styles.loadMoreText}>
      {loadingMore ? "Loading..." : "Load More"}
    </Text>
  </TouchableOpacity>
)}

        </ScrollView>
        </View>
</ImageBackground>
      </View>
    
  );
};

export default MoodHistory;

const styles = StyleSheet.create({

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    
    
    
  },

  heading: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    textAlign: 'center',
    marginTop: 40,
    paddingBottom: 30
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
     backgroundColor: "rgba(0, 26, 17, 0.53)",
  },

  emoji: {
    fontSize: 35,
    marginRight: 15,
  },

  moodText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },

  date: {
    color: "#ddd",
    fontSize: 12,
    marginTop: 5,
    fontFamily: "Poppins_400Regular",
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
  loadMoreBtn: {
  backgroundColor: "#004927",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 10,
  marginBottom: 20,
},

loadMoreText: {
  color: "#fff",
  fontFamily: "Poppins_400Regular",
  fontSize: 12
},

emptyBox: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",

},

emptyText: {
  color: "#fff",
  fontSize: 20,
  fontFamily: "Poppins_500Medium",
  opacity: 0.8,
},
});