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
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

const { width } = Dimensions.get("window");

type AudioItem = {
  id: string; title: string; artist: string; thumbnail: string;
  category: string; duration: string; durationSec: number;
};
type VideoItem = {
  id: string; title: string; thumbnail: string; category: string; duration: string;
};

const AUDIO_DATA: AudioItem[] = [
    { id: "https://server8.mp3quran.net/afs/001.mp3", title: "Surah Al-Fatiha", artist: "Sheikh Afasy", thumbnail: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=300&q=80", category: "Quran", duration: "1:30", durationSec: 90 },
  { id: "https://server8.mp3quran.net/afs/036.mp3", title: "Surah Ya-Sin", artist: "Sheikh Afasy", thumbnail: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=300&q=80", category: "Quran", duration: "14:00", durationSec: 840 },
  { id: "https://server8.mp3quran.net/afs/055.mp3", title: "Surah Ar-Rahman", artist: "Sheikh Afasy", thumbnail: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=300&q=80", category: "Quran", duration: "12:00", durationSec: 720 },
  { id: "https://server8.mp3quran.net/afs/002.mp3", title: "Surah Al-Baqarah", artist: "Sheikh Afasy", thumbnail: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=300&q=80", category: "Quran", duration: "1:42:00", durationSec: 6120 },
  { id: "https://server8.mp3quran.net/afs/067.mp3", title: "Surah Al-Mulk", artist: "Sheikh Afasy", thumbnail: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=300&q=80", category: "Quran", duration: "7:30", durationSec: 450 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", title: "Ocean Waves", artist: "Nature Sounds", thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80", category: "Calm", duration: "4:32", durationSec: 272 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", title: "Gentle Stream", artist: "Nature Sounds", thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=80", category: "Calm", duration: "6:45", durationSec: 405 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", title: "Forest Rain", artist: "Nature Sounds", thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=80", category: "Calm", duration: "5:20", durationSec: 320 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", title: "Wind Through Pines", artist: "Nature Sounds", thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80", category: "Calm", duration: "6:00", durationSec: 360 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", title: "Soft Piano Sleep", artist: "Ambient Studio", thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80", category: "Sleep", duration: "6:10", durationSec: 370 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", title: "Night Meditation", artist: "Sleep Lab", thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&q=80", category: "Sleep", duration: "8:15", durationSec: 495 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", title: "Cloud Nine", artist: "Sleep Lab", thumbnail: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=300&q=80", category: "Sleep", duration: "11:00", durationSec: 660 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", title: "Lunar Drift", artist: "Sleep Lab", thumbnail: "https://images.unsplash.com/photo-1532978379173-523e16f371f9?w=300&q=80", category: "Sleep", duration: "12:30", durationSec: 750 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", title: "Deep Focus Flow", artist: "Mind Space", thumbnail: "https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=300&q=80", category: "Focus", duration: "3:45", durationSec: 225 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", title: "Theta Brain Waves", artist: "Mind Space", thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300&q=80", category: "Focus", duration: "10:00", durationSec: 600 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", title: "Study Zone", artist: "Mind Space", thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&q=80", category: "Focus", duration: "8:00", durationSec: 480 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", title: "Morning Light", artist: "Sunrise Sessions", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", category: "Focus", duration: "5:00", durationSec: 300 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", title: "Anxiety Relief", artist: "Calm Collective", thumbnail: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=300&q=80", category: "Anxiety", duration: "7:00", durationSec: 420 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", title: "Panic Away", artist: "Calm Collective", thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&q=80", category: "Anxiety", duration: "9:30", durationSec: 570 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", title: "Grounding Breath", artist: "Calm Collective", thumbnail: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&q=80", category: "Anxiety", duration: "5:45", durationSec: 345 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", title: "Body Scan Meditation", artist: "Mindful Studio", thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80", category: "Meditation", duration: "9:00", durationSec: 540 },
  { id: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3", title: "Loving Kindness", artist: "Mindful Studio", thumbnail: "https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=300&q=80", category: "Meditation", duration: "8:00", durationSec: 480 },
];

const VIDEO_DATA: VideoItem[] = [
  { id: "vj0JDwQLof4", title: "Meditation for Beginners", thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80", category: "Meditation", duration: "10:22" },
  { id: "inpok4MKVLM", title: "5-Minute Stress Relief Meditation", thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80", category: "Meditation", duration: "5:00" },
  { id: "o-kMJBWk9E0", title: "Guided Mindfulness Meditation", thumbnail: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80", category: "Meditation", duration: "12:00" },
  { id: "ZToicYcHIOU", title: "Sleep Hypnosis Journey", thumbnail: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400&q=80", category: "Meditation", duration: "30:00" },
  { id: "LiUnFJ8P4gM", title: "4-7-8 Breathing Technique", thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80", category: "Breathing", duration: "6:00" },
  { id: "VUjiXcfKBn8", title: "Box Breathing for Calm", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", category: "Breathing", duration: "5:30" },
  { id: "enJyOTvEn4M", title: "Breathing for Anxiety Relief", thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80", category: "Breathing", duration: "8:05" },
  { id: "DbDoBzGY3vo", title: "Wim Hof Breathing Method", thumbnail: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=400&q=80", category: "Breathing", duration: "11:00" },
  { id: "9Fp9AW57tYg", title: "Deep Belly Breathing", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", category: "Breathing", duration: "7:00" },
  { id: "s-1vMbAgYWU", title: "Morning Yoga Flow", thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80", category: "Yoga", duration: "20:00" },
  { id: "bYQwM841ED4", title: "Stress Relief Yoga", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", category: "Yoga", duration: "25:00" },
  { id: "dcqW72d5JjI", title: "Evening Wind-Down Yoga", thumbnail: "https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?w=400&q=80", category: "Yoga", duration: "18:00" },
  { id: "2IcWJobNDck", title: "Yoga for Anxiety", thumbnail: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=400&q=80", category: "Yoga", duration: "30:00" },
  { id: "lMWOrDH694c", title: "Full Body Relaxation Yoga", thumbnail: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=400&q=80", category: "Yoga", duration: "22:00" },
  { id: "C2RAjUEAoLI", title: "Yoga for Complete Beginners", thumbnail: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80", category: "Yoga", duration: "20:00" },
  { id: "wRAtVLgj-wU", title: "10-Min Beginner Yoga", thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80", category: "Yoga", duration: "10:00" },
  { id: "ah4Hnrz3CDg", title: "Understanding Anxiety", thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80", category: "Education", duration: "15:00" },
  { id: "rpolpKTWrp4", title: "How Depression Works", thumbnail: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=400&q=80", category: "Education", duration: "12:00" },
  { id: "ZtBlAXo8LsY", title: "Mental Health Explained", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", category: "Education", duration: "18:00" },
  { id: "U9ml2mmfMfM", title: "The Science of Stress", thumbnail: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=400&q=80", category: "Education", duration: "20:00" },
  { id: "cNSFCkybzdU", title: "How to Build Resilience", thumbnail: "https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=400&q=80", category: "Education", duration: "14:00" },
  { id: "ALSc0SRPyeo", title: "Psychology of Habits", thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80", category: "Psychology", duration: "10:00" },
  { id: "BQ3zdbhJdQE", title: "Cognitive Behavioral Tips", thumbnail: "https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=400&q=80", category: "Psychology", duration: "12:00" },
  { id: "VZe5vXH7TcE", title: "How to Stop Overthinking", thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80", category: "Psychology", duration: "9:00" },
  { id: "POt8ip4jOAI", title: "The Science of Sleep", thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80", category: "Sleep", duration: "16:00" },
  { id: "eM2VWspRpfk", title: "Why We Sleep — Summary", thumbnail: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400&q=80", category: "Sleep", duration: "14:00" },
  { id: "IM48HKJbu70", title: "Sleep Hygiene Tips", thumbnail: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400&q=80", category: "Sleep", duration: "11:00" },
  { id: "aXflBZXAucQ", title: "Deep Sleep Induction", thumbnail: "https://images.unsplash.com/photo-1532978379173-523e16f371f9?w=400&q=80", category: "Sleep", duration: "30:00" },
  { id: "eVFzbxmKNUw", title: "The Power of Vulnerability", thumbnail: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80", category: "TED Talks", duration: "20:00" },
  { id: "eIho2S0ZahI", title: "How to Make Stress Your Friend", thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80", category: "TED Talks", duration: "14:00" },
  { id: "-FOCpMAww28", title: "The Happy Secret to Better Work", thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80", category: "TED Talks", duration: "12:00" },
  { id: "MT2q1YKZQPE", title: "Your Body Language Shapes Who You Are", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", category: "TED Talks", duration: "21:00" },
  { id: "_X0mgOOSpLU", title: "Growth Mindset — Change Your Mind", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", category: "Mindset", duration: "10:00" },
  { id: "fOVXQVlNJYE", title: "The Power of Now", thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80", category: "Mindset", duration: "15:00" },
  { id: "TxdYWERRyoU", title: "Discipline Over Motivation", thumbnail: "https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=400&q=80", category: "Mindset", duration: "8:00" },
  { id: "L4N1q4RNi9I", title: "Atomic Habits Summary", thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80", category: "Mindset", duration: "12:00" },
  { id: "w04YdlGfA80", title: "Win the Morning, Win the Day", thumbnail: "https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?w=400&q=80", category: "Mindset", duration: "11:00" },
];

const AUDIO_FILTERS = ["All", "Quran", "Calm", "Sleep", "Focus", "Anxiety", "Meditation"];
const VIDEO_FILTERS = ["All", "Meditation", "Breathing", "Yoga", "Sleep", "Education", "Psychology", "TED Talks", "Mindset"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function WaveBars() {
  const anims = [
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
  ];
  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 16, duration: 400 + i * 80, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 4, duration: 400 + i * 80, useNativeDriver: false }),
      ]))
    );
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

export default function Peace() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab]     = useState<"audio" | "video">("audio");
  const [audioFilter, setAudioFilter] = useState("All");
  const [videoFilter, setVideoFilter] = useState("All");

  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentTrack,    setCurrentTrack]    = useState<AudioItem | null>(null);
  const [isPlaying,       setIsPlaying]       = useState(false);
  const [progress,        setProgress]        = useState(0);
  const [currentTimeSec,  setCurrentTimeSec]  = useState(0);
  const [liked,           setLiked]           = useState<Record<string, boolean>>({});
  const [selectedVideo,   setSelectedVideo]   = useState<VideoItem | null>(null);
  const [videoModalOpen,  setVideoModalOpen]  = useState(false);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);

  const miniPlayerAnim = useRef(new Animated.Value(100)).current;

// ── Load likes from DB on mount ───────────────────────────────────────────
useEffect(() => {
  (async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${BASE_URL}/peace/likes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const map: Record<string, boolean> = {};
      (res.data as { item_id: string }[]).forEach((row) => {
        map[row.item_id] = true;
      });
      setLiked(map);
    } catch (err) {
      console.log("Load likes error:", err);
    }
  })();
}, []); // ← no dependencies, runs once on mount — correct

// ── Toggle like — reads current state via callback to avoid stale closure ─────
const toggleLike = useCallback(async (id: string) => {
  // Read current value FIRST before any async ops
  let wasLiked = false;
  setLiked((prev) => {
    wasLiked = !!prev[id];
    return { ...prev, [id]: !prev[id] }; // optimistic update
  });

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    if (wasLiked) {
      await axios.delete(`${BASE_URL}/peace/likes/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(
        `${BASE_URL}/peace/likes`,
        { item_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  } catch (err) {
    console.log("Toggle like error:", err);
    // Roll back on failure
    setLiked((prev) => ({ ...prev, [id]: wasLiked }));
  }
}, []); // ← empty deps — state is read via functional updater, no stale closure

  // ── Sort liked items to top ───────────────────────────────────────────────
  const sortLikedFirst = <T extends { id: string }>(arr: T[]) =>
    [...arr].sort((a, b) => (liked[b.id] ? 1 : 0) - (liked[a.id] ? 1 : 0));

  const filteredAudio = sortLikedFirst(
    audioFilter === "All" ? AUDIO_DATA : AUDIO_DATA.filter((i) => i.category === audioFilter)
  );
  const filteredVideo = sortLikedFirst(
    videoFilter === "All" ? VIDEO_DATA : VIDEO_DATA.filter((i) => i.category === videoFilter)
  );

  useEffect(() => {
    Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: true, shouldDuckAndroid: true });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const playTrack = useCallback(async (item: AudioItem) => {
    if (currentTrack?.id === item.id && soundRef.current) {
      if (isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
      else           { await soundRef.current.playAsync();  setIsPlaying(true); }
      return;
    }
    if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); soundRef.current = null; }
    setCurrentTrack(item); setProgress(0); setCurrentTimeSec(0);
    const { sound } = await Audio.Sound.createAsync(
      { uri: item.id }, { shouldPlay: true },
      (status) => {
        if (!status.isLoaded) return;
        const dur = status.durationMillis ?? item.durationSec * 1000;
        const pos = status.positionMillis ?? 0;
        setProgress(dur > 0 ? pos / dur : 0);
        setCurrentTimeSec(pos / 1000);
        if (status.didJustFinish) {
          const idx = AUDIO_DATA.findIndex((a) => a.id === item.id);
          if (idx < AUDIO_DATA.length - 1) playTrack(AUDIO_DATA[idx + 1]);
          else { setIsPlaying(false); setProgress(0); }
        }
      }
    );
    soundRef.current = sound;
    setIsPlaying(true);
    Animated.spring(miniPlayerAnim, { toValue: 0, useNativeDriver: true, tension: 80 }).start();
  }, [currentTrack, isPlaying]);

  const stopAudio = useCallback(async () => {
    if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); soundRef.current = null; }
    setCurrentTrack(null); setIsPlaying(false); setProgress(0); setCurrentTimeSec(0);
    Animated.timing(miniPlayerAnim, { toValue: 100, duration: 250, useNativeDriver: true }).start();
  }, []);

  const skipTrack = useCallback(async (dir: "prev" | "next") => {
    if (!currentTrack) return;
    const idx = AUDIO_DATA.findIndex((a) => a.id === currentTrack.id);
    const nextIdx = dir === "next" ? Math.min(AUDIO_DATA.length - 1, idx + 1) : Math.max(0, idx - 1);
    if (nextIdx !== idx) playTrack(AUDIO_DATA[nextIdx]);
  }, [currentTrack, playTrack]);

  const seekTo = useCallback(async (ratio: number) => {
    if (!soundRef.current || !currentTrack) return;
    await soundRef.current.setPositionAsync(ratio * currentTrack.durationSec * 1000);
  }, [currentTrack]);

  const renderAudioItem = (item: AudioItem) => {
    const isActive = currentTrack?.id === item.id;
    const isLiked  = !!liked[item.id];
    return (
      <TouchableOpacity key={item.id} onPress={() => playTrack(item)} activeOpacity={0.75} style={[styles.trackCard, isActive && styles.trackCardActive]}>
        <View style={styles.thumbWrap}>
          <Image source={{ uri: item.thumbnail }} style={styles.trackThumb} />
          <View style={[styles.thumbOverlay, isActive && styles.thumbOverlayActive]}>
            {isActive && isPlaying ? <WaveBars /> : <Ionicons name={isActive ? "pause" : "play"} size={18} color="#fff" />}
          </View>
        </View>
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, isActive && styles.trackTitleActive]} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
          <View style={styles.trackMeta}>
            <View style={styles.catPill}><Text style={styles.catPillText}>{item.category}</Text></View>
            <Text style={styles.trackDur}>{item.duration}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeBtn} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#4ade80" : "#999"} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderVideoCard = (item: VideoItem) => {
    const isLiked = !!liked[item.id];
    return (
      <TouchableOpacity key={item.id} onPress={() => { setSelectedVideo(item); setVideoModalOpen(true); }} activeOpacity={0.8} style={styles.videoCardHalf}>
        <View style={styles.videoThumbWrap}>
          <Image source={{ uri: item.thumbnail }} style={styles.videoThumbHalf} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.videoPlayBtn}>
            <View style={styles.videoPlayCircle}>
              <Ionicons name="play" size={16} color="#4ade80" />
            </View>
          </View>
          {/* Like badge on video card */}
          <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.videoLikeBtn} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={16} color={isLiked ? "#4ade80" : "rgba(255,255,255,0.7)"} />
          </TouchableOpacity>
          <View style={styles.videoDurBadge}>
            <Text style={styles.videoDurText}>{item.duration}</Text>
          </View>
        </View>
        <View style={styles.videoCardInfo}>
          <Text style={styles.videoCardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.videoCatPill}>
            <Text style={styles.videoCatText}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require("../assets/images/home-bg.jpg")} style={styles.bg} resizeMode="cover">
        <LinearGradient colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.glowTop} />

        <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
          <View style={styles.tabBar}>
            {(["audio", "video"] as const).map((tab) => (
              <TouchableOpacity key={tab} style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
                <Ionicons name={tab === "audio" ? "headset" : "play-circle"} size={16} color={activeTab === tab ? "#fff" : "#999"} />
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab === "audio" ? "Audio" : "Videos"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "audio" && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScrollView}>
                {AUDIO_FILTERS.map((cat) => (
                  <TouchableOpacity key={cat} style={[styles.filterPill, audioFilter === cat && styles.filterPillActive]} onPress={() => setAudioFilter(cat)} activeOpacity={0.75}>
                    <Text style={[styles.filterText, audioFilter === cat && styles.filterTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {filteredAudio.map(renderAudioItem)}
            </>
          )}

          {activeTab === "video" && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScrollView}>
                {VIDEO_FILTERS.map((cat) => (
                  <TouchableOpacity key={cat} style={[styles.filterPill, videoFilter === cat && styles.filterPillActive]} onPress={() => setVideoFilter(cat)} activeOpacity={0.75}>
                    <Text style={[styles.filterText, videoFilter === cat && styles.filterTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.videoGrid}>
                {filteredVideo.map(renderVideoCard)}
              </View>
            </>
          )}
        </ScrollView>

        {currentTrack && (
          <Animated.View style={[styles.miniPlayer, {  transform: [{ translateY: miniPlayerAnim }] }]}>
            <View style={styles.miniPlayerInner}>
              <View style={styles.miniRow}>
                <TouchableOpacity onPress={() => setPlayerModalOpen(true)} style={styles.miniLeft}>
                  <Image source={{ uri: currentTrack.thumbnail }} style={styles.miniThumb} />
                  <View style={styles.miniInfo}>
                    <Text style={styles.miniTitle} numberOfLines={1}>{currentTrack.title}</Text>
                    <Text style={styles.miniArtist} numberOfLines={1}>{isPlaying ? "▶ Playing" : "⏸ Paused"}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.miniControls}>
                  <TouchableOpacity onPress={() => skipTrack("prev")} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                    <Ionicons name="play-skip-back" size={15} color="#999" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniPlayBtn} onPress={() => playTrack(currentTrack)}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#4ade80" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => skipTrack("next")} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                    <Ionicons name="play-skip-forward" size={15} color="#999" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={stopAudio} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                    <Ionicons name="close" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </ImageBackground>

      <Modal visible={playerModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPlayerModalOpen(false)}>
        <View style={styles.playerModal}>
          <LinearGradient colors={["#0d2718", "#091410"]} style={StyleSheet.absoluteFill} />
          <View style={styles.modalHandle} />
          <TouchableOpacity style={styles.modalClose} onPress={() => setPlayerModalOpen(false)}>
            <Ionicons name="chevron-down" size={26} color="#999" />
          </TouchableOpacity>
          {currentTrack && (
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.albumArtShadow}>
                <Image source={{ uri: currentTrack.thumbnail }} style={styles.albumArt} />
              </View>
              <View style={styles.modalTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{currentTrack.title}</Text>
                  <Text style={styles.modalArtist}>{currentTrack.artist}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleLike(currentTrack.id)}>
                  <Ionicons name={liked[currentTrack.id] ? "heart" : "heart-outline"} size={26} color={liked[currentTrack.id] ? "#f87171" : "rgba(255,255,255,0.35)"} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalProgressWrap}>
                <TouchableOpacity activeOpacity={1} onPress={(e) => { const ratio = e.nativeEvent.locationX / (width - 48); seekTo(Math.max(0, Math.min(1, ratio))); }} style={styles.modalProgressTrackWrap}>
                  <View style={styles.modalProgressTrack}>
                    <View style={[styles.modalProgressFill, { width: `${progress * 100}%` }]} />
                    <View style={[styles.modalProgressDot, { left: `${progress * 100}%` }]} />
                  </View>
                </TouchableOpacity>
                <View style={styles.modalTimeRow}>
                  <Text style={styles.modalTime}>{formatTime(currentTimeSec)}</Text>
                  <Text style={styles.modalTime}>{currentTrack.duration}</Text>
                </View>
              </View>
              <View style={styles.modalControls}>
                <TouchableOpacity onPress={() => skipTrack("prev")} hitSlop={{ top:12, bottom:12, left:12, right:12 }}>
                  <Ionicons name="play-skip-back" size={28} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalPlayBtn} onPress={() => playTrack(currentTrack)}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="#4ade80" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => skipTrack("next")} hitSlop={{ top:12, bottom:12, left:12, right:12 }}>
                  <Ionicons name="play-skip-forward" size={28} color="#999" />
                </TouchableOpacity>
              </View>
              <Text style={styles.queueLabel}>Up Next</Text>
              {AUDIO_DATA.filter((t) => t.id !== currentTrack.id).slice(0, 4).map((item) => (
                <TouchableOpacity key={item.id} onPress={() => playTrack(item)} style={styles.queueItem}>
                  <Image source={{ uri: item.thumbnail }} style={styles.queueThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.queueTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.queueSub}>{item.artist} · {item.duration}</Text>
                  </View>
                  <Ionicons name="play-circle-outline" size={22} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      <Modal visible={videoModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVideoModalOpen(false)}>
        <View style={styles.videoModal}>
          <LinearGradient colors={["#0d2718", "#091410"]} style={StyleSheet.absoluteFill} />
          <View style={styles.modalHandle} />
          <TouchableOpacity style={styles.modalClose} onPress={() => setVideoModalOpen(false)}>
            <Ionicons name="chevron-down" size={26} color="#999" />
          </TouchableOpacity>
          {selectedVideo && (
            <View style={{ paddingTop: 70 }}>
              <Text style={styles.videoModalTitle}>{selectedVideo.title}</Text>
              <View style={styles.videoPlayerWrap}>
                <YoutubePlayer height={187} play videoId={selectedVideo.id} />
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
  root:   { flex: 1, backgroundColor: "#050f09" },
  bg:     { flex: 1, height: "100%", width: "100%" },
  glowTop: { position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none" },
  screen: { flex: 1, paddingHorizontal: 20 },
  tabBar: { marginTop: 40, flexDirection: "row", backgroundColor: "rgba(0,26,17,0.53)", borderRadius: 50, marginBottom: 30, borderColor: "rgba(74,222,128,0.3)", borderWidth: 1 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 10, borderRadius: 50 },
  tabBtnActive: { backgroundColor: "#004927", shadowColor: "#004927", shadowOffset: { width:0, height:4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
  tabText: { color: "#999", fontSize: 14, fontFamily: "Poppins_400Regular" },
  tabTextActive: { color: "#fff" },
  filterScrollView: { flexGrow: 0, marginBottom: 15 },
  filterRow: { gap: 15, alignItems: "center", paddingVertical: 4, paddingHorizontal: 2 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(74,222,128,0.3)", backgroundColor: "rgba(0,26,17,0.53)" },
  filterPillActive: { backgroundColor: "#004927", borderColor: "rgba(74,222,128,0.5)" },
  filterText: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular" },
  filterTextActive: { color: "#fff", fontFamily: "Poppins_400Regular" },
  trackCard: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 12, marginBottom: 12, backgroundColor: "rgba(0, 26, 17, 0.50)", borderColor: "rgba(74,222,128,0.3)", borderWidth: 1 },
  trackCardActive: { borderColor: "rgba(74,222,128,0.7)", backgroundColor: "rgba(0,73,39,0.25)" },
  thumbWrap: { position: "relative" },
  trackThumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#111" },
  thumbOverlay: { position: "absolute", top:0, left:0, right:0, bottom:0, borderRadius: 12, backgroundColor: "rgba(0,0,0,0)", alignItems: "center", justifyContent: "center" },
  thumbOverlayActive: { backgroundColor: "rgba(0,0,0,0.45)" },
  waveBars: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 18 },
  waveBar:  { width: 3, borderRadius: 2, backgroundColor: "#4ade80" },
  trackInfo: { flex: 1, marginLeft: 12 },
  trackTitle: { fontSize: 12, color: "#fff", fontFamily: "Poppins_500Medium" },
  trackTitleActive: { color: "#4ade80" },
  trackArtist: { fontSize: 10, color: "#999", marginTop: 1, fontFamily: "Poppins_400Regular" },
  trackMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  catPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(0,73,39,0.4)" },
  catPillText: { fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: "#4ade80", fontFamily: "Poppins_400Regular" },
  trackDur: { fontSize: 10, color: "#999", fontFamily: "Poppins_400Regular" },
  likeBtn: { paddingLeft: 10 },
  miniPlayer: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopLeftRadius: 25, borderTopRightRadius: 25, borderTopWidth: 1,borderLeftWidth: 1,borderRightWidth: 1, borderColor: "rgba(74,222,128,0.3)", overflow: "hidden", height: 170 },
  miniPlayerInner: { backgroundColor: "rgba(0,26,17,0.95)", paddingHorizontal: 20, height: 170 },
  miniRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  miniLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  miniThumb: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#111" },
  miniInfo: { flex: 1 },
  miniTitle: { color: "#fff", fontSize: 12, fontFamily: "Poppins_500Medium" },
  miniArtist: { color: "#4ade80", fontSize: 10, marginTop: 2, fontFamily: "Poppins_400Regular" },
  miniControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  miniPlayBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#004927", alignItems: "center", justifyContent: "center", borderColor: "rgba(74,222,128,0.3)", borderWidth: 1 },
  videoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  videoCardHalf: { width: "48%", borderRadius: 12, overflow: "hidden",backgroundColor: "rgba(0, 26, 17, 0.50)", borderColor: "rgba(74,222,128,0.3)", borderWidth: 1, marginBottom: 14 },
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
  videoMetaRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginTop: 15, },
  videoMetaDur: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 7 },
  playerModal: { flex: 1, backgroundColor: "#0d2718" },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginTop: 12 },
  modalClose: { position: "absolute", top: 40, left: 15, zIndex: 10 },
  modalContent: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 40 },
  albumArtShadow: { shadowColor: "#000", shadowOffset: { width:0, height:20 }, shadowOpacity: 0.6, shadowRadius: 30, alignSelf: "center", marginBottom: 28 },
  albumArt: { width: width - 80, height: width - 80, borderRadius: 22, backgroundColor: "#111" },
  modalTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  modalTitle: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium", letterSpacing: -0.3 },
  modalArtist: { color: "#999", fontSize: 14, marginTop: 4, fontFamily: "Poppins_400Regular" },
  modalProgressWrap: { marginBottom: 28 },
  modalProgressTrackWrap: { paddingVertical: 12 },
  modalProgressTrack: { height: 4, backgroundColor: "rgba(74,222,128,0.2)", borderRadius: 2, position: "relative" },
  modalProgressFill: { position: "absolute", left:0, top:0, bottom:0, backgroundColor: "#4ade80", borderRadius: 2 },
  modalProgressDot: { position: "absolute", top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff", marginLeft: -8 },
  modalTimeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  modalTime: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular" },
  modalControls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, marginBottom: 32 },
  modalPlayBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#004927", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.25)", shadowColor: "#004927", shadowOffset: { width:0, height:8 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 8 },
  queueLabel: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12, fontFamily: "Poppins_500Medium" },
  queueItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  queueThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#111" },
  queueTitle: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
  queueSub: { color: "#999", fontSize: 10, marginTop: 2, fontFamily: "Poppins_400Regular" },
  videoModal: { flex: 1, backgroundColor: "#060e0a" },
  videoModalTitle: { color: "#fff", fontSize: 14, fontFamily: "Poppins_500Medium", paddingHorizontal: 20, marginBottom: 16, lineHeight: 22 },
  videoPlayerWrap: { overflow: "hidden", backgroundColor: "#000" },
});