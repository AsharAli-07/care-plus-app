import React from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type CheckInSection = {
  text: string;              // question/label shown in the dropdown header
  height: number;            // expanded height for this section's content
  content: React.ReactNode;  // SleepInput / HydrationTracker / NutritionCheck etc.
};

type DailyQuestionsProps = {
  sections: CheckInSection[];
  openIndex: number | null;
  animatedHeights: Animated.Value[];
  saving: boolean;
  saved: boolean;
  onToggleSection: (index: number) => void;
  onSave: () => void;
};

export const DailyQuestions: React.FC<DailyQuestionsProps> = ({
  sections,
  openIndex,
  animatedHeights,
  saving,
  saved,
  onToggleSection,
  onSave,
}) => {
  return (
    <View style={styles.healthCard}>
      {sections.map((section, index) => {
        const height = animatedHeights[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, section.height],
        });
        const isOpen = openIndex === index;

        return (
          <View key={index} style={styles.questionBox}>
            <TouchableOpacity
              onPress={() => onToggleSection(index)}
              activeOpacity={0.7}
              style={styles.dropdownRow}
            >
              <Text style={styles.questionText}>{section.text}</Text>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>

            <Animated.View style={{ height, overflow: "hidden" }}>
              <View style={{ paddingTop: 10 }}>{section.content}</View>
            </Animated.View>
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.resultBtn, saving && { opacity: 0.7 }]}
        onPress={onSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.resultBtnText}>
            {saved ? "✅ Saved!" : "Save Body's Fulfillments"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  questionText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    flex: 1,
    paddingRight: 8,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  healthCard: {
    borderRadius: 25,
    padding: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
       backgroundColor: "rgba(0, 26, 17, 0.50)",
    shadowColor: "#004927",

  },
  questionBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.20)",
  },
  resultBtn: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,

  },
  resultBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});