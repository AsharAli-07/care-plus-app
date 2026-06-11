import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";

const ALL_GOALS = [
  { title: "7 Day Streak", desc: "Maintained wellness tracking for 7 days" },
  { title: "30 Day Master", desc: "Maintained wellness consistency for 30 days" },
  { title: "Hydration Hero", desc: "Drank 3L of water in one day" },
  { title: "Deep Sleeper", desc: "Achieved 8+ hours of sleep" },
  { title: "Zen Master", desc: "Completed 20 mins of meditation" },
];

export const InfoSections = ({ data }: any) => {
  const isEarned = (title: string) =>
    data?.achievements?.some(
      (a: any) => a.title?.trim() === title.trim()
    );

  const sortedGoals = [...ALL_GOALS].sort((a, b) => {
    const aEarned = isEarned(a.title);
    const bEarned = isEarned(b.title);
    return aEarned === bEarned ? 0 : aEarned ? -1 : 1;
  });

  return (
    <View style={styles.container}>
      {/* AI INSIGHTS */}
      <Text style={styles.sectionTitle}>AI Insights</Text>

      <BlurView intensity={50} tint="dark" style={styles.card}>
        <Text style={styles.text}>
          • Wellness Score: {data?.score || 0}/100
        </Text>

        {(data?.sleep_hours || 0) < 7 && (
          <Text style={styles.text}>
            • Improve sleep (aim 7h+ daily)
          </Text>
        )}

        {(data?.water_intake || 0) < 2 && (
          <Text style={styles.text}>
            • Increase water intake (2L+ recommended)
          </Text>
        )}
      </BlurView>

      {/* RECOMMENDATIONS */}
      <Text style={styles.sectionTitle}>Recommendations</Text>

      {data?.recommendations?.length > 0 ? (
        data.recommendations.map((item: string, index: number) => (
          <BlurView intensity={50} tint="dark" key={index} style={styles.card}>
            <Text style={styles.text}>💡  {item}</Text>
          </BlurView>
        ))
      ) : (
       <BlurView intensity={50} tint="dark" style={styles.card}>
          <Text style={styles.text}>
            Keep up the great work ✨
          </Text>
        </BlurView>
      )}

      {/* ACHIEVEMENTS */}
      <Text style={styles.sectionTitle}>Achievements</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sortedGoals.map((goal, index) => {
          const earned = isEarned(goal.title);

          return (
            <BlurView intensity={50} tint="dark"
              key={index}
              style={[
                styles.achCard,
                earned ? styles.achEarned : styles.achLocked,
              ]}
            >
              <Text style={styles.achEmoji}>
                {earned ? "🏆" : "🔒"}
              </Text>

              <Text style={styles.achTitle}>{goal.title}</Text>
              <Text style={styles.achDesc}>{goal.desc}</Text>
            </BlurView>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    marginBottom: 15,
    marginTop: 5

  },

  /* GLASS CARD STYLE (GLOBAL) */
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
        borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },

  text: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  /* ACHIEVEMENTS */
  achCard: {
    width: 130,
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
        borderColor: "rgba(74,222,128,0.3)",  borderWidth: 1
  },

  achEarned: {

    borderWidth: 1,
    borderColor: "#4ade80",
  },

  achLocked: {
    
  },

  achEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },

  achTitle: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },

  achDesc: {
    color: "#ffffffff",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
});