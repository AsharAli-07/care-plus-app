import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type VideoItem = {
  title: string;
  videoId: string;
  category?: string;
  duration?: string;
};

type MotivationalSuggestionsProps = {
  videos: VideoItem[];
  selectedVideo: string | null;
  videoOpacity: Animated.Value;
  videoTranslate: Animated.AnimatedInterpolation<string | number>;
  onOpenVideo: (id: string) => void;
  onCloseVideo: () => void;
};

export const MotivationalSuggestions: React.FC<MotivationalSuggestionsProps> = ({
  videos,
  selectedVideo,
  onOpenVideo,
}) => {
  return (
    <View style={{ marginBottom: 30 }}>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {videos.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => onOpenVideo(item.videoId)}
            style={styles.videoCard}
          >
            {/* Thumbnail */}
            <View style={styles.videoThumbWrap}>
              <Image
                source={{
                  uri: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
                }}
                style={styles.videoThumb}
              />
              {/* Gradient overlay — matches Peace page exactly */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={StyleSheet.absoluteFill}
              />
              {/* Play circle — matches Peace page exactly */}
              <View style={styles.videoPlayBtn}>
                <View style={[
                  styles.videoPlayCircle,
                  selectedVideo === item.videoId && styles.videoPlayCircleActive,
                ]}>
                  <Ionicons name="play" size={16} color="#4ade80" />
                </View>
              </View>
              {/* Duration badge — matches Peace page exactly */}
              {item.duration && (
                <View style={styles.videoDurBadge}>
                  <Text style={styles.videoDurText}>{item.duration}</Text>
                </View>
              )}
            </View>

            {/* Info block — matches Peace page exactly */}
            <View style={styles.videoCardInfo}>
              <Text style={styles.videoCardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.category && (
                <View style={styles.videoCatPill}>
                  <Text style={styles.videoCatText}>{item.category}</Text>
                </View>
              )}
            </View>

            {/* Active indicator dot */}
            {selectedVideo === item.videoId && (
              <View style={styles.activeDot} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 20,
    marginBottom: 15,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },
  scrollContent: {
    paddingRight: 4,
  },

  // Card — same width/radius pattern as Peace's videoCardHalf but sized for horizontal scroll
  videoCard: {
    width: 200,
    marginRight: 15,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(0, 26, 17, 0.53)",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
  },

  // Thumbnail block — identical to Peace page
  videoThumbWrap: {
    position: "relative",
  },
  videoThumb: {
    width: "100%",
    height: 110,
    resizeMode: "cover",
  },
  videoPlayBtn: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
  },
  videoPlayCircleActive: {
    backgroundColor: "rgba(0,73,39,1)",
    borderColor: "#4ade80",
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

  // Info block — identical to Peace page
  videoCardInfo: {
    padding: 10,
  },
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

  // Active dot
  activeDot: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
  },
});
