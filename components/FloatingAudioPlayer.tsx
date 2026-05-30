import React from "react";
import { View, Text, TouchableOpacity, Image, Modal, Animated, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type FloatingAudioPlayerProps = {
  currentAudio: string | null;
  currentItem: any;
  isPlaying: boolean;
  modalVisible: boolean;
  opacity: Animated.AnimatedInterpolation<string | number>;
  slideAnim: Animated.Value;
  spin: Animated.AnimatedInterpolation<string | number>;
  onSetModalVisible: (visible: boolean) => void;
  onPlayToggle: (url: string) => void;
  onForward: () => void;
  onBackward: () => void;
};

export const FloatingAudioPlayer: React.FC<FloatingAudioPlayerProps> = ({
  currentAudio,
  currentItem,
  isPlaying,
  modalVisible,
  opacity,
  slideAnim,
  spin,
  onSetModalVisible,
  onPlayToggle,
  onForward,
  onBackward,
}) => {
  if (!currentAudio) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.floatingPlayer,
          {
            transform: [{ translateY: slideAnim }, { rotate: spin }],
            opacity,
          },
        ]}
      >
        <BlurView intensity={50} tint="prominent" style={styles.cdBlur}>
          <TouchableOpacity style={styles.cdButton} onPress={() => onSetModalVisible(true)}>
            <Animated.Image
              source={require("../assets/images/cd.png")}
              style={[styles.cdImage, { transform: [{ rotate: spin }] }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <BlurView intensity={50} tint="prominent" style={styles.modalBox}>
          <Image source={{ uri: currentItem?.thumbnail }} style={styles.audioThumbnail} />
          <Text style={styles.nowPlaying}>{currentItem?.title || "Now Playing"}</Text>

          <View style={styles.playerControls}>
            <TouchableOpacity onPress={onBackward}>
              <Ionicons name="play-back" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onPlayToggle(currentAudio)}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onForward}>
              <Ionicons name="play-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => onSetModalVisible(false)} style={{ marginTop: "100%" }}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingPlayer: { position: "absolute", bottom: 80, right: 20 },
  cdBlur: { width: 60, height: 60, borderRadius: 40, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  cdButton: { justifyContent: "center", alignItems: "center" },
  cdImage: { width: 45, height: 45 },
  modalBox: { width: "100%", height: "100%", borderRadius: 12, padding: 20, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  audioThumbnail: { width: 150, height: 150, borderRadius: 100, marginBottom: 25 },
  nowPlaying: { color: "#fff", fontSize: 20, marginBottom: 20, fontFamily: "Poppins_500Medium" },
  playerControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "75%" },
  backText: { fontSize: 12, color: "#fff", fontFamily: "Poppins_400Regular" },
});