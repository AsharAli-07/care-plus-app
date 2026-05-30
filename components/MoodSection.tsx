import React from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { BlurView } from 'expo-blur';
import { Ionicons } from "@expo/vector-icons";

type MoodSectionProps = {
  selected: boolean;
  selectedEmoji: string | null;
  textOpacity: Animated.Value;
  responseOpacity: Animated.Value;
  emojiOpacity: Animated.Value;
  startBtnOpacity: Animated.Value;
  onEmojiPress: (emoji: string) => void;
  onStartConversation: () => void;
};

export const MoodSection: React.FC<MoodSectionProps> = ({
  selected,
  selectedEmoji,
  textOpacity,
  responseOpacity,
  emojiOpacity,
  startBtnOpacity,
  onEmojiPress,
  onStartConversation,
}) => {
  return (
    <BlurView intensity={50} tint="prominent" style={styles.chatBox}>
      <View style={styles.textWrapper}>
        <Text style={styles.chatText}>Hello, Good Morning</Text>
        {!selected ? (
          <Animated.Text style={[styles.chatText, { opacity: textOpacity }]}>
            How are you feeling today?
          </Animated.Text>
        ) : (
          <Animated.Text style={[styles.chatText, { opacity: responseOpacity }]}>
            Thanks for your response {selectedEmoji}
          </Animated.Text>
        )}
      </View>

      {!selected && (
        <Animated.View style={[styles.emojiRow, { opacity: emojiOpacity }]}>
          {["😄", "🙂", "😐", "😕", "😔"].map((item, index) => (
            <TouchableOpacity key={index} onPress={() => onEmojiPress(item)} style={styles.emojiButton}>
              <Text style={styles.emoji}>{item}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {selected && (
        <Animated.View style={[styles.startBtn, { opacity: startBtnOpacity }]}>
          <TouchableOpacity onPress={onStartConversation} style={styles.startBtnInner}>
            <Text style={styles.startText}>Start a conversation</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  chatBox: { backgroundColor: "rgba(255, 255, 255, 0.10)", borderRadius: 12, marginBottom: 20, padding: 15 },
  textWrapper: { paddingBottom: 15 },
  chatText: { fontSize: 12, color: "#fff", fontFamily: "Poppins_400Regular", marginBottom: 5 },
  emojiRow: { flexDirection: "row", justifyContent: "space-between" },
  emojiButton: { alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 16, textAlign: "center" },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  startText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
  startBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: '100%' },
});