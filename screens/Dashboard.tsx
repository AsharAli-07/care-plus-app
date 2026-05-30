// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Animated,
//   TouchableOpacity
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { BASE_URL } from "../api";

// const Dashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState<any>(null);

//   // =========================
//   // MOOD SELECTION STATES
//   // =========================
//   const [localMoodEmoji, setLocalMoodEmoji] = useState<string | null>(null);
//   const [localMoodText, setLocalMoodText] = useState<string | null>(null);
  
//   // Animation value for the selector fade-in effect
//   const emojiOpacity = useRef(new Animated.Value(1)).current;

//   const loadDashboard = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");

//       const res = await axios.get(`${BASE_URL}/wellness-dashboard`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setData(res.data);
      
//       // Map initial background values if they already exist for today
//       if (res.data?.mood) {
//         setLocalMoodEmoji(res.data.mood.emoji);
//         setLocalMoodText(res.data.mood.text);
//       } else {
//         setLocalMoodEmoji(null);
//         setLocalMoodText(null);
//       }
//     } catch (err) {
//       console.log("Dashboard Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDashboard();
//   }, []);

//   // =========================
//   // HELPERS
//   // =========================
//   const score = data?.score || 0;

//   const getStatus = () => {
//     if (score >= 80) return "Excellent";
//     if (score >= 60) return "Good";
//     if (score >= 40) return "Average";
//     return "Needs Attention";
//   };

//   const streakCurrent = data?.streaks?.current || 0;
//   const streakLongest = data?.streaks?.longest || 0;

//   const recommendations = data?.recommendations || [];
//   const achievements = data?.achievements || [];

//   const handleEmojiPress = async (item: string) => {
//     // Map text labels instantly
//     const moodMap: Record<string, string> = {
//       "😄": "Happy",
//       "🙂": "Good",
//       "😐": "Neutral",
//       "😕": "Sad",
//       "😔": "Very Sad",
//     };

//     try {
//       // 1. Pessimistic UI Switch -> Set fields locally so selection row closes out cleanly
//       setLocalMoodEmoji(item);
//       setLocalMoodText(moodMap[item] || "Neutral");

//       const token = await AsyncStorage.getItem("token");

//       await axios.post(
//         `${BASE_URL}/mood`,
//         { mood_emoji: item },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//     } catch (err) {
//       console.log("Error saving mood updates:", err);
//       // Fallback reset on connection error
//       setLocalMoodEmoji(null);
//       setLocalMoodText(null);
//     }
//   };

//   // =========================
//   // LOADING RENDER
//   // =========================
//   if (loading) {
//     return (
//       <View style={styles.loading}>
//         <ActivityIndicator size="large" color="#8b5cf6" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
//       {/* HEADER CARD */}
//       <View style={styles.headerCard}>
//         <Text style={styles.title}>AI Wellness Dashboard</Text>
//         <Text style={styles.score}>{score}/100</Text>
//         <Text style={styles.status}>{getStatus()}</Text>

//         {/* ========================================================= */}
//         {/* CONDITIONAL RENDER: SHOW ACTIVE MOOD OR INTERACTIVE SELECTOR */}
//         {/* ========================================================= */}
//         {localMoodEmoji ? (
//           <View style={{ alignItems: "center" }}>
//             <Text style={styles.mood}>{localMoodEmoji}</Text>
//             <Text style={styles.moodText}>{localMoodText}</Text>
//           </View>
//         ) : (
//           <View style={{ alignItems: "center", marginTop: 15, width: "100%" }}>
//             <Text style={[styles.moodText, { marginBottom: 12, fontWeight: "600" }]}>
//               How are you feeling today?
//             </Text>
            
//             <Animated.View style={[styles.emojiRow, { opacity: emojiOpacity }]}>
//               {["😄", "🙂", "😐", "😕", "😔"].map((item, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => handleEmojiPress(item)}
//                   style={styles.emojiButton}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.emoji}>{item}</Text>
//                 </TouchableOpacity>
//               ))}
//             </Animated.View>
//           </View>
//         )}
//       </View>

//       {/* STREAKS */}
//       <View style={styles.row}>
//         <View style={styles.streakCard}>
//           <Text style={styles.cardEmoji}>🔥</Text>
//           <Text style={styles.number}>{streakCurrent}</Text>
//           <Text style={styles.label}>Current Streak</Text>
//         </View>

//         <View style={styles.streakCard}>
//           <Text style={styles.cardEmoji}>🏆</Text>
//           <Text style={styles.number}>{streakLongest}</Text>
//           <Text style={styles.label}>Longest Streak</Text>
//         </View>
//       </View>

