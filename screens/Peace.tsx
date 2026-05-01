import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

type SleepItem = {
  thumbnail: string;
  title: string;
  audioUrl: string;
};

const sleepItems: SleepItem[] = [
  {
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    title: "Ocean Waves",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    title: "Soft Piano",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
    title: "Forest Sounds",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

const Peace = () => {
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const soundRef = useRef<Audio.Sound | null>(null);
  const slideAnim = useRef(new Animated.Value(100)).current;

  const shouldShow = (type: string) => {
    return selectedFilter === "All" || selectedFilter === type;
  };

  useEffect(() => {
    if (currentAudio) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [currentAudio]);

  const opacity = slideAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
  });

  const playAudio = async (url: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setCurrentAudio(url);
      setIsPlaying(true);
    } catch (e) {
      console.log(e);
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentAudio(null);
    setIsPlaying(false);
  };

  const forward = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded) {
      await soundRef.current.setPositionAsync(
        (status.positionMillis || 0) + 5000
      );
    }
  };

  const backward = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded) {
      await soundRef.current.setPositionAsync(
        Math.max((status.positionMillis || 0) - 5000, 0)
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
        <ScrollView showsVerticalScrollIndicator={false}>
          

            {/* FILTERS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", marginBottom: 20 }}>

                {["All", "Focus", "Calm", "Anxiety", "Sleep"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setSelectedFilter(item)}
                    style={[
                      styles.filterBtn,
                      {
                        marginRight: 20,
                        backgroundColor:
                          selectedFilter === item
                            ? "#004927ff"
                            : "rgba(255,255,255,0.10)",
                      },
                    ]}
                  >
                    <Text style={styles.text}>{item}</Text>
                  </TouchableOpacity>
                ))}

              </View>
            </ScrollView>

            {/* ALL */}
            {shouldShow("All") && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeading}>Recent Suggestions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {sleepItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.carouselItem}
                      onPress={() => playAudio(item.audioUrl)}
                    >
                      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* FOCUS */}
            {shouldShow("Focus") && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeading}>Focus Suggestions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {sleepItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.carouselItem}
                      onPress={() => playAudio(item.audioUrl)}
                    >
                      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* CALM */}
            {shouldShow("Calm") && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeading}>Calm Suggestions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {sleepItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.carouselItem}
                      onPress={() => playAudio(item.audioUrl)}
                    >
                      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ANXIETY */}
            {shouldShow("Anxiety") && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeading}>Anxiety Suggestions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {sleepItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.carouselItem}
                      onPress={() => playAudio(item.audioUrl)}
                    >
                      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* SLEEP */}
            {shouldShow("Sleep") && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeading}>Sleep Suggestions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {sleepItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.carouselItem}
                      onPress={() => playAudio(item.audioUrl)}
                    >
                      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

          

  

        </ScrollView>

        </View>
                  {currentAudio && (
                    <Animated.View
         style={[
          {
            transform: [{ translateY: slideAnim }],
            opacity,
          },
        ]}
        >
        <View
          style={[
          styles.bottomPlayer,
          {
            transform: [{ translateY: slideAnim }],
            opacity,
          },
        ]}
        >
        
        <View style={styles.playerControls}>
        
          {/* ⏪ 5 sec backward */}
          <TouchableOpacity onPress={backward}>
            <Ionicons name="play-back" size={20} color="#fff" />
          </TouchableOpacity>
        
          {/* ▶️ / ⏸ Play-Pause */}
          <TouchableOpacity onPress={() => playAudio(currentAudio)}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        
          {/* ⏩ 5 sec forward */}
          <TouchableOpacity onPress={forward}>
            <Ionicons name="play-forward" size={20} color="#fff" />
          </TouchableOpacity>
        
          {/* ⏹ Stop */}
          <TouchableOpacity onPress={stopAudio}>
            <Ionicons name="stop" size={20} color="#fff" />
          </TouchableOpacity>
        
        </View>
        
         </View>
         </Animated.View>
        
        )}
      </ImageBackground>
    </View>
  );
};

export default Peace;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.30)",
    padding: 20,
    paddingBottom: 60
  },
  sectionHeading: {
    fontSize: 14,
    marginBottom: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },
  text:{
    color: "#fff",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",

  },
  carouselItem: {
    width: 250,
    marginRight: 10,
  },
  thumbnail: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },
  itemTitle: {
    textAlign: "center",
    marginTop: 5,
    color: "#fff",
  },
bottomPlayer: {
  position: "absolute",
  bottom: 80,
  left: 20,
  right: 20,
  padding: 10,
  borderRadius: 12,
  elevation: 10,
  backgroundColor: '#004927ff'
},


playerControls: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
},

control: {
  color: "#fff",
  fontSize: 12,
},
filterBtn: {
  backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
}
});