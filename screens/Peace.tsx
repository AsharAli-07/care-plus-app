import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Modal,
  StatusBar,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import YoutubePlayer from "react-native-youtube-iframe";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// ─── TYPES ────────────────────────────────────────────────────────────────────

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
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  duration: string;
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

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
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    title: "Anxiety Relief",
    artist: "Calm Collective",
    thumbnail: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=300&q=80",
    category: "Anxiety",
    duration: "7:00",
    durationSec: 420,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    title: "Night Meditation",
    artist: "Sleep Lab",
    thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&q=80",
    category: "Sleep",
    duration: "8:15",
    durationSec: 495,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    title: "Morning Light",
    artist: "Sunrise Sessions",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80",
    category: "Focus",
    duration: "5:00",
    durationSec: 300,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    title: "Gentle Stream",
    artist: "Nature Sounds",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=80",
    category: "Calm",
    duration: "6:45",
    durationSec: 405,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    title: "Theta Brain Waves",
    artist: "Mind Space",
    thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300&q=80",
    category: "Focus",
    duration: "10:00",
    durationSec: 600,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    title: "Panic Away",
    artist: "Calm Collective",
    thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&q=80",
    category: "Anxiety",
    duration: "9:30",
    durationSec: 570,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    title: "Cloud Nine",
    artist: "Sleep Lab",
    thumbnail: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=300&q=80",
    category: "Sleep",
    duration: "11:00",
    durationSec: 660,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    title: "Grounding Breath",
    artist: "Calm Collective",
    thumbnail: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&q=80",
    category: "Anxiety",
    duration: "5:45",
    durationSec: 345,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    title: "Study Zone",
    artist: "Mind Space",
    thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&q=80",
    category: "Focus",
    duration: "8:00",
    durationSec: 480,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    title: "Lunar Drift",
    artist: "Sleep Lab",
    thumbnail: "https://images.unsplash.com/photo-1532978379173-523e16f371f9?w=300&q=80",
    category: "Sleep",
    duration: "12:30",
    durationSec: 750,
  },
  {
    id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    title: "Wind Through Pines",
    artist: "Nature Sounds",
    thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
    category: "Calm",
    duration: "6:00",
    durationSec: 360,
  },
];

const VIDEO_DATA: VideoItem[] = [
  {
    id: "dQw4w9WgXcQ",
    title: "Morning Motivation Meditation",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80",
    category: "Focus",
    duration: "10:22",
  },
  {
    id: "9bZkp7q19f0",
    title: "Breathing for Anxiety Relief",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
    category: "Anxiety",
    duration: "8:05",
  },
  {
    id: "bUe6XkHJQsE",
    title: "Deep Sleep Yoga Flow",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
    category: "Sleep",
    duration: "25:00",
  },
  {
    id: "jWd1SnL1P9Y",
    title: "Ocean Calm Visualisation",
    thumbnail: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80",
    category: "Calm",
    duration: "15:30",
  },
  {
    id: "inpok4MKVLM",
    title: "5-Minute Stress Relief",
    thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
    category: "Anxiety",
    duration: "5:00",
  },
  {
    id: "ZToicYcHIOU",
    title: "Sleep Hypnosis Journey",
    thumbnail: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400&q=80",
    category: "Sleep",
    duration: "30:00",
  },
  {
    id: "O-6f5wQXSu8",
    title: "Nature Walk Mindfulness",
    thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
    category: "Calm",
    duration: "12:15",
  },
  {
    id: "1vx8iUvfyCY",
    title: "Power Focus Session",
    thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80",
    category: "Focus",
    duration: "20:00",
  },
  {
    id: "lFcSrYw2ARs",
    title: "Panic Attack Relief",
    thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80",
    category: "Anxiety",
    duration: "7:30",
  },
  {
    id: "MIr3RsUWrdo",
    title: "Sunset Body Scan",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    category: "Calm",
    duration: "18:00",
  },
  {
    id: "77ZozI0rw7w",
    title: "Restful Night Ritual",
    thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    category: "Sleep",
    duration: "22:00",
  },
  {
    id: "Yw6u6YkTgQ4",
    title: "Deep Work Flow State",
    thumbnail: "https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=400&q=80",
    category: "Focus",
    duration: "45:00",
  },
];

