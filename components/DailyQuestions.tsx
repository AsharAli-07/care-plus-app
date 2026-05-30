import React from "react";
import { View, Text, TouchableOpacity, Animated, TextInput, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

type DailyQuestionsProps = {
  questions: string[];
  answers: string[];
  animatedHeights: Animated.Value[];
  result: string | null;
  onToggleQuestion: (index: number) => void;
  onUpdateAnswer: (text: string, index: number) => void;
  onGetResult: () => void;
};

export const DailyQuestions: React.FC<DailyQuestionsProps> = ({
  questions,
  answers,
  animatedHeights,
  result,
  onToggleQuestion,
  onUpdateAnswer,
  onGetResult,
}) => {
  return (
    <BlurView intensity={50} tint="prominent" style={styles.healthCard}>
      <Text style={styles.cardTitle}>Questions of the Day</Text>
      <Text style={styles.progressText}>
        {answers.filter((a) => a !== "").length} / {questions.length} answered
      </Text>

      {questions.map((q, index) => {
        const height = animatedHeights[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 55],
        });

        return (
          <BlurView intensity={10} tint="dark" key={index} style={styles.questionBox}>
            <TouchableOpacity onPress={() => onToggleQuestion(index)}>
              <Text style={styles.questionText}>{q}</Text>
            </TouchableOpacity>

            <Animated.View style={{ height, overflow: "hidden" }}>
              <TextInput
                placeholder="Answer"
                value={answers[index]}
                onChangeText={(text) => onUpdateAnswer(text, index)}
                style={styles.input}
              />
            </Animated.View>
          </BlurView>
        );
      })}

      <TouchableOpacity style={styles.resultBtn} onPress={onGetResult}>
        <Text style={styles.resultBtnText}>Get Mental Health Result</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  healthCard: { borderRadius: 12, padding: 15, marginBottom: 20 },
  cardTitle: { fontSize: 20, color: "#fff", fontFamily: "Poppins_500Medium", marginBottom: 15 },
  progressText: { color: "#ffffffff", fontSize: 12, marginBottom: 15, fontFamily: "Poppins_400Regular" },
  questionBox: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 10, marginBottom: 15 },
  questionText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 10, fontSize: 12, color: "#004927ff", marginTop: 15, fontFamily: "Poppins_400Regular" },
  resultBtn: { backgroundColor: "#004927ff", padding: 10, borderRadius: 12, alignItems: "center" },
  resultBtnText: { color: "#ffffffff", fontSize: 12, fontFamily: "Poppins_400Regular" },
  resultBox: { marginTop: 10, backgroundColor: "rgba(255,255,255,0.10)", padding: 10, borderRadius: 12 },
  resultText: { color: "#fff", fontSize: 13 },
});