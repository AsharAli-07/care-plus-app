// import React, { useState } from "react";
// import {
//   View, Text, StyleSheet, ImageBackground, StatusBar,
//   TouchableOpacity, ScrollView, Alert, ActivityIndicator,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import * as FileSystem from "expo-file-system/legacy";
// import * as Sharing from "expo-sharing";
// import { BASE_URL } from "../api";

// const CATEGORIES = [
//   { key: "wellness",     label: "Wellness Trend", icon: "pulse-outline" },
//   { key: "mood",         label: "Mood History",           icon: "happy-outline" },
//   { key: "vitals",       label: "Health Vitals", icon: "heart-outline" },
//   { key: "streaks",      label: "Wellness Streaks",       icon: "flame-outline" },
//   { key: "achievements", label: "Achievements",           icon: "trophy-outline" },
//   { key: "games",        label: "Brain Games Scores",     icon: "game-controller-outline" },
//   { key: "therapy",      label: "Therapy Sessions",       icon: "chatbubbles-outline" },
// ];

// export default function DownloadHealthData() {
//   const [selected, setSelected] = useState<string[]>(CATEGORIES.map((c) => c.key));
//   const [loading, setLoading] = useState<"download" | "email" | null>(null);

//   const toggle = (key: string) => {
//     setSelected((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   const selectAll = () => setSelected(CATEGORIES.map((c) => c.key));
//   const clearAll = () => setSelected([]);

