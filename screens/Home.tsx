import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,  Image,
  Linking, TextInput, ImageBackground
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import YoutubePlayer from "react-native-youtube-iframe";

type SleepItem =
  | { type: "audio"; thumbnail: string; title: string; audioUrl: string }
  | { type: "youtube"; videoId: string; title: string };

const sleepItems: SleepItem[] = [
  {
    type: "audio",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?fit=crop&w=400&h=300",
    title: "Ocean Waves",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    type: "audio",
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=400&h=300",
    title: "Soft Piano",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    type: "youtube",
    videoId: "5qap5aO4i9A",
    title: "Lofi Sleep Music",
  },
  {
    type: "youtube",
    videoId: "DWcJFNfaw9c",
    title: "Rainforest Relaxation",
  },
  {
    type: "audio",
    thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?fit=crop&w=400&h=300",
    title: "Forest Sounds",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];



export default function Home({ navigation }: any) {
  const [selected, setSelected] = useState(false);
  // Animated values
  const textOpacity = useRef(new Animated.Value(1)).current;
  const emojiOpacity = useRef(new Animated.Value(1)).current;
  const responseOpacity = useRef(new Animated.Value(0)).current;
  const startBtnOpacity = useRef(new Animated.Value(0)).current;

  const handleEmojiPress = () => {
    setSelected(true);

    // Fade out text & emoji
    Animated.parallel([
      Animated.timing(textOpacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
      Animated.timing(emojiOpacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ]).start(() => {
      // Fade in response & start button
      Animated.parallel([
        Animated.timing(responseOpacity, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(startBtnOpacity, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ]).start();
    });


  };

const [currentAudio, setCurrentAudio] = useState<string | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
   const soundRef = useRef<Audio.Sound | null>(null);
   const slideAnim = useRef(new Animated.Value(100)).current; 

   useEffect(() => {
  if (currentAudio) {
    // slide UP
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  } else {
    // slide DOWN
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

const forward = async () => {
  if (!soundRef.current) return;

  const status = await soundRef.current.getStatusAsync();

  if (status.isLoaded) {
    const newPosition = (status.positionMillis || 0) + 5000;
    await soundRef.current.setPositionAsync(newPosition);
  }
};

const backward = async () => {
  if (!soundRef.current) return;

  const status = await soundRef.current.getStatusAsync();

  if (status.isLoaded) {
    const newPosition = Math.max((status.positionMillis || 0) - 5000, 0);
    await soundRef.current.setPositionAsync(newPosition);
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

useEffect(() => {
  return () => {
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }
  };
}, []);


const playAudio = async (url: string) => {
  try {
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();

      // toggle pause/resume
      if (status.isLoaded && status.isPlaying && currentAudio === url) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (status.isLoaded && currentAudio === url && !status.isPlaying) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

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


const CircleChart = ({ value }: { value: number }) => {
  const size = 50;              // ✅ overall size control
  const radius = 18;           // ✅ smaller circle
  const strokeWidth = 4;

  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      
      <Svg width={size} height={size}>
        
        {/* Background circle */}
        <Circle
          stroke="#ffffff"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <Circle
          stroke="#045d33"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress}, ${circumference}`}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center text */}
      <Text
        style={{
          position: "absolute",
          fontSize: 10,
          color: "#ffffff",
          fontFamily: "Poppins_400Regular",
        }}
      >
        {value}
      </Text>
    </View>
  );
};


const questions = [
  "How many hours did you sleep last night?",
  "Do you feel stressed today?",
  "Did you eat properly today?",
  "How is your mood right now?",
  "Do you feel anxious or calm?",
];

// answers state
const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));

// only one open at a time
const [openIndex, setOpenIndex] = useState<number | null>(null);

// result text
const [result, setResult] = useState<string | null>(null);

// animated heights for each question
const animatedHeights = useRef(
  questions.map(() => new Animated.Value(0))
).current;

/**
 * Toggle question (only one open at a time)
 */
const toggleQuestion = (index: number) => {
  const isCurrentlyOpen = openIndex === index;

  // close previous + open new
  setOpenIndex(isCurrentlyOpen ? null : index);

  // animate ALL items properly (important fix)
  animatedHeights.forEach((anim, i) => {
    Animated.timing(anim, {
      toValue: i === index && !isCurrentlyOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  });
};

/**
 * update answer text
 */
const updateAnswer = (text: string, index: number) => {
  const updated = [...answers];
  updated[index] = text;
  setAnswers(updated);
};

/**
 * simple mental health scoring
 */
const getResult = () => {
  let score = 0;

  answers.forEach((ans) => {
    if (!ans) return;

    const a = ans.toLowerCase();

    if (a.includes("good") || a.includes("calm") || a.includes("happy")) {
      score += 2;
    } else if (
      a.includes("bad") ||
      a.includes("stressed") ||
      a.includes("anxious") ||
      a.includes("no")
    ) {
      score += 1;
    }
  });

  if (score >= 8) {
    setResult("🟢 You are mentally healthy and stable");
  } else if (score >= 5) {
    setResult("🟡 Mild stress detected, take rest & relax");
  } else {
    setResult("🔴 High stress detected, consider self-care or support");
  }
};

const videos = [
  {
    title: "Stay Strong Motivation",
    videoId: "ZbZSe6N_BXs",
  },
  {
    title: "Never Give Up",
    videoId: "2Lz0VOltZKA",
  },
  {
    title: "Mindset Shift Motivation",
    videoId: "ZXsQAXx_ao0",
  },
  {
    title: "Mental Strength",
    videoId: "mgmVOuLgFB0",
  },
];


const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
const videoAnim = useRef(new Animated.Value(0)).current;

const openVideo = (videoId: string) => {
  if (selectedVideo === videoId) return;

  // reset animation first
  videoAnim.setValue(0);

  setSelectedVideo(videoId);

  Animated.timing(videoAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
};

const closeVideo = () => {
  Animated.timing(videoAnim, {
    toValue: 0,
    duration: 250,
    useNativeDriver: true,
  }).start(() => {
    setSelectedVideo(null);
  });
};


const videoTranslate = videoAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [-80, 0], // TOP → CENTER (open)
});

const videoOpacity = videoAnim;


  return (
    
    <View style={{ flex: 1 }}>
<ImageBackground
  source={require("../assets/images/home-bg.jpg")}
  style={{ height: "100%", width: "100%" }}
  resizeMode="cover"
>
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.overlay}
    >
      
      <View style={styles.InnerCard}>
      <View style={styles.topSection}>
        <Text style={styles.headerText}>Quote of the day</Text>
        <Text style={styles.topText}>"Do the best you can until you know better"</Text>
      </View>

<View style={styles.chatBox}>
  <View style={styles.textWrapper}>
    <Text style={styles.chatText}>Hello, Good Morning</Text>

    {!selected && (
      <Animated.Text style={[styles.chatText, { opacity: textOpacity }]}>
        How are you feeling today?
      </Animated.Text>
    )}

    {selected && (
      <Animated.Text style={[styles.chatText, { opacity: responseOpacity }]}>
        Thanks for your response
      </Animated.Text>
    )}
  </View>

  {/* Emoji row stays outside the wrapper */}
  {!selected && (
    <Animated.View style={[styles.emojiRow, { opacity: emojiOpacity }]}>
      {["😄", "🙂", "😐", "😕", "😔"].map((emoji, index) => (
        <TouchableOpacity
          key={index}
          onPress={handleEmojiPress}
          style={styles.emojiButton}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  )}

  {/* Start conversation button stays outside the wrapper */}
  {selected && (
    <Animated.View style={[styles.startBtn, { opacity: startBtnOpacity }]}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Therapy")}
        style={styles.startBtnInner}
      >
        <Text style={styles.startText}>Start a conversation</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  )}
</View>

<TouchableOpacity style={styles.largeBox}>

 <View style={styles.firstRow}>
    <Text style={styles.checkText}>Status: Good</Text>
   </View>

  <View style={styles.rowInside}>
    
    <View style={styles.col}>
      <Text style={styles.boxHeading}>Blood Pressure</Text>
      <Text style={styles.boxText}>95</Text>
    </View>

    <View style={styles.col}>
      <Text style={styles.boxHeading}>Heart Rate</Text>
      <Text style={styles.boxText}>75</Text>
    </View>

    <View style={[styles.col, styles.lastCol]}>
      <Text style={styles.boxHeading}>temperature</Text>
      <Text style={styles.boxText}>85</Text>
    </View>

  </View>
   <View style={styles.row}>
    <Text style={styles.checkText}>Check</Text>
  <Ionicons name="arrow-forward" size={20} color="#fff" />
   </View>
</TouchableOpacity>

<TouchableOpacity style={styles.chartBox}>

 <View style={styles.firstRow}>
    <Text style={styles.checkText}>Status: Good</Text>
   </View>

  <View style={styles.chartInside}>
    
<View style={styles.chartcol}>
  <CircleChart value={95} />
  <Text style={styles.chartHeading}>Oxygen</Text>
</View>

    <View style={styles.col}>
       <CircleChart value={70} />
      <Text style={styles.chartHeading}>Food</Text>
    </View>

    <View style={[styles.col, styles.chartLastCol]}>
      <CircleChart value={80} />
      <Text style={styles.chartHeading}>Sleep</Text>
    </View>

  </View>
   <View style={styles.row}>
    <Text style={styles.checkText}>Check</Text>
  <Ionicons name="arrow-forward" size={20} color="#fff" />
   </View>
</TouchableOpacity>


<View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionHeading}>Sleep Suggestions</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sleepItems.map((item, index) => (
             <TouchableOpacity
  key={index}
  style={styles.carouselItem}
  onPress={() => {
    if (item.type === "youtube") {
      Linking.openURL(`https://www.youtube.com/watch?v=${item.videoId}`);
    } else {
      playAudio(item.audioUrl); 
    }
  }}
>
                <Image
                  source={{
                    uri:
                      item.type === "audio"
                        ? item.thumbnail
                        : `https://img.youtube.com/vi/${item.videoId}/0.jpg`,
                  }}
                  style={styles.thumbnail}
                />
                <Text style={styles.itemTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

</View>



<View style={styles.healthCard}>
  {/* Title */}
  <Text style={styles.cardTitle}>Questions of the Day</Text>

  {/* Progress */}
  <Text style={styles.progressText}>
    {answers.filter(a => a !== "").length} / {questions.length} answered
  </Text>

  {/* Questions */}
  {questions.map((q, index) => {
    const height = animatedHeights[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 55],
    });

    return (
      <View key={index} style={styles.questionBox}>

        {/* Question Button */}
        <TouchableOpacity onPress={() => toggleQuestion(index)}>
          <Text style={styles.questionText}>{q}</Text>
        </TouchableOpacity>

        {/* Animated Answer Box */}
        <Animated.View style={{ height, overflow: "hidden" }}>
          <TextInput
            placeholder="Answer"
            value={answers[index]}
            onChangeText={(text) => updateAnswer(text, index)}
            style={styles.input}
          />
        </Animated.View>

      </View>
    );
  })}

  {/* Result Button */}
  <TouchableOpacity style={styles.resultBtn} onPress={getResult}>
    <Text style={styles.resultBtnText}>Get Mental Health Result</Text>
  </TouchableOpacity>

  {/* Result Output */}
  {result && (
    <View style={styles.resultBox}>
      <Text style={styles.resultText}>{result}</Text>
    </View>
  )}
</View>



<View style={{marginBottom: 20}}>
  <Text style={styles.sectionHeading}>Motivational Suggestion</Text>

  {videos.map((item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.videoCard}
      onPress={() => openVideo(item.videoId)}
    >
      <Image
        source={{
          uri: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
        }}
        style={styles.videoThumb}
      />
      <Text style={styles.videoTitle}>{item.title}</Text>
    </TouchableOpacity>
  ))}

  {/* PLAYER */}
{selectedVideo && (
  <Animated.View
    style={[
      styles.playerBox,
      {
        opacity: videoOpacity,
        transform: [{ translateY: videoTranslate }],
      },
    ]}
  >
    <YoutubePlayer
      key={selectedVideo}
      height={162}
      play={true}
      videoId={selectedVideo}
    />

    {/* CLOSE BUTTON */}
    <TouchableOpacity onPress={closeVideo} style={styles.closeBtn}>
      <Text style={{ color: "#fff", fontFamily: "Poppins_400Regular" }}>
        ✖ Close
      </Text>
    </TouchableOpacity>
  </Animated.View>
)}
</View>





<View style={styles.circleRow}>

  <View style={styles.circleBox}>
    <Ionicons name="heart" size={20} color="#fff" />
  </View>

  <View style={styles.circleBox}>
    <Ionicons name="moon" size={20} color="#fff" />
  </View>

  <View style={styles.circleBox}>
    <Ionicons name="leaf" size={20} color="#fff" />
  </View>

</View>





</View>

    </ScrollView>


          {currentAudio && (
            <Animated.View
 style={[
  {
    transform: [{ translateY: slideAnim }],
    opacity,
  },
]}
>
<LinearGradient
  colors={[
    "rgba(4,93,52,1)",
    "rgba(4,93,52,0.90)",
    "rgba(4,93,52,0.80)",
   "rgba(4,93,52,0.90)",
     "rgba(4,93,52,1)",
  ]}
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

 </LinearGradient>
 </Animated.View>

)}
    </ImageBackground>
    </View>
  );
};


const styles = StyleSheet.create({



  topSection: {
   
    alignItems: "center",
    height: 70
  },

  headerText: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },
  topText: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "Poppins_400Regular",
  },

InnerCard: {
  padding: 20,
  overflow: "hidden",   // 👈 VERY IMPORTANT
},
  bottomBg: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
},

  text: {
    fontSize: 12,
    marginBottom: 20,
    color: "#045d33",
    fontFamily: "Poppins_400Regular",
  },
    sectionHeading: {
    fontSize: 14,
    marginBottom: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },
  largeBox: {
  height: 160,
   backgroundColor: "rgba(255, 255, 255, 0.20)",
  borderRadius: 12,
  justifyContent: "space-between",
  marginBottom: 20,
  elevation: 3,
  paddingTop: 15,
  paddingBottom: 15
},

rowInside: {
  flexDirection: "row",
  width: "100%",
},

col: {
  flex: 1,
  paddingLeft: 15,
  paddingRight: 15,
  justifyContent: "center",
  borderRightWidth: 1,
  borderColor: "#fff",
  height: 60
},

lastCol: {
  borderRightWidth: 0,
},

boxHeading: {
  paddingTop: 10,
  fontSize: 8,
  color: "#fff",
   fontFamily: "Poppins_500Medium",
},
boxText: {
  fontSize: 40,
  color: "#fff",
  textAlign: "center",
  fontFamily: "Poppins_400Regular",
},
firstRow: {
  alignItems: "center",

},
row: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",

paddingRight: 15,
paddingLeft: 15,
},
checkText: {
  fontSize: 12,
  color: "#fff",
  fontFamily: "Poppins_400Regular",
  
},
 chatBox: {
   backgroundColor: "rgba(255, 255, 255, 0.20)",
  borderRadius: 12,
  marginBottom: 20,
  elevation: 3,
  padding: 15,
},

chatText: {
  fontSize: 12,
  color: "#fff",
  fontFamily: "Poppins_400Regular",
  marginBottom: 5,
},

emojiRow: {
  flexDirection: "row",
  justifyContent: "space-between",
},

emojiButton: { 
  alignItems: "center",
  justifyContent: "center",
},

emoji: {
  fontSize: 16,              
  textAlign: "center",
},

startBtn: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  
},

startText: {
  color: "#fff",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",

},
startBtnInner: {
  flexDirection: "row",         // horizontal layout
  alignItems: "center",         // vertically center
  justifyContent: "space-between", // pushes text left and arrow right
   backgroundColor: "rgba(255, 255, 255, 0.20)",
  width: '100%',           // optional: ensures button isn’t too small
},
textWrapper: {
  paddingBottom: 15,   // space above the question & emojis
},


  carouselItem: {
    width: 250,
    marginRight: 10,
  },

  thumbnail: { width: "100%", height: 120, borderRadius: 12, },
  itemTitle: { textAlign: "center", marginTop: 5, color: '#fff' },

bottomPlayer: {
  position: "absolute",
  bottom: 20,
  left: 20,
  right: 20,
  padding: 10,
  borderRadius: 12,
  elevation: 10,
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
chartHeading: {
  paddingTop: 5,
  fontSize: 8,
  color: "#fff",
   fontFamily: "Poppins_500Medium",
   textAlign: 'center'
},
chartText: {
  fontSize: 35,
  color: "#fff",
  textAlign: "center",
  fontFamily: "Poppins_400Regular",
},
  chartBox: {
  height: 160,
   backgroundColor: "rgba(255, 255, 255, 0.20)",
  borderRadius: 12,
  justifyContent: "space-between",
  marginBottom: 20,
  elevation: 3,
  paddingTop: 15,
  paddingBottom: 15
},

chartInside: {
  flexDirection: "row",
  width: "100%",
},

chartcol: {
  flex: 1,
  paddingLeft: 15,
  paddingRight: 15,
  justifyContent: "center",
  borderRightWidth: 1,
  borderColor: "#fff",
  height: 60
},

chartLastCol: {
  borderRightWidth: 0,
},

healthCard: {
   backgroundColor: "rgba(255, 255, 255, 0.20)",
  borderRadius: 12,
  padding: 15,
  marginBottom: 20,
},

cardTitle: {
  fontSize: 14,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
     marginBottom: 15,
},

progressText: {
  color: "#ffffffff",
  fontSize: 12,
  marginBottom: 15,
},

questionBox: {
  backgroundColor: "rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 10,
  marginBottom: 15,
},

questionText: {
  color: "#fff",
  fontSize: 12,
},

input: {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 10,
  fontSize: 12,
  color: "#000",
  marginTop: 15
},

resultBtn: {
  backgroundColor: "#045d33",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
},

resultBtnText: {
  color: "#ffffffff",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
},

resultBox: {
  marginTop: 10,
  backgroundColor: "rgba(255,255,255,0.20)",
  padding: 10,
  borderRadius: 12,
},

resultText: {
  color: "#fff",
  fontSize: 13,
},




videoCard: {
  flexDirection: "row",
  backgroundColor: "rgba(255,255,255,0.20)",
  padding: 15,
  borderRadius: 12,
  marginBottom: 15,
  alignItems: "center",
  elevation: 2,
},

videoThumb: {
  width: 65,
  height: 35,
  borderRadius: 7,
  marginRight: 10,
},

videoTitle: {
  fontSize: 12,
  color: "#ffffffff",
  flex: 1,
  fontFamily: 'Poppins_400Regular'
},

playerBox: {
  
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: "#000",
},

closeBtn: {
  padding: 10,
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.20)",
},

circleRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

},

circleBox: {
  width: 50,
  height: 50,
  borderRadius: 30,
  backgroundColor: "rgba(255, 255, 255, 0.20)",
  justifyContent: "center",
  alignItems: "center",

  // optional nice effect
  elevation: 5,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 5,
},
overlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.30)", // dark overlay
},
});










