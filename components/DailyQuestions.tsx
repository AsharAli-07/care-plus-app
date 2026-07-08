import React from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export type DailyQuestion = {
  text: string;
  options: string[]; // ordered worst -> best, used to score the check-in
};

type DailyQuestionsProps = {
  questions: DailyQuestion[];
  answers: (number | null)[]; // selected option index per question, null = unanswered
  animatedHeights: Animated.Value[];
  result: string | null;
  onToggleQuestion: (index: number) => void;
  onSelectOption: (questionIndex: number, optionIndex: number) => void;
  onGetResult: () => void;
};

export const DailyQuestions: React.FC<DailyQuestionsProps> = ({
  questions,
  answers,
  animatedHeights,
  result,
  onToggleQuestion,
  onSelectOption,
  onGetResult,
}) => {
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <View
     style={styles.healthCard}
    >
      <Text style={styles.progressText}>
        {answeredCount} / {questions.length} answered
      </Text>

      {questions.map((q, index) => {
        const height = animatedHeights[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 110], // room for options wrapping onto two lines
        });
        const selectedIndex = answers[index];

        return (
          <View
            key={index}
           style={styles.questionBox}
          >
            <TouchableOpacity onPress={() => onToggleQuestion(index)}>
              <Text style={styles.questionText}>{q.text}</Text>
            </TouchableOpacity>

            <Animated.View style={{ height, overflow: "hidden" }}>
              <View style={styles.optionsRow}>
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedIndex === optIndex;
                  return (
                    <TouchableOpacity
                      key={optIndex}
                      onPress={() => onSelectOption(index, optIndex)}
                      style={[
                        styles.chip,
                        isSelected && styles.selectedChip
                      ]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        );
      })}

      <TouchableOpacity
        style={[
          styles.resultBtn,
          {   backgroundColor: "#004927ff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",
  marginTop: 15,
   borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1,
       shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 6, },
        ]}
        onPress={onGetResult}
      >
        <Text style={styles.resultBtnText}>
          Get Mental Health Result
        </Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({

  questionText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 4,
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 8 },


  healthCard: {
  borderRadius: 25,
  padding: 15,
  marginBottom: 30,
  borderWidth: 1,
  borderColor: "rgba(74,222,128,0.3)",
  backgroundColor: "rgba(0, 26, 17, 0.53)",
  shadowColor: "#004927",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.55,
  shadowRadius: 14,
  elevation: 6,
},
progressText: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 15, fontFamily: "Poppins_400Regular", },
questionBox: {
   backgroundColor: "rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "rgba(74,222,128,0.20)",
},

chip: {
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
  backgroundColor: "rgba(255,255,255,0.04)",
},

selectedChip: {
  backgroundColor: "#004927",
  borderColor: "rgba(74,222,128,0.3)",
},

chipText: {
  color: "rgba(255,255,255,0.7)",
  fontSize: 11,
  fontFamily: "Poppins_400Regular",
},

selectedChipText: {
  color: "#fff",
  fontFamily: "Poppins_500Medium",
},

resultBtn: {
  backgroundColor: "#004927",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "100%",
  marginTop: 15,
  borderWidth: 1,
  borderColor: "rgba(74,222,128,0.3)",
  shadowColor: "#004927",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.55,
  shadowRadius: 14,
  elevation: 6,
},

resultBtnText: {
  color: "#fff",
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
},

resultBox: {
  marginTop: 12,
  backgroundColor: "rgba(74,222,128,0.08)",
  borderWidth: 1,
  borderColor: "rgba(74,222,128,0.20)",
  padding: 12,
  borderRadius: 12,
},

resultText: {
  color: "#fff",
  fontSize: 13,
  fontFamily: "Poppins_400Regular",
},
});