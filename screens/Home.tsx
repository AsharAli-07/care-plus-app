import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  ScrollView,
  Animated,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Audio } from "expo-av";
import { BASE_URL } from "../api";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";

// 📦 Modular Interface Elements Imports
import { HeaderSection, NotificationOverlay } from "../components/HeaderSection";
import { VitalSigns } from "../components/VitalSigns";
import { useBLEContext } from '../ble';
import { MetricsCharts } from "../components/MetricsCharts";
import { SleepSuggestions } from "../components/SleepSuggestions";
import { DailyQuestions, DailyQuestion } from "../components/DailyQuestions";
import { MotivationalSuggestions } from "../components/MotivationalSuggestions";
import { FooterQuickActions } from "../components/FooterQuickActions";
import { MoodSelector } from "../components/MoodSelector"


// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ label, icon, color = "#4ade80" }: any) => (
  <View style={sh.row}>
    <View style={[sh.bar, { backgroundColor: color }]} />
    <Ionicons name={icon} size={14} color={color} />
    <Text style={[sh.txt, { color }]}>{label}</Text>
  </View>
);

const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 15 },
  bar: { width: 3, height: 16, borderRadius: 2 },
  txt: { fontSize: 16, fontFamily: "Poppins_500Medium" },
});


type SleepItem = { thumbnail: string; title: string; audioUrl: string };
type AudioItem = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  category: string;
  duration: string;
  durationSec: number;
};
type VideoItem = {
  title: string;
  videoId: string;
  category?: string;
  duration?: string;
};

const AUDIO_DATA: AudioItem[] = [
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Ocean Waves",
    artist: "Nature Sounds",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80",
    category: "Calm",
    duration: "4:32",
    durationSec: 272,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    title: "Soft Piano Sleep",
    artist: "Ambient Studio",
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
    category: "Sleep",
    duration: "6:10",
    durationSec: 370,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    title: "Forest Rain",
    artist: "Nature Sounds",
    thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=80",
    category: "Calm",
    duration: "5:20",
    durationSec: 320,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    title: "Deep Focus Flow",
    artist: "Mind Space",
    thumbnail: "https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=300&q=80",
    category: "Focus",
    duration: "3:45",
    durationSec: 225,
  },
];

const sleepItems: SleepItem[] = [
  {
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?fit=crop&w=400&h=300",
    title: "Ocean Waves",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=400&h=300",
    title: "Soft Piano",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?fit=crop&w=400&h=300",
    title: "Forest Sounds",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

// ─── Daily Check-In question bank ──────────────────────────────────────────
// Options are ordered worst -> best; calculateDiagnosticResult() scores off
// the selected option's position in this list, so edit freely as long as the
// ordering stays worst-to-best.
const dailyQuestions: DailyQuestion[] = [
  {
    text: "How many hours did you sleep last night?",
    options: ["Less than 4h", "4–6h", "6–8h", "8h or more"],
  },
  {
    text: "Did you drink enough water today?",
    options: ["Not really", "A little", "Yes, plenty"],
  },
  {
    text: "Did you eat properly today?",
    options: ["No", "Partially", "Yes"],
  },
  {
    text: "Do you feel stressed today?",
    options: ["Very stressed", "A little stressed", "Not at all"],
  },
  {
    text: "Do you feel anxious or calm?",
    options: ["Very anxious", "Somewhat anxious", "Calm"],
  },
];

const videos: VideoItem[] = [
  { title: "Stay Strong Motivation", videoId: "ZbZSe6N_BXs", category: "Motivation", duration: "3:45" },
  { title: "Never Give Up", videoId: "2Lz0VOltZKA", category: "Motivation", duration: "4:12" },
  { title: "Mindset Shift Motivation", videoId: "ZXsQAXx_ao0", category: "Mindset", duration: "5:30" },
  { title: "Mental Strength", videoId: "mgmVOuLgFB0", category: "Mindset", duration: "6:00" },
];

// Helper: format seconds -> "m:ss"
const formatTime = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function Home({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isConnected, watchData } = useBLEContext();
  const { width } = useWindowDimensions();
  const [moodEmoji, setMoodEmoji] = useState<string | null>(null);
  const [moodText, setMoodText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // === Real wellness data, pulled from the same endpoint the Dashboard uses ===
  const [wellness, setWellness] = useState<any>(null);

  const loadWellnessData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/wellness-dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setWellness(data);
      if (data?.mood) {
        setMoodEmoji(data.mood.emoji ?? null);
        setMoodText(data.mood.text ?? null);
      }
    } catch (err) {
      console.log("Wellness Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWellnessData();
  }, []);

  // NOTE on field names: heart_rate / temperature / oxygen_level are assumed
  // names for vitals that aren't in the current /wellness-dashboard payload
  // shown in Dashboard.tsx (that screen hardcodes them). Confirm the real field
  // names your backend returns and adjust the lines below — everything else
  // (sleep_hours, water_intake, meals_count) already matches what Dashboard.tsx uses.
  const heartRate = wellness?.heart_rate ?? "72";
  const temperature = wellness?.temperature ?? "36.6";
  const oxygenLevel = wellness?.oxygen_level ?? 95;

  const foodPct = Math.min(100, Math.round(((wellness?.meals_count ?? 0) / 3) * 100));
  const sleepPct = Math.min(100, Math.round(((wellness?.sleep_hours ?? 0) / 9) * 100));
  const hydrationPct = Math.min(100, Math.round(((wellness?.water_intake ?? 0) / 3) * 100));

  // === Notification Core State System ===
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);


  // === Diagnostics Survey Tracking State ===
  // null = unanswered, otherwise the index of the selected option for that question
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(dailyQuestions.length).fill(null)
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);

  // === Modal State ===
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // === Like State ===
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  // === Dynamic Internal Layout Animations Refs ===
  const videoAnim = useRef(new Animated.Value(0)).current;
  const animatedHeights = useRef(dailyQuestions.map(() => new Animated.Value(0))).current;

  // === Audio Infrastructure Processing State Engine ===
  const [currentTrack, setCurrentTrack] = useState<AudioItem | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const miniPlayerAnim = useRef(new Animated.Value(100)).current;
  const moodMap: Record<string, string> = {
    "😄": "Happy", "🙂": "Good", "😐": "Neutral", "😕": "Sad", "😔": "Very Sad",
  };



    const handleMoodPress = async (emoji: string | null) => {
    if (!emoji) { setMoodEmoji(null); setMoodText(null); return; }
    setMoodEmoji(emoji);
    setMoodText(moodMap[emoji]);
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(`${BASE_URL}/mood`, { mood_emoji: emoji }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { console.log(err); }
  };
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
    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotifications = async () => {
    const nextVisibilityState = !showDropdown;
    setShowDropdown(nextVisibilityState);
    if (nextVisibilityState) {
      try {
        const token = await AsyncStorage.getItem("token");
        await axios.put(
          `${BASE_URL}/notifications/read-all`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        loadNotifications();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const hasUnread = notifications.some((n) => n.read_status === 0);



  // --- Like Toggle ---
  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Seek audio to ratio (0–1) ---
  const seekTo = async (ratio: number) => {
    if (!soundRef.current || !currentTrack) return;
    const targetMs = ratio * currentTrack.durationSec * 1000;
    await soundRef.current.setPositionAsync(targetMs);
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

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = optionIndex;
      return updated;
    });
  };

  const calculateDiagnosticResult = () => {
    let total = 0;
    let answeredCount = 0;

    answers.forEach((selectedIndex, qIdx) => {
      if (selectedIndex === null) return;
      const optionsCount = dailyQuestions[qIdx].options.length;
      // Normalize each question to a 0–2 score based on how good the picked option is
      const normalized = optionsCount > 1 ? selectedIndex / (optionsCount - 1) : 1;
      total += normalized * 2;
      answeredCount += 1;
    });

    if (answeredCount === 0) {
      setResult("Answer at least one question to get a result");
      return;
    }

    if (total >= 8) setResult("🟢 You are mentally healthy and stable");
    else if (total >= 5) setResult("🟡 Mild stress detected, take rest & relax");
    else setResult("🔴 High stress detected, consider self-care or support");
  };

  // --- Video Modal Controls ---
  const handleOpenVideo = (videoId: string) => {
    const video = videos.find((v) => v.videoId === videoId) || null;
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handleCloseVideo = () => {
    setVideoModalOpen(false);
    setSelectedVideo(null);
  };

  // --- Audio Playback ---
  const playTrack = useCallback(
    async (item: AudioItem) => {
      if (currentTrack?.id === item.id && soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setCurrentTrack(item);
      setProgress(0);
      setCurrentTimeSec(0);

      const { sound } = await Audio.Sound.createAsync(
        { uri: item.id },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          const dur = status.durationMillis ?? item.durationSec * 1000;
          const pos = status.positionMillis ?? 0;
          setProgress(dur > 0 ? pos / dur : 0);
          setCurrentTimeSec(pos / 1000);
          if (status.didJustFinish) {
            const idx = AUDIO_DATA.findIndex((a) => a.id === item.id);
            if (idx < AUDIO_DATA.length - 1) playTrack(AUDIO_DATA[idx + 1]);
            else {
              setIsPlaying(false);
              setProgress(0);
            }
          }
        }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      Animated.spring(miniPlayerAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
      }).start();
    },
    [currentTrack, isPlaying]
  );

  const stopAudio = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTimeSec(0);
    Animated.timing(miniPlayerAnim, {
      toValue: 100,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const skipTrack = useCallback(
    async (dir: "prev" | "next") => {
      if (!currentTrack) return;
      const idx = AUDIO_DATA.findIndex((a) => a.id === currentTrack.id);
      const nextIdx =
        dir === "next"
          ? Math.min(AUDIO_DATA.length - 1, idx + 1)
          : Math.max(0, idx - 1);
      if (nextIdx !== idx) playTrack(AUDIO_DATA[nextIdx]);
    },
    [currentTrack, playTrack]
  );

  // --- SleepSuggestions track handler ---
  // Matches a SleepItem's audioUrl to AUDIO_DATA, falls back to a minimal AudioItem
  const handleSleepTrackSelect = (item: SleepItem) => {
    const match = AUDIO_DATA.find((a) => a.id === item.audioUrl);
    if (match) {
      playTrack(match);
    } else {
      // Build a minimal AudioItem so playTrack can still work
      const fallback: AudioItem = {
        id: item.audioUrl,
        title: item.title,
        artist: "Sleep Sounds",
        thumbnail: item.thumbnail,
        category: "Sleep",
        duration: "0:00",
        durationSec: 0,
      };
      playTrack(fallback);
    }
  };


const fetchSessionAndNavigate = async (sessionTitle: string, sessionType?: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/therapy/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sessions: any[] = res.data || [];
 
    // Find the matching upcoming session by title
    const match = sessions.find(
      (s) =>
        s.title === sessionTitle &&
        (s.status === "upcoming" || s.status === "active")
    );
 
    // Also fetch user for context
    const userRes = await axios.get(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = userRes.data;
 
    if (match) {
      if (match.session_type === "voice") {
        navigation.navigate("VoiceTherapy", { session: match, user });
      } else {
        navigation.navigate("ChatTherapy", { session: match, user });
      }
    } else {
      // No exact match — navigate to Therapy tab so user can find their session
      navigation.navigate("Therapy");
    }
  } catch (err) {
    console.log("Session navigate error:", err);
    navigation.navigate("Therapy");
  }
};



  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1, height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />

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
            
             <SectionHeader label="Today's Mood" icon="happy-outline" color="#4ade80" />
           <MoodSelector moodEmoji={moodEmoji} moodText={moodText} onMoodPress={handleMoodPress} />

            {/* 3. Vital Signs — now includes Oxygen below the main row */}

            
        
                <View style={styles.sectionRow}>
                          <SectionHeader label="Vital's Sign" icon="happy-outline" color="#4ade80" />
                          
                            <TouchableOpacity
    style={styles.connectBadge}
    onPress={() => {
      // Navigate to Connect Watch screen
      // navigation.navigate("ConnectWatch");
    }}
    activeOpacity={0.8}
  >
    <Ionicons
      name="watch-outline"
      size={14}
      color="#4ade80"
      style={{ marginRight: 6 }}
    />
    <Text style={styles.connectText}>Connect</Text>
  </TouchableOpacity>
                          
                        </View>
     <VitalSigns
              status={wellness?.vitals_status ?? "Good"}
              heartRate={heartRate}
              temperature={temperature}
              oxygen={oxygenLevel}
              onCheck={loadWellnessData}
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

            {/* 3. Live Health Watch Data */}
            <VitalSigns
              isConnected={isConnected}
              heartRate={watchData.heartRate}
              spo2={watchData.spo2}
              temperature={watchData.temperature}
              onConnect={() => navigation.navigate('ConnectWatch')}
            />
                       
       

            {/* 4. Body's Needs — Food / Sleep / Hydration (Oxygen moved to Vital Signs) */}
             <SectionHeader label="Body's Needs" icon="nutrition-outline" color="#4ade80" />
            <MetricsCharts
              food={foodPct}
              sleep={sleepPct}
              hydration={hydrationPct}
              onCheck={loadWellnessData}
              status={isConnected ? "Live" : "Offline"}
              oxygen={watchData.spo2 !== "--" ? parseFloat(watchData.spo2) : 0}
              food={70}
              sleep={80}
              onCheck={() => navigation.navigate('ConnectWatch')}
            />

            {/* 5. Horizontal Audio Media Stream Carousels Options */}
            <SectionHeader label="Sleep Sounds" icon="moon-outline" color="#4ade80" />
     <SleepSuggestions
  items={sleepItems}
  currentAudioUrl={currentTrack?.id ?? null}
  isPlaying={isPlaying}
  onSelectTrack={handleSleepTrackSelect}
/>

            {/* 6. Accordion Dropdown Health Evaluation Questionnaire Form */}
            <SectionHeader label="Daily Check-In" icon="clipboard-outline" color="#4ade80" />
            <DailyQuestions
              questions={dailyQuestions}
              answers={answers}
              animatedHeights={animatedHeights}
              result={result}

              onToggleQuestion={handleToggleQuestion}
              onSelectOption={handleSelectOption}
              onGetResult={calculateDiagnosticResult}
            />

            {/* 7. YouTube Embedding Navigation Block Container */}
            <SectionHeader label="Motivation" icon="play-circle-outline" color="#4ade80" />
            <MotivationalSuggestions
              videos={videos}
              selectedVideo={selectedVideo?.videoId ?? null}
              videoOpacity={videoAnim}
              videoTranslate={videoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-80, 0],
              })}
              onOpenVideo={handleOpenVideo}
              onCloseVideo={handleCloseVideo}
            />

            {/* 8. Bottom Auxiliary Actions shortcuts Row */}
            <SectionHeader label="Quick Actions" icon="flash-outline" color="#4ade80" />
            <FooterQuickActions />
          </View>
        </ScrollView>
    {/* ── Notification Overlay (outside ScrollView so it never scrolls) ── */}
<NotificationOverlay
  visible={showDropdown}
  notifications={
    notifications.length === 0
      ? [
          {
            id: "welcome-back",
            title: "Welcome Back!",
            message:
              "We're glad to see you again. Check out your daily wellness goals.",
            read_status: 0,
          },
        ]
      : notifications
  }
  onClose={handleToggleNotifications}
  onNotificationPress={(n) => {
    handleToggleNotifications(); // close dropdown first
 
    const title: string = n.title || "";
    const message: string = n.message || "";
 
    // ── Therapy / session notifications → navigate to the correct chat ──
    if (
      title.includes("Session Reminder") ||
      title.includes("Session Starting") ||
      title.includes("Session Booked") ||
      title.includes("Session Starting Soon") ||
      title.includes("Session Starting Now") ||
      title.includes("Session Complete") ||
      title.includes("Voice Session Complete")
    ) {
      // Extract session title from the notification message if present
      // Message format: `Your Chat/Voice session "TITLE" ...`
      const titleMatch = message.match(/"([^"]+)"/);
      const sessionTitle = titleMatch ? titleMatch[1] : null;
 
      if (sessionTitle) {
        fetchSessionAndNavigate(sessionTitle);
      } else {
        navigation.navigate("Therapy");
      }
      return;
    }
 
    // ── Wellness notifications → Wellness Tracker ──
    if (
      title.includes("Hydration") ||
      title.includes("Sleep") ||
      title.includes("Mood Check") ||
      title.includes("Meal") ||
      title.includes("Wellness Log") ||
      title.includes("Wellness Support")
    ) {
      navigation.navigate("WellnessTracker");
      return;
    }
 
    // ── Meditation / mind notifications ──
    if (
      title.includes("Mind Reset") ||
      title.includes("Meditation") ||
      title.includes("Journal") ||
      title.includes("Breathing")
    ) {
      navigation.navigate("Meditation");
      return;
    }
 
    // ── Achievement notifications → Dashboard ──
    if (title.includes("Achievement") || title.includes("Streak")) {
      navigation.navigate("Dashboard");
      return;
    }
 
    // ── Health alert notifications → Health Monitoring screen ──
    if (
      title.includes("Heart Rate") ||
      title.includes("SpO₂") ||
      title.includes("Temperature") ||
      title.includes("Stress Detected") ||
      title.includes("Anxiety Alert")
    ) {
      // Navigate to therapy chat for immediate support on health alerts
      navigation.navigate("Therapy");
      return;
    }
 
    // ── Motivation quotes → Home (already here) ──
    if (title.includes("Motivation") || title.includes("Daily")) {
      return; // stay on Home
    }
 
    // ── Fallback ──
    navigation.navigate("Therapy");
  }}
/>
        {/* 9. MiniPlayer */}
        {currentTrack && (
          <Animated.View
            style={[
              styles.miniPlayer,
              {
                paddingBottom: insets.bottom,
                transform: [{ translateY: miniPlayerAnim }],
              },
            ]}
          >
            <View style={styles.miniPlayerInner}>
              <View style={styles.miniRow}>
                <TouchableOpacity
                  style={styles.miniLeft}
                  onPress={() => setPlayerModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: currentTrack.thumbnail }}
                    style={styles.miniThumb}
                  />
                  <View style={styles.miniInfo}>
                    <Text style={styles.miniTitle} numberOfLines={1}>
                      {currentTrack.title}
                    </Text>
                    <Text style={styles.miniArtist} numberOfLines={1}>
                      {isPlaying ? "▶ Playing" : "⏸ Paused"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.miniControls}>
                  <TouchableOpacity
                    onPress={() => skipTrack("prev")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="play-skip-back" size={15} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.miniPlayBtn}
                    onPress={() => playTrack(currentTrack)}
                  >
                    <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#4ade80" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => skipTrack("next")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="play-skip-forward" size={15} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={stopAudio}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={20} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </ImageBackground>

      {/* ══════════════ AUDIO PLAYER MODAL ══════════════ */}
      <Modal
        visible={playerModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPlayerModalOpen(false)}
      >
        <View style={styles.playerModal}>
          <LinearGradient colors={["#0d2718", "#091410"]} style={StyleSheet.absoluteFill} />
          <View style={styles.modalHandle} />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setPlayerModalOpen(false)}
          >
            <Ionicons name="chevron-down" size={26} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          {currentTrack && (
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.albumArtShadow}>
                <Image
                  source={{ uri: currentTrack.thumbnail }}
                  style={[styles.albumArt, { width: width - 80, height: width - 80 }]}
                />
              </View>

              <View style={styles.modalTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{currentTrack.title}</Text>
                  <Text style={styles.modalArtist}>{currentTrack.artist}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleLike(currentTrack.id)}>
                  <Ionicons
                    name={liked[currentTrack.id] ? "heart" : "heart-outline"}
                    size={26}
                    color={liked[currentTrack.id] ? "#f87171" : "rgba(255,255,255,0.35)"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalProgressWrap}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={(e) => {
                    const ratio = e.nativeEvent.locationX / (width - 48);
                    seekTo(Math.max(0, Math.min(1, ratio)));
                  }}
                  style={styles.modalProgressTrackWrap}
                >
                  <View style={styles.modalProgressTrack}>
                    <View
                      style={[styles.modalProgressFill, { width: `${progress * 100}%` }]}
                    />
                    <View
                      style={[styles.modalProgressDot, { left: `${progress * 100}%` }]}
                    />
                  </View>
                </TouchableOpacity>
                <View style={styles.modalTimeRow}>
                  <Text style={styles.modalTime}>{formatTime(currentTimeSec)}</Text>
                  <Text style={styles.modalTime}>{currentTrack.duration}</Text>
                </View>
              </View>

              <View style={styles.modalControls}>
                <TouchableOpacity
                  onPress={() => skipTrack("prev")}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="play-skip-back" size={28} color="rgba(255,255,255,0.55)" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPlayBtn}
                  onPress={() => playTrack(currentTrack)}
                >
                  <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="#4ade80" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => skipTrack("next")}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="play-skip-forward" size={28} color="rgba(255,255,255,0.55)" />
                </TouchableOpacity>
              </View>

              <Text style={styles.queueLabel}>Up Next</Text>
              {AUDIO_DATA.filter((t) => t.id !== currentTrack.id)
                .slice(0, 4)
                .map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => playTrack(item)}
                    style={styles.queueItem}
                  >
                    <Image source={{ uri: item.thumbnail }} style={styles.queueThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.queueTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.queueSub}>
                        {item.artist} · {item.duration}
                      </Text>
                    </View>
                    <Ionicons
                      name="play-circle-outline"
                      size={22}
                      color="rgba(255,255,255,0.3)"
                    />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* ══════════════ VIDEO PLAYER MODAL ══════════════ */}
      <Modal
        visible={videoModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVideoModalOpen(false)}
      >
        <View style={styles.videoModal}>
          <LinearGradient colors={["#0d2718", "#091410"]} style={StyleSheet.absoluteFill} />
          <View style={styles.modalHandle} />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setVideoModalOpen(false)}
          >
            <Ionicons name="chevron-down" size={26} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          {selectedVideo && (
            <View style={{ paddingTop: 56 }}>
              <Text style={styles.videoModalTitle}>{selectedVideo.title}</Text>
              <View style={styles.videoPlayerWrap}>
                <YoutubePlayer height={187} play videoId={selectedVideo.videoId} />
              </View>
              <View style={styles.videoMetaRow}>
                <View style={[styles.videoCatPill, { margin: 0 }]}>
                  <Text style={styles.videoCatText}>{selectedVideo.category}</Text>
                </View>
                <Text style={styles.videoMetaDur}>{selectedVideo.duration}</Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  InnerCard: { padding: 20, paddingTop: 20, paddingBottom: 100, overflow: "hidden" },
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
  // Mini Player
  miniPlayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(74,222,128,0.3)",
  },
    miniPlayerInner: { backgroundColor: "rgba(0,26,17,0.95)", paddingHorizontal: 20, paddingBottom: 90 },
  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
  },
  miniLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  miniThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  miniInfo: { flex: 1 },
  miniTitle: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
  miniArtist: {
    color: "#4ade80",
    fontSize: 10,
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },
  miniControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  miniPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#004927",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
  },

  // Full Player Modal
  playerModal: { flex: 1, backgroundColor: "#0d2718" },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginTop: 12,
  },
  modalClose: {
    position: "absolute",
    top: 14,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  albumArtShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    alignSelf: "center",
    marginBottom: 28,
  },
  albumArt: {
    borderRadius: 22,
    backgroundColor: "#111",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    letterSpacing: -0.3,
  },
  modalArtist: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  modalProgressWrap: { marginBottom: 28 },
  modalProgressTrackWrap: { paddingVertical: 12 },
  modalProgressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    position: "relative",
  },
  modalProgressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#4ade80",
    borderRadius: 2,
  },
  modalProgressDot: {
    position: "absolute",
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginLeft: -8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  modalTime: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  modalControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    marginBottom: 32,
  },
  modalPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#004927",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
    shadowColor: "#004927",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  queueLabel: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.3)",
    marginBottom: 12,
    fontFamily: "Poppins_500Medium",
  },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  queueThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  queueTitle: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  queueSub: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 10,
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },

  // Video Cards

  videoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingBottom: 80 },
  videoCardHalf: { width: "48%", borderRadius: 12, overflow: "hidden", backgroundColor: "rgba(0,26,17,0.53)", borderColor: "rgba(74,222,128,0.3)", borderWidth: 1, marginBottom: 14 },
  videoThumbWrap: { position: "relative" },
  videoThumbHalf: { width: "100%", height: 110, resizeMode: "cover" },
  videoPlayBtn: { position: "absolute", top:0, left:0, right:0, bottom:0, alignItems: "center", justifyContent: "center" },
  videoPlayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,73,39,0.85)", alignItems: "center", justifyContent: "center", borderColor: "rgba(74,222,128,0.3)", borderWidth: 1 },
  videoLikeBtn: { position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  videoDurBadge: { position: "absolute", bottom: 6, right: 6, backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  videoDurText: { color: "#fff", fontSize: 10, fontFamily: "Poppins_400Regular" },
  videoCardInfo: { padding: 10 },
  videoCardTitle: { color: "#fff", fontSize: 11, fontFamily: "Poppins_400Regular", lineHeight: 16 },
  videoCatPill: { marginTop: 6, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(0,73,39,0.4)" },
  videoCatText: { color: "#4ade80", fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "Poppins_400Regular" },
  videoMetaRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginTop: 14 },
  videoMetaDur: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    videoModal: { flex: 1, backgroundColor: "#060e0a" },
  videoModalTitle: { color: "#fff", fontSize: 14, fontFamily: "Poppins_500Medium", paddingHorizontal: 20, marginBottom: 16, lineHeight: 22 },
  videoPlayerWrap: { overflow: "hidden", backgroundColor: "#000" },
connectBadge: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
   backgroundColor: "rgba(0, 26, 17, 0.53)",
  borderWidth: 1,
  borderColor: "rgba(74,222,128,0.30)",
  marginBottom: 15
},

connectText: {
  color: "#4ade80",
  fontSize: 11,
  fontFamily: "Poppins_500Medium",
},
});