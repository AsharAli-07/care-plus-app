import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── ANIMATED WAVE BARS (identical to Peace page) ────────────────────────────
function WaveBars() {
  const anims = [
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
  ];

  useEffect(() => {
    const createAnim = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 10,
            duration: 400 + delay,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 2,
            duration: 400 + delay,
            useNativeDriver: false,
          }),
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

// ─── TYPES ────────────────────────────────────────────────────────────────────
type SleepItem = {
  thumbnail: string;
  title: string;
  audioUrl: string;
};

type SleepSuggestionsProps = {
  items: SleepItem[];
  currentAudioUrl?: string | null;  // audioUrl of the currently loaded track
  isPlaying?: boolean;              // whether audio is actively playing
  onSelectTrack: (track: SleepItem) => void;
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const SleepSuggestions: React.FC<SleepSuggestionsProps> = ({
  items,
  currentAudioUrl,
  isPlaying,
  onSelectTrack,
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionHeading}>Sleep Suggestions</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item, index) => {
          const isActive = currentAudioUrl === item.audioUrl;
          const showWave = isActive && isPlaying;

          return (
            <TouchableOpacity
              key={index}
              style={styles.carouselItem}
              activeOpacity={0.8}
              onPress={() => onSelectTrack(item)}
            >
              <View style={[styles.thumbWrap, isActive && styles.thumbWrapActive]}>
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.thumbnail}
                />

                {/* Dark overlay — deeper when active, matching Peace thumbOverlayActive */}
                <View
                  style={[
                    styles.thumbOverlay,
                    isActive && styles.thumbOverlayActive,
                  ]}
                />

                {/* Play button / Wave bars — identical logic to Peace renderAudioItem */}
                <View style={[styles.playBtn, isActive && styles.playBtnActive]}>
                  {showWave ? (
                    <WaveBars />
                  ) : (
                    <Ionicons
                      name={isActive ? "pause" : "play"}
                      size={16}
                      color="#4ade80"
                    />
                  )}
                </View>

                {/* Active green dot top-left */}
                {isActive && <View style={styles.activeDot} />}
              </View>

              <Text
                style={[styles.itemTitle, isActive && styles.itemTitleActive]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 20,
    marginBottom: 15,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },

  carouselItem: {
    width: 150,
    marginRight: 15,
  },

  thumbWrap: {
    position: "relative",
    width: "100%",
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
  },
  thumbWrapActive: {
    borderColor: "#4ade80",
  },

  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // Matches Peace: thumbOverlay / thumbOverlayActive
  thumbOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  thumbOverlayActive: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  // Play button — widens when showing wave bars
  playBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,73,39,0.85)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.4)",
  },
  playBtnActive: {
  position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,73,39,0.85)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.4)",
  },

  // Wave bars — identical to Peace WaveBars
  waveBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 10,
  },
  waveBar: {
    width: 2,
    borderRadius: 2,
    backgroundColor: "#4ade80",
  },

  // Active green dot
  activeDot: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
  },

  itemTitle: {
    textAlign: "center",
    marginTop: 8,
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  itemTitleActive: {
    color: "#4ade80",
  },
});