//   const downloadPDF = async () => {
//     if (selected.length === 0) {
//       Alert.alert("Nothing selected", "Please select at least one data category.");
//       return;
//     }
//     setLoading("download");
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const res = await axios.post(
//         `${BASE_URL}/health-report/pdf-base64`,
//         { categories: selected },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const fileUri = FileSystem.documentDirectory + "care-plus-health-report.pdf";
//       await FileSystem.writeAsStringAsync(fileUri, res.data.base64, {
//         encoding: FileSystem.EncodingType.Base64,
//       });

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(fileUri, {
//           mimeType: "application/pdf",
//           dialogTitle: "Save or share your Care Plus health report",
//         });
//       } else {
//         Alert.alert("Saved", `Report saved to:\n${fileUri}`);
//       }
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Error", "Failed to generate report. Please try again.");
//     } finally {
//       setLoading(null);
//     }
//   };

//   const emailReport = async () => {
//     if (selected.length === 0) {
//       Alert.alert("Nothing selected", "Please select at least one data category.");
//       return;
//     }
//     setLoading("email");
//     try {
//       const token = await AsyncStorage.getItem("token");
//       await axios.post(
//         `${BASE_URL}/health-report/email`,
//         { categories: selected },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       Alert.alert("Sent", "Your health report has been emailed to you.");
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Error", "Failed to email report. Please try again.");
//     } finally {
//       setLoading(null);
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#050f09" }}>
//       <StatusBar barStyle="light-content" />
//       <ImageBackground
//         source={require("../assets/images/home-bg.jpg")}
//         style={{ height: "100%", width: "100%" }}
//         resizeMode="cover"
//       >
//         <LinearGradient
//           colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
//           style={StyleSheet.absoluteFill}
//         />
//         <View style={styles.glowTop} />

//         <ScrollView contentContainerStyle={styles.overlay} showsVerticalScrollIndicator={false}>
//           <Ionicons
//   name="download-outline"
//   size={60}
//   color="#4ade80"
//   style={{ alignSelf: "center", marginBottom: 15 }}
// />

// <Text style={styles.heading}>Download My Data</Text>

// <Text style={styles.subtitle}>
//   Download a copy of your health records, activity history, and account information for your personal records.
// </Text>
        

//           <View style={styles.selectRow}>
//             <TouchableOpacity onPress={selectAll}>
//               <Text style={styles.selectLink}>Select All</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={clearAll}>
//               <Text style={styles.selectLink}>Clear</Text>
//             </TouchableOpacity>
//           </View>

//           {CATEGORIES.map((cat) => {
//             const isChecked = selected.includes(cat.key);
//             return (
//               <TouchableOpacity
//                 key={cat.key}
//                 style={styles.itemRow}
//                 onPress={() => toggle(cat.key)}
//                 activeOpacity={1}
//               >
//                 <View style={styles.leftRow}>
//                   <Ionicons name={cat.icon as any} size={18} color="#fff" />
//                   <Text style={styles.itemText}>{cat.label}</Text>
//                 </View>
//                 <Ionicons
//                   name={isChecked ? "checkmark-circle" : "checkmark-circle-outline"}
//                   size={20}
//                   color={isChecked ? "#4ade80" : "#999"}
//                 />
//               </TouchableOpacity>
//             );
//           })}

//           <TouchableOpacity
//             style={[styles.actionBtn, styles.emailBtn]}
//             onPress={emailReport}
//             disabled={loading !== null}
//           >
//             {loading === "email" ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <>
//                 <Ionicons name="mail-outline" size={18} color="#fff" />
//                 <Text style={styles.emailBtnText}>Email Report to Me</Text>
//               </>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[ styles.downloadBtn]}
//             onPress={downloadPDF}
//             disabled={loading !== null}
//           >
//             {loading === "download" ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <>
//                 <Ionicons name="download-outline" size={18} color="#fff" />
//                 <Text style={styles.downloadBtnText}>Download PDF</Text>
//               </>
//             )}
//           </TouchableOpacity>

//           <View style={{ height: 40 }} />
//         </ScrollView>
//       </ImageBackground>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: { flexGrow: 1, padding: 20, paddingTop: 40 },
//   glowTop: {
//     position: "absolute", top: -80, left: -60,
//     width: 280, height: 280, borderRadius: 140,
//     backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
//   },
//   heading: {
//     fontSize: 20, color: "#fff", fontFamily: "Poppins_500Medium",
//     marginBottom: 5, alignSelf: "center",
//   },
//   subtitle:{
//      fontSize: 12,
//     color: '#999',
//     fontFamily: 'Poppins_400Regular',
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 22,
// },

//   selectRow: {
//     flexDirection: "row", justifyContent: "flex-end", gap: 16, marginBottom: 15,
//   },
//   selectLink: {
//     color: "#4ade80", fontSize: 12, fontFamily: "Poppins_400Regular", 
//   },
//   itemRow: {
//     flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//     borderRadius: 12, padding: 14, marginBottom: 15,
//     backgroundColor: "rgba(0, 26, 17, 0.53)",
//     borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,
//   },
//   leftRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
//   itemText: {
//     color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular", flexShrink: 1,
//   },
//   actionBtn: {
//     flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
//     padding: 10,
//     borderRadius: 12,
//     paddingVertical: 12,
//     width: "100%",
//     marginTop: 5,
//     borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,

//   },
//   emailBtn: { backgroundColor: "#004927" },
//   emailBtnText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
//   downloadBtn: {   flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,    marginTop: 20,},
//   downloadBtnText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
// });

import React, { useState } from "react";
import {
  View, Text, StyleSheet, ImageBackground, StatusBar,
  TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { BASE_URL } from "../api";

// Order matches PDF section order — most clinically important first.
const CATEGORIES = [
  { key: "vitals_latest", label: "Latest Vitals",          icon: "heart-outline" },
  { key: "wellness",      label: "Wellness Logs",          icon: "pulse-outline" },
  { key: "mood",          label: "Mood History",           icon: "happy-outline" },
  { key: "vitals_history",label: "Vitals History (Hourly)",icon: "stats-chart-outline" },
  { key: "streaks",       label: "Wellness Streaks",       icon: "flame-outline" },
  { key: "achievements",  label: "Achievements",           icon: "trophy-outline" },
  { key: "journal",       label: "Journal Entries",        icon: "book-outline" },
  { key: "therapy_chat",  label: "Therapy Chat Summary",   icon: "chatbubbles-outline" },
  { key: "games",         label: "Brain Games Scores",     icon: "game-controller-outline" },
];

export default function DownloadHealthData() {
  const [selected, setSelected] = useState<string[]>(CATEGORIES.map((c) => c.key));
  const [loading, setLoading] = useState<"download" | "email" | null>(null);

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => setSelected(CATEGORIES.map((c) => c.key));
  const clearAll = () => setSelected([]);

  const downloadPDF = async () => {
    if (selected.length === 0) {
      Alert.alert("Nothing selected", "Please select at least one data category.");
      return;
    }
    setLoading("download");
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/health-report/pdf-base64`,
        { categories: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fileUri = FileSystem.documentDirectory + "care-plus-health-report.pdf";
      await FileSystem.writeAsStringAsync(fileUri, res.data.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "Save or share your Care Plus health report",
        });
      } else {
        Alert.alert("Saved", `Report saved to:\n${fileUri}`);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to generate report. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const emailReport = async () => {
    if (selected.length === 0) {
      Alert.alert("Nothing selected", "Please select at least one data category.");
      return;
    }
    setLoading("email");
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/health-report/email`,
        { categories: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Sent", "Your health report has been emailed to you.");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to email report. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />

        <ScrollView contentContainerStyle={styles.overlay} showsVerticalScrollIndicator={false}>
          <Ionicons
            name="download-outline"
            size={60}
            color="#4ade80"
            style={{ alignSelf: "center", marginBottom: 15 }}
          />

          <Text style={styles.heading}>Download My Data</Text>

          <Text style={styles.subtitle}>
            Download a copy of your health records, activity history, and account information for your personal records.
          </Text>

          <View style={styles.selectRow}>
            <TouchableOpacity onPress={selectAll}>
              <Text style={styles.selectLink}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.selectLink}>Clear</Text>
            </TouchableOpacity>
          </View>

          {CATEGORIES.map((cat) => {
            const isChecked = selected.includes(cat.key);
            return (
              <TouchableOpacity
                key={cat.key}
                style={styles.itemRow}
                onPress={() => toggle(cat.key)}
                activeOpacity={1}
              >
                <View style={styles.leftRow}>
                  <Ionicons name={cat.icon as any} size={18} color="#fff" />
                  <Text style={styles.itemText}>{cat.label}</Text>
                </View>
                <Ionicons
                  name={isChecked ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={20}
                  color={isChecked ? "#4ade80" : "#999"}
                />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.actionBtn, styles.emailBtn]}
            onPress={emailReport}
            disabled={loading !== null}
          >
            {loading === "email" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="mail-outline" size={18} color="#fff" />
                <Text style={styles.emailBtnText}>Email Report to Me</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.downloadBtn]}
            onPress={downloadPDF}
            disabled={loading !== null}
          >
            {loading === "download" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.downloadBtnText}>Download PDF</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flexGrow: 1, padding: 20, paddingTop: 40 },
  glowTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
  },
  heading: {
    fontSize: 20, color: "#fff", fontFamily: "Poppins_500Medium",
    marginBottom: 5, alignSelf: "center",
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  selectRow: {
    flexDirection: "row", justifyContent: "flex-end", gap: 16, marginBottom: 15,
  },
  selectLink: {
    color: "#4ade80", fontSize: 12, fontFamily: "Poppins_400Regular",
  },
  itemRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderRadius: 12, padding: 14, marginBottom: 15,
    backgroundColor: "rgba(0, 26, 17, 0.53)",
    borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,
  },
  leftRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  itemText: {
    color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular", flexShrink: 1,
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 10,
    borderRadius: 12,
    paddingVertical: 12,
    width: "100%",
    marginTop: 5,
    borderColor: "rgba(74,222,128,0.3)", borderWidth: 1,
  },
  emailBtn: { backgroundColor: "#004927" },
  emailBtnText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
  downloadBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 },
  downloadBtnText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_400Regular" },
});