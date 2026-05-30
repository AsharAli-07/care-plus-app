import React from "react";
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import YoutubePlayer from "react-native-youtube-iframe";

type VideoItem = {
  title: string;
  videoId: string;
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
  videoOpacity,
  videoTranslate,
  onOpenVideo,
  onCloseVideo,
}) => {
  return (
    <View>
      <Text style={styles.sectionHeading}>Motivational Suggestion</Text>
      {videos.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => onOpenVideo(item.videoId)}>
          <BlurView intensity={50} tint="prominent" style={styles.videoCard}>
            <Image
              source={{ uri: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` }}
              style={styles.videoThumb}
            />
            <Text style={styles.videoTitle}>{item.title}</Text>
          </BlurView>
        </TouchableOpacity>
      ))}

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
          <YoutubePlayer key={selectedVideo} height={162} play={true} videoId={selectedVideo} />
          <TouchableOpacity onPress={onCloseVideo} style={styles.closeBtn}>
            <Text style={{ color: "#fff", fontFamily: "Poppins_400Regular" }}>✖ Close</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeading: { fontSize: 20, marginBottom: 20, color: "#fff", fontFamily: "Poppins_500Medium" },
  videoCard: { flexDirection: "row", borderRadius: 12, marginBottom: 15, alignItems: "center", elevation: 2 },
  videoThumb: { width: 70, height: 38, borderRadius: 7, marginRight: 10 },
  videoTitle: { fontSize: 12, color: "#ffffffff", flex: 1, fontFamily: "Poppins_400Regular" },
  playerBox: { borderRadius: 12, overflow: "hidden", backgroundColor: "#000", marginBottom: 20 },
  closeBtn: { padding: 10, alignItems: "center", backgroundColor: "rgba(255,255,255,0.10)" },
});