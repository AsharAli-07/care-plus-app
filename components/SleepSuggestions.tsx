import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";

type SleepItem = {
  thumbnail: string;
  title: string;
  audioUrl: string;
};

type SleepSuggestionsProps = {
  items: SleepItem[];
  onSelectTrack: (track: SleepItem) => void;
};

export const SleepSuggestions: React.FC<SleepSuggestionsProps> = ({ items, onSelectTrack }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionHeading}>Sleep Suggestions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.carouselItem}
            onPress={() => onSelectTrack(item)}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <Text style={styles.itemTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeading: { fontSize: 20, marginBottom: 15, color: "#fff", fontFamily: "Poppins_500Medium" },
  carouselItem: { width: 250, marginRight: 10 },
  thumbnail: { width: "100%", height: 120, borderRadius: 12 },
  itemTitle: { textAlign: "center", marginTop: 5, color: "#fff" },
});