//       {/* HEALTH METRICS */}
//       <View style={styles.grid}>
//         <Card title="Sleep" value={`${data?.sleep_hours || 0} hrs`} emoji="💤" />
//         <Card title="Water" value={`${data?.water_intake || 0} L`} emoji="💧" />
//         <Card title="Meals" value={`${data?.meals_count || 0}/3`} emoji="🍽" />
//         <Card title="Meditation" value={`${data?.meditation_minutes || 0} min`} emoji="🧘" />
//       </View>

//       {/* MENTAL HEALTH */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Mental Wellness</Text>
//         <Metric label="Stress Level" value={data?.stress_level || 0} />
//         <Metric label="Anxiety Level" value={data?.anxiety_level || 0} />
//         <Metric label="Energy Level" value={data?.energy_level || 0} />
//       </View>

//       {/* AI INSIGHTS */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>AI Insights</Text>
//         <View style={styles.cardBox}>
//           <Text style={styles.insight}>
//             • Your wellness score is {score}/100
//           </Text>
//           {(data?.sleep_hours || 0) < 7 && (
//             <Text style={styles.insight}>• Improve sleep quality</Text>
//           )}
//           {(data?.water_intake || 0) < 2 && (
//             <Text style={styles.insight}>• Increase water intake</Text>
//           )}
//           {(data?.stress_level || 0) > 6 && (
//             <Text style={styles.insight}>• High stress detected</Text>
//           )}
//           {(data?.energy_level || 0) < 5 && (
//             <Text style={styles.insight}>• Low energy levels</Text>
//           )}
//         </View>
//       </View>

//       {/* RECOMMENDATIONS */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Recommendations</Text>
//         {recommendations.length === 0 ? (
//           <View style={styles.cardBox}>
//             <Text style={styles.insight}>No recommendations</Text>
//           </View>
//         ) : (
//           recommendations.map((item: string, index: number) => (
//             <View key={index} style={styles.recCard}>
//               <Text style={styles.recText}>💡 {item}</Text>
//             </View>
//           ))
//         )}
//       </View>

//       {/* ACHIEVEMENTS */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Achievements</Text>
//         {achievements.length === 0 ? (
//           <View style={styles.cardBox}>
//             <Text style={styles.insight}>No achievements yet</Text>
//           </View>
//         ) : (
//           achievements.map((item: any, index: number) => (
//             <View key={index} style={styles.achCard}>
//               <Text style={styles.achTitle}>🏆 {item.title}</Text>
//               <Text style={styles.achDesc}>{item.description}</Text>
//             </View>
//           ))
//         )}
//       </View>

//       <View style={{ height: 40 }} />
//     </ScrollView>
//   );
// };

// // =========================
// // SMALL COMPONENTS
// // =========================
// const Card = ({ title, value, emoji }: any) => (
//   <View style={styles.card}>
//     <Text style={styles.cardEmoji}>{emoji}</Text>
//     <Text style={styles.cardTitle}>{title}</Text>
//     <Text style={styles.cardValue}>{value}</Text>
//   </View>
// );

// const Metric = ({ label, value }: any) => (
//   <View style={styles.metric}>
//     <Text style={styles.metricText}>{label}</Text>
//     <Text style={styles.metricValue}>{value}/10</Text>
//   </View>
// );

// // =========================
// // STYLES
// // =========================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0f172a",
//     padding: 16,
//   },
//   loading: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#0f172a",
//   },
//   headerCard: {
//     backgroundColor: "#7c3aed",
//     padding: 28,
//     borderRadius: 25,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   title: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "700",
//   },
//   score: {
//     color: "#fff",
//     fontSize: 50,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   status: {
//     color: "#ede9fe",
//     fontSize: 16,
//     marginTop: 5,
//     marginBottom: 5
//   },
//   mood: {
//     fontSize: 50,
//     marginTop: 10,
//   },
//   moodText: {
//     color: "#fff",
//     fontSize: 16,
//     marginTop: 5,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   streakCard: {
//     width: "48%",
//     backgroundColor: "#1e293b",
//     padding: 18,
//     borderRadius: 20,
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   emoji: { fontSize: 26 },
//   number: { fontSize: 26, color: "#fff", fontWeight: "bold" },
//   label: { color: "#94a3b8", marginTop: 5 },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   card: {
//     width: "48%",
//     backgroundColor: "#1e293b",
//     padding: 18,
//     borderRadius: 20,
//     marginBottom: 12,
//   },
//   cardEmoji: { fontSize: 24 },
//   cardTitle: { color: "#cbd5e1", marginTop: 8 },
//   cardValue: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   section: { marginTop: 20 },
//   sectionTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 10,
//   },
//   metric: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     backgroundColor: "#1e293b",
//     padding: 15,
//     borderRadius: 15,
//     marginBottom: 10,
//   },
//   metricText: { color: "#fff" },
//   metricValue: { color: "#8b5cf6", fontWeight: "bold" },
//   cardBox: {
//     backgroundColor: "#1e293b",
//     padding: 15,
//     borderRadius: 15,
//   },
//   insight: {
//     color: "#e2e8f0",
//     marginBottom: 8,
//   },
//   recCard: {
//     backgroundColor: "#1e293b",
//     padding: 15,
//     borderRadius: 15,
//     marginBottom: 10,
//   },
//   recText: { color: "#fff" },
//   achCard: {
//     backgroundColor: "#1e293b",
//     padding: 15,
//     borderRadius: 15,
//     marginBottom: 10,
//   },
//   achTitle: { color: "#fff", fontWeight: "bold" },
//   achDesc: { color: "#cbd5e1", marginTop: 5 },
//   emojiRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "90%",
//     backgroundColor: "rgba(255, 255, 255, 0.15)",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 20
//   },
//   emojiButton: {
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 4
//   },
// });