const FILTERS = ["All", "Calm", "Focus", "Sleep", "Anxiety"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── ANIMATED WAVE BARS ───────────────────────────────────────────────────────

function WaveBars() {
  const anims = [
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
  ];

  useEffect(() => {
    const createAnim = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 16, duration: 400 + delay, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 4, duration: 400 + delay, useNativeDriver: false }),
        ])
      );
    const animations = anims.map((a, i) => createAnim(a, i * 80));
    animations.forEach((a, i) => setTimeout(() => a.start(), i * 100));
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.waveBars}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={[styles.waveBar, { height: anim }]} />
      ))}
    </View>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Peace() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<"audio" | "video">("audio");
  const [audioFilter, setAudioFilter] = useState("All");
  const [videoFilter, setVideoFilter] = useState("All");

  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<AudioItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);

  const miniPlayerAnim = useRef(new Animated.Value(100)).current;

  const filteredAudio =
    audioFilter === "All"
      ? AUDIO_DATA
      : AUDIO_DATA.filter((i) => i.category === audioFilter);

  const filteredVideo =
    videoFilter === "All"
      ? VIDEO_DATA
      : VIDEO_DATA.filter((i) => i.category === videoFilter);

  // ─── Audio Engine ─────────────────────────────────────────────────────────

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

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

  const seekTo = useCallback(
    async (ratio: number) => {
      if (!soundRef.current || !currentTrack) return;
      const posMs = ratio * currentTrack.durationSec * 1000;
      await soundRef.current.setPositionAsync(posMs);
    },
    [currentTrack]
  );

  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────

  const renderAudioItem = (item: AudioItem) => {
    const isActive = currentTrack?.id === item.id;
    const isLiked = liked[item.id];

    return (

        <BlurView
          intensity={50}
          tint="dark"
          
        >
                <TouchableOpacity
        key={item.id}
        onPress={() => playTrack(item)}
        activeOpacity={0.75}
        style={[styles.trackCard, isActive && styles.trackCardActive]}
      >
          <View style={styles.thumbWrap}>
            <Image source={{ uri: item.thumbnail }} style={styles.trackThumb} />
            <View
              style={[
                styles.thumbOverlay,
                isActive && styles.thumbOverlayActive,
              ]}
            >
              {isActive && isPlaying ? (
                <WaveBars />
              ) : (
                <Ionicons
                  name={isActive ? "pause" : "play"}
                  size={18}
                  color="#fff"
                />
              )}
            </View>
          </View>

          <View style={styles.trackInfo}>
            <Text
              style={[styles.trackTitle, isActive && styles.trackTitleActive]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {item.artist}
            </Text>
            <View style={styles.trackMeta}>
              <View style={styles.catPill}>
                <Text style={styles.catPillText}>{item.category}</Text>
              </View>
              <Text style={styles.trackDur}>{item.duration}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => toggleLike(item.id)}
            style={styles.likeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#4ade80" : "rgba(255,255,255,0.3)"}
            />
          </TouchableOpacity>
          </TouchableOpacity>
        </BlurView>
      
    );
  };

  const renderVideoCard = (item: VideoItem, index: number) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          setSelectedVideo(item);
          setVideoModalOpen(true);
        }}
        activeOpacity={0.8}
       style={styles.videoCardHalf}
      >
        <View style={styles.videoThumbWrap}>
          <Image
            source={{ uri: item.thumbnail }}
            style={
             styles.videoThumbHalf
            }
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.videoPlayBtn}>
            <View style={styles.videoPlayCircle}>
              <Ionicons
                name="play"
                size={16}
                color="#4ade80"
              />
            </View>
          </View>
          <View style={styles.videoDurBadge}>
            <Text style={styles.videoDurText}>{item.duration}</Text>
          </View>
 
        </View>
        <View style={styles.videoCardInfo}>
          <Text style={styles.videoCardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.videoCatPill}>
            <Text style={styles.videoCatText}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />

        <View style={styles.screen}>

          {/* ── TABS ── */}
          <View style={styles.tabBar}>
            {(["audio", "video"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab === "audio" ? "headset" : "play-circle"}
                  size={16}
                  color={
                    activeTab === tab ? "#fff" : "rgba(255,255,255,0.45)"
                  }
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab === "audio" ? "Audio" : "Videos"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ══════════════ AUDIO TAB ══════════════ */}
          {activeTab === "audio" && (
            <>
              {/* FIX: removed flexDirection from contentContainerStyle; use alignItems instead */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                style={styles.filterScrollView}
              >
                {FILTERS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterPill,
                      audioFilter === cat && styles.filterPillActive,
                    ]}
                    onPress={() => setAudioFilter(cat)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        audioFilter === cat && styles.filterTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

            
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom:  100,
                }}
              >
                {filteredAudio.map(renderAudioItem)}
              </ScrollView>
            </>
          )}

          {/* ══════════════ VIDEO TAB ══════════════ */}
          {activeTab === "video" && (
            <>
              {/* FIX: same filter fix for video tab */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                style={styles.filterScrollView}
              >
                {FILTERS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterPill,
                      videoFilter === cat && styles.filterPillActive,
                    ]}
                    onPress={() => setVideoFilter(cat)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        videoFilter === cat && styles.filterTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.videoGrid}
              >
                {filteredVideo.map((item, idx) => renderVideoCard(item, idx))}
              </ScrollView>
            </>
          )}
        </View>

        {/* ══════════════ MINI PLAYER ══════════════ */}
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
            <BlurView intensity={50} tint="dark" style={styles.miniPlayerBlur}>


              <View style={styles.miniRow}>
                <TouchableOpacity
                  onPress={() => setPlayerModalOpen(true)}
                  style={styles.miniLeft}
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
                    <Ionicons
                      name="play-skip-back"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.miniPlayBtn}
                    onPress={() => playTrack(currentTrack)}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={20}
                      color="#4ade80"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => skipTrack("next")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="play-skip-forward"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={stopAudio}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color="rgba(255,255,255,0.4)"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        )}
      </ImageBackground>

      {/* ══════════════ FULL PLAYER MODAL ══════════════ */}
      <Modal
        visible={playerModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPlayerModalOpen(false)}
      >
        <View style={styles.playerModal}>
          <LinearGradient
            colors={["#0d2718", "#091410"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalHandle} />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setPlayerModalOpen(false)}
          >
            <Ionicons
              name="chevron-down"
              size={26}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>

          {currentTrack && (
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.albumArtShadow}>
                <Image
                  source={{ uri: currentTrack.thumbnail }}
                  style={styles.albumArt}
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
                    color={
                      liked[currentTrack.id]
                        ? "#f87171"
                        : "rgba(255,255,255,0.35)"
                    }
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
                      style={[
                        styles.modalProgressFill,
                        { width: `${progress * 100}%` },
                      ]}
                    />
                    <View
                      style={[
                        styles.modalProgressDot,
                        { left: `${progress * 100}%` },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
                <View style={styles.modalTimeRow}>
                  <Text style={styles.modalTime}>
                    {formatTime(currentTimeSec)}
                  </Text>
                  <Text style={styles.modalTime}>{currentTrack.duration}</Text>
                </View>
              </View>

              <View style={styles.modalControls}>
                <TouchableOpacity
                  onPress={() => skipTrack("prev")}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name="play-skip-back"
                    size={28}
                    color="rgba(255,255,255,0.55)"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPlayBtn}
                  onPress={() => playTrack(currentTrack)}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={30}
                    color="#4ade80"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => skipTrack("next")}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={28}
                    color="rgba(255,255,255,0.55)"
                  />
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
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.queueThumb}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.queueTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.queueSub}>
                        {item.artist}  ·  {item.duration}
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
          <LinearGradient
            colors={["#060e0a", "#000"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalHandle} />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setVideoModalOpen(false)}
          >
            <Ionicons
              name="chevron-down"
              size={26}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>

          {selectedVideo && (
            <View style={{ paddingTop: 56 }}>
              <Text style={styles.videoModalTitle}>{selectedVideo.title}</Text>
              <View style={styles.videoPlayerWrap}>
                <YoutubePlayer height={220} play videoId={selectedVideo.id} />
              </View>
              <View style={styles.videoMetaRow}>
                <View style={[styles.videoCatPill, {margin: 0}]}>
                  <Text style={styles.videoCatText}>
                    {selectedVideo.category}
                  </Text>
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

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050f09" },
  bg: { flex: 1, height: '100%', width: '100%' },
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
  screen: { flex: 1, paddingHorizontal: 20, },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1f2820e1",
    borderRadius: 12,
    gap: 15,
    marginTop: 20
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: "#004927",
    shadowColor: "#004927",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
     borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },
  tabText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
  tabTextActive: { color: "#fff" },



  filterRow: {
    gap: 15,
    alignItems: "center", 
    justifyContent: 'center',
  alignSelf: 'center',
 

  },
    filterScrollView: {
    flexGrow: 0,


  },
  filterPill: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
    backgroundColor: "#1f2820e1",
    marginVertical: 20,
    

  
  },
  filterPillActive: {
    backgroundColor: "#004927",
    borderColor: "rgba(74,222,128,0.3)",
  },
  filterText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  filterTextActive: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },

  // Track cards
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
 borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },
  trackCardActive: {
    borderColor: "rgba(0,73,39,0.7)",
    backgroundColor: "rgba(0,73,39,0.2)",
  },
  thumbWrap: { position: "relative" },
  trackThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#111",
  },
  thumbOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbOverlayActive: { backgroundColor: "rgba(0,0,0,0.45)" },
  waveBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 18,
  },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: "#4ade80" },
  trackInfo: { flex: 1, marginLeft: 12 },
  trackTitle: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },
  trackTitleActive: { color: "#4ade80" },
  trackArtist: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    marginTop: 1,
    fontFamily: "Poppins_400Regular",
  },
  trackMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(0,73,39,0.4)",
  },
  catPillText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#4ade80",
    fontFamily: "Poppins_400Regular",
  },
  trackDur: {
    fontSize: 10,
    color: "rgba(255,255,255,0.28)",
    fontFamily: "Poppins_400Regular",
  },
  likeBtn: { paddingLeft: 10 },

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
  miniPlayerBlur: { paddingHorizontal: 20, paddingBottom: 50 },
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
       borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
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
    width: width - 80,
    height: width - 80,
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
    backgroundColor: "rgba(74,222,128,0.3)",
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
videoGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginBottom:65,
},

videoCardHalf: {
  width: "48%",
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: "rgba(255,255,255,0.04)",
  borderColor: "rgba(74,222,128,0.3)",
  borderWidth: 1,
  marginBottom: 15,
},
  videoThumbWrap: { position: "relative" },
  videoThumbHalf: { width: "100%", height: 110, resizeMode: "cover" },
  videoPlayBtn: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,73,39,0.85)",
    alignItems: "center",
    justifyContent: "center",
   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },
  videoDurBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
  videoCardInfo: { padding: 10 },
  videoCardTitle: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    lineHeight: 17,
  },
  videoCatPill: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(0,73,39,0.4)",
  },
  videoCatText: {
    color: "#4ade80",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: "Poppins_500Medium",
  },
  videoMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  videoMetaDur: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  // Video Modal
  videoModal: { flex: 1, backgroundColor: "#060e0a" },
  videoModalTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    paddingHorizontal: 20,
    marginBottom: 16,
    lineHeight: 25,
  },
  videoPlayerWrap: {
    overflow: "hidden",
    borderRadius: 0,
    backgroundColor: "#000",
  },
});
