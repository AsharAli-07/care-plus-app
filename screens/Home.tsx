import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, Animated, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Audio } from "expo-av";
import { BASE_URL } from "../api";

// 📦 Modular Interface Elements Imports
import { HeaderSection } from "../components/HeaderSection";
import { MoodSection } from "../components/MoodSection";
import { VitalSigns } from "../components/VitalSigns";
import { MetricsCharts } from "../components/MetricsCharts";
import { SleepSuggestions } from "../components/SleepSuggestions";
import { DailyQuestions } from "../components/DailyQuestions";
import { MotivationalSuggestions } from "../components/MotivationalSuggestions";
import { FooterQuickActions } from "../components/FooterQuickActions";
import { FloatingAudioPlayer } from "../components/FloatingAudioPlayer";

type SleepItem = { thumbnail: string; title: string; audioUrl: string };

const sleepItems: SleepItem[] = [
  { thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?fit=crop&w=400&h=300", title: "Ocean Waves", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=400&h=300", title: "Soft Piano", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?fit=crop&w=400&h=300", title: "Forest Sounds", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

const questions = [
  "How many hours did you sleep today?",
  "Do you feel stressed today?",
  "Did you eat properly today?",
  "How is your mood right now?",
  "Do you feel anxious or calm?",
];

const videos = [
  { title: "Stay Strong Motivation", videoId: "ZbZSe6N_BXs" },
  { title: "Never Give Up", videoId: "2Lz0VOltZKA" },
  { title: "Mindset Shift Motivation", videoId: "ZXsQAXx_ao0" },
  { title: "Mental Strength", videoId: "mgmVOuLgFB0" },
];

export default function Home({ navigation }: any) {
  // === Notification Core State System ===
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // === User Response State Engine ===
  const [selected, setSelected] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  // === Diagnostics Survey Tracking State ===
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);

  // === Dynamic Internal Layout Animations Refs ===
  const textOpacity = useRef(new Animated.Value(1)).current;
  const emojiOpacity = useRef(new Animated.Value(1)).current;
  const responseOpacity = useRef(new Animated.Value(1)).current;
  const startBtnOpacity = useRef(new Animated.Value(1)).current;
  const videoAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const animatedHeights = useRef(questions.map(() => new Animated.Value(0))).current;

  // === Audio Infrastructure Processing State Engine ===
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // --- Network Endpoint side-effects Operations ---
  const loadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.log("Notification Load Error:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => { loadNotifications(); }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotifications = async () => {
    const nextVisibilityState = !showDropdown;
    setShowDropdown(nextVisibilityState);
    if (nextVisibilityState) {
      try {
        const token = await AsyncStorage.getItem("token");
        await axios.put(`${BASE_URL}/notifications/read-all`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        loadNotifications();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const hasUnread = notifications.some((n) => n.read_status === 0);

  const handleEmojiPress = async (item: string) => {
    try {
      setSelectedEmoji(item);
      setSelected(true);
      const token = await AsyncStorage.getItem("token");
      await axios.post(`${BASE_URL}/mood`, { mood_emoji: item }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.log(err);
    }
  };

  // --- Audio Event Logic Lifecycles ---
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: currentAudio ? 0 : 100,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentAudio]);

  useEffect(() => {
    let rotateLoop: Animated.CompositeAnimation;
    if (isPlaying) {
      rotateAnim.setValue(0);
      rotateLoop = Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 3500, useNativeDriver: true })
      );
      rotateLoop.start();
    } else {
      rotateAnim.stopAnimation();
    }
    return () => { if (rotateLoop) rotateLoop.stop(); };
  }, [isPlaying]);

  useEffect(() => {
    return () => { if (soundRef.current) soundRef.current.unloadAsync(); };
  }, []);

  const handlePlayAudio = async (url: string) => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
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
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      soundRef.current = sound;
      setCurrentAudio(url);
      setIsPlaying(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleForward = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded) {
      await soundRef.current.setPositionAsync((status.positionMillis || 0) + 5000);
    }
  };

  const handleBackward = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded) {
      await soundRef.current.setPositionAsync(Math.max((status.positionMillis || 0) - 5000, 0));
    }
  };

  // --- Dynamic Diagnostic Surveys Math ---
  const handleToggleQuestion = (index: number) => {
    const isCurrentlyOpen = openIndex === index;
    setOpenIndex(isCurrentlyOpen ? null : index);
    animatedHeights.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === index && !isCurrentlyOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleUpdateAnswer = (text: string, index: number) => {
    const updated = [...answers];
    updated[index] = text;
    setAnswers(updated);
  };

  const calculateDiagnosticResult = () => {
    let score = 0;
    answers.forEach((ans) => {
      if (!ans) return;
      const a = ans.toLowerCase();
      if (a.includes("good") || a.includes("calm") || a.includes("happy")) score += 2;
      else if (a.includes("bad") || a.includes("stressed") || a.includes("anxious") || a.includes("no")) score += 1;
    });

    if (score >= 8) setResult("🟢 You are mentally healthy and stable");
    else if (score >= 5) setResult("🟡 Mild stress detected, take rest & relax");
    else setResult("🔴 High stress detected, consider self-care or support");
  };

  // --- YouTube Frame Trigger Controls ---
  const handleOpenVideo = (videoId: string) => {
    if (selectedVideo === videoId) return;
    videoAnim.setValue(0);
    setSelectedVideo(videoId);
    Animated.timing(videoAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const handleCloseVideo = () => {
    Animated.timing(videoAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setSelectedVideo(null);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.overlay}>
          <View style={styles.InnerCard}>
            
            {/* 1. Shared Header Controls Panel Section */}
            <HeaderSection
              navigation={navigation}
              hasUnread={hasUnread}
              showDropdown={showDropdown}
              notifications={notifications}
              onToggleNotifications={handleToggleNotifications}
            />

            {/* 2. Personalized Check-In Selection Block */}
            <MoodSection
              selected={selected}
              selectedEmoji={selectedEmoji}
              textOpacity={textOpacity}
              emojiOpacity={emojiOpacity}
              responseOpacity={responseOpacity}
              startBtnOpacity={startBtnOpacity}
              onEmojiPress={handleEmojiPress}
              onStartConversation={() => navigation.navigate("Therapy")}
            />

            {/* 3. Static Health Indicators Grid Box */}
            <VitalSigns
              status="Good"
              bloodPressure="95"
              heartRate="75"
              temperature="85"
              onCheck={() => console.log("Checking metrics context...")}
            />

            {/* 4. Canvas-drawn Radial Matrix Progression Charts Rows */}
            <MetricsCharts
              status="Good"
              oxygen={95}
              food={70}
              sleep={80}
              onCheck={() => console.log("Validating metric system structures...")}
            />

            {/* 5. Horizontal Audio Media Stream Carousels Options */}
            <SleepSuggestions
              items={sleepItems}
              onSelectTrack={(item) => {
                setCurrentItem(item);
                handlePlayAudio(item.audioUrl);
              }}
            />

            {/* 6. Accordion Dropdown Health Evaluation Questionnaire Form */}
            <DailyQuestions
              questions={questions}
              answers={answers}
              animatedHeights={animatedHeights}
              result={result}
              onToggleQuestion={handleToggleQuestion}
              onUpdateAnswer={handleUpdateAnswer}
              onGetResult={calculateDiagnosticResult}
            />

            {/* 7. YouTube Embedding Navigation Block Container */}
            <MotivationalSuggestions
              videos={videos}
              selectedVideo={selectedVideo}
              videoOpacity={videoAnim}
              videoTranslate={videoAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] })}
              onOpenVideo={handleOpenVideo}
              onCloseVideo={handleCloseVideo}
            />

            {/* 8. Bottom Auxiliary Actions shortcuts Row */}
            <FooterQuickActions />

          </View>
        </ScrollView>

        {/* 9. Decoupled Rotating Disc Floating Audio Control Layout Layer */}
        <FloatingAudioPlayer
          currentAudio={currentAudio}
          currentItem={currentItem}
          isPlaying={isPlaying}
          modalVisible={modalVisible}
          opacity={slideAnim.interpolate({ inputRange: [0, 100], outputRange: [1, 0] })}
          slideAnim={slideAnim}
          spin={rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] })}
          onSetModalVisible={setModalVisible}
          onPlayToggle={handlePlayAudio}
          onForward={handleForward}
          onBackward={handleBackward}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  InnerCard: { padding: 20, paddingTop: 20, paddingBottom: 80, overflow: "hidden" },
});