// export default Dashboard;



import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

const Dashboard = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // MOOD SELECTION STATES
  const [localMoodEmoji, setLocalMoodEmoji] = useState<string | null>(null);
  const [localMoodText, setLocalMoodText] = useState<string | null>(null);
  const emojiOpacity = useRef(new Animated.Value(1)).current;

  // Re-run the fetching engine automatically when the screen comes into active focus view
  useFocusEffect(
    useCallback(() => {
      const loadDashboard = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const res = await axios.get(`${BASE_URL}/wellness-dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setData(res.data);
          
          if (res.data?.mood) {
            setLocalMoodEmoji(res.data.mood.emoji);
            setLocalMoodText(res.data.mood.text);
          } else {
            setLocalMoodEmoji(null);
            setLocalMoodText(null);
          }
        } catch (err) {
          console.log("Dashboard Refresh System Error:", err);
        } finally {
          setLoading(false);
        }
      };

      loadDashboard();
    }, [])
  );

  const score = data?.score || 0;

  const getStatus = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Attention";
  };

  const streakCurrent = data?.streaks?.current || 0;
  const streakLongest = data?.streaks?.longest || 0;
  const recommendations = data?.recommendations || [];
  const achievements = data?.achievements || [];

  const handleEmojiPress = async (item: string) => {
    const moodMap: Record<string, string> = {
      "😄": "Happy",
      "🙂": "Good",
      "😐": "Neutral",
      "😕": "Sad",
      "😔": "Very Sad",
    };

    try {
      setLocalMoodEmoji(item);
      setLocalMoodText(moodMap[item] || "Neutral");

      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/mood`,
        { mood_emoji: item },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.log("Error saving mood updates:", err);
      setLocalMoodEmoji(null);
      setLocalMoodText(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <Text style={styles.title}>AI Wellness Dashboard</Text>
        <Text style={styles.score}>{score}/100</Text>
        <Text style={styles.status}>{getStatus()}</Text>

        {localMoodEmoji ? (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.mood}>{localMoodEmoji}</Text>
            <Text style={styles.moodText}>{localMoodText}</Text>
          </View>
        ) : (
          <View style={{ alignItems: "center", marginTop: 15, width: "100%" }}>
            <Text style={[styles.moodText, { marginBottom: 12, fontWeight: "600" }]}>
              How are you feeling today?
            </Text>
            
            <Animated.View style={[styles.emojiRow, { opacity: emojiOpacity }]}>
              {["😄", "🙂", "😐", "😕", "😔"].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleEmojiPress(item)}
                  style={styles.emojiButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emoji}>{item}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        )}
      </View>

      {/* QUICK ACCESS ACTION TRIGGER PANEL */}
      <TouchableOpacity 
        style={styles.actionShortcutBtn}
        onPress={() => navigation.navigate("WellnessTracker")}
      >
        <Text style={styles.actionShortcutText}>📝 Open Tracker Updates</Text>
      </TouchableOpacity>

      {/* STREAKS */}
      <View style={styles.row}>
        <View style={styles.streakCard}>
          <Text style={styles.cardEmoji}>🔥</Text>
          <Text style={styles.number}>{streakCurrent}</Text>
          <Text style={styles.label}>Current Streak</Text>
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.cardEmoji}>🏆</Text>
          <Text style={styles.number}>{streakLongest}</Text>
          <Text style={styles.label}>Longest Streak</Text>
        </View>
      </View>

      {/* HEALTH METRICS */}
      <View style={styles.grid}>
        <Card title="Sleep" value={`${data?.sleep_hours || 0} hrs`} emoji="💤" />
        <Card title="Water" value={`${data?.water_intake || 0} L`} emoji="💧" />
        <Card title="Meals" value={`${data?.meals_count || 0}/3`} emoji="🍽" />
        <Card title="Meditation" value={`${data?.meditation_minutes || 0} min`} emoji="🧘" />
      </View>

      {/* MENTAL HEALTH */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mental Wellness</Text>
        <Metric label="Stress Level" value={data?.stress_level || 0} />
        <Metric label="Anxiety Level" value={data?.anxiety_level || 0} />
        <Metric label="Energy Level" value={data?.energy_level || 0} />
      </View>

      {/* AI INSIGHTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.cardBox}>
          <Text style={styles.insight}>• Your wellness score is {score}/100</Text>
          {(data?.sleep_hours || 0) < 7 && <Text style={styles.insight}>• Improve sleep quality</Text>}
          {(data?.water_intake || 0) < 2 && <Text style={styles.insight}>• Increase water intake</Text>}
          {(data?.stress_level || 0) > 6 && <Text style={styles.insight}>• High stress detected</Text>}
          {(data?.energy_level || 0) < 5 && <Text style={styles.insight}>• Low energy levels</Text>}
        </View>
      </View>

      {/* RECOMMENDATIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {recommendations.length === 0 ? (
          <View style={styles.cardBox}>
            <Text style={styles.insight}>No recommendations available</Text>
          </View>
        ) : (
          recommendations.map((item: string, index: number) => (
            <View key={index} style={styles.recCard}>
              <Text style={styles.recText}>💡 {item}</Text>
            </View>
          ))
        )}
      </View>

      {/* ACHIEVEMENTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.length === 0 ? (
          <View style={styles.cardBox}>
            <Text style={styles.insight}>No achievements yet</Text>
          </View>
        ) : (
          achievements.map((item: any, index: number) => (
            <View key={index} style={styles.achCard}>
              <Text style={styles.achTitle}>🏆 {item.title}</Text>
              <Text style={styles.achDesc}>{item.description}</Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// COMPONENT BLOCK UI GENERATORS
const Card = ({ title, value, emoji }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardEmoji}>{emoji}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const Metric = ({ label, value }: any) => (
  <View style={styles.metric}>
    <Text style={styles.metricText}>{label}</Text>
    <Text style={styles.metricValue}>{value}/10</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
  headerCard: { backgroundColor: "#7c3aed", padding: 28, borderRadius: 25, alignItems: "center", marginBottom: 15 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  score: { color: "#fff", fontSize: 50, fontWeight: "bold", marginTop: 10 },
  status: { color: "#ede9fe", fontSize: 16, marginTop: 5, marginBottom: 5 },
  mood: { fontSize: 50, marginTop: 10 },
  moodText: { color: "#fff", fontSize: 16, marginTop: 5 },
  actionShortcutBtn: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3b82f6", padding: 15, borderRadius: 18, alignItems: "center", marginBottom: 20 },
  actionShortcutText: { color: "#3b82f6", fontWeight: "bold", fontSize: 15 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  streakCard: { width: "48%", backgroundColor: "#1e293b", padding: 18, borderRadius: 20, alignItems: "center", marginBottom: 15 },
  emoji: { fontSize: 26 },
  number: { fontSize: 26, color: "#fff", fontWeight: "bold" },
  label: { color: "#94a3b8", marginTop: 5 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", backgroundColor: "#1e293b", padding: 18, borderRadius: 20, marginBottom: 12 },
  cardEmoji: { fontSize: 24 },
  cardTitle: { color: "#cbd5e1", marginTop: 8 },
  cardValue: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  section: { marginTop: 20 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 10 },
  metric: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#1e293b", padding: 15, borderRadius: 15, marginBottom: 10 },
  metricText: { color: "#fff" },
  metricValue: { color: "#8b5cf6", fontWeight: "bold" },
  cardBox: { backgroundColor: "#1e293b", padding: 15, borderRadius: 15 },
  insight: { color: "#e2e8f0", marginBottom: 8 },
  recCard: { backgroundColor: "#1e293b", padding: 15, borderRadius: 15, marginBottom: 10 },
  recText: { color: "#fff" },
  achCard: { backgroundColor: "#1e293b", padding: 15, borderRadius: 15, marginBottom: 10 },
  achTitle: { color: "#fff", fontWeight: "bold" },
  achDesc: { color: "#cbd5e1", marginTop: 5 },
  emojiRow: { flexDirection: "row", justifyContent: "space-between", width: "90%", backgroundColor: "rgba(255, 255, 255, 0.15)", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20 },
  emojiButton: { alignItems: "center", justifyContent: "center", padding: 4 },
});

export default Dashboard;