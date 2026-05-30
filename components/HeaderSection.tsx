import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../api";

type HeaderSectionProps = {
  navigation: any;
  hasUnread: boolean;
  showDropdown: boolean;
  notifications: any[];
  onToggleNotifications: () => void;
};

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  navigation,
  hasUnread,
  showDropdown,
  notifications,
  onToggleNotifications,
}) => {
  // Self-Contained States for Quotes
  const [showQuote, setShowQuote] = useState<boolean>(false);
  const [quoteText, setQuoteText] = useState<string>("");

  // Re-run checking operation instantly when screen gains focused view context
  useFocusEffect(
    useCallback(() => {
      const fetchDailyQuote = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          
          // Matches your exact server routing structure configuration directly
          const res = await axios.get(`${BASE_URL}/wellness/daily-quote`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setShowQuote(res.data.showQuote);
          setQuoteText(res.data.text);
        } catch (err) {
          console.log("Error handling header quote request hook:", err);
          setShowQuote(false); // Hide module structural framework gracefully if disconnected
        }
      };

      fetchDailyQuote();
    }, [])
  );

  return (
    <>
      {/* Top Banner Quote Block */}
      {showQuote && quoteText ? (
        <View style={styles.topSection}>
          <Text style={styles.headerText}>Quote of the day</Text>
          <Text style={styles.topText}>"{quoteText}"</Text>
        </View>
      ) : (
        // Blank space padding adjustment variable to clear notch bounds when layout is hidden
        <View style={{ height: 65 }} />
      )}

      {/* Floating Header Action Controls — Dynamically alters offsets depending on banner state */}
      <View style={[styles.header, { top: showQuote && quoteText ? 20 : 20 }]}>
        <TouchableOpacity 
          style={styles.headericonbg}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleNotifications} style={styles.headericonbg}>
          <Ionicons name="notifications" size={22} color="#fff" />
          {hasUnread && <View style={styles.redDot} />}
        </TouchableOpacity>
      </View>

      {/* Notification Modal Drawer Dropdown — Shifts position cleanly to remain linked with buttons */}
      {showDropdown && (
        <View style={[styles.dropdown, { top: showQuote && quoteText ? 80 : 105 }]}>
          <Text style={styles.ntitle}>Notifications</Text>
          {notifications.length === 0 ? (
            <Text style={styles.nempty}>No notifications</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.map((n) => (
                <View key={n.id} style={styles.ncard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ncardTitle}>{n.title}</Text>
                    <Text style={styles.cardMsg}>{n.message}</Text>
                  </View>
                  {n.read_status === 0 && <View style={styles.unreadDot} />}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  topSection: { alignItems: "center", marginBottom: 20,marginTop: 50, paddingHorizontal: 20 },
  headerText: { fontSize: 24, color: "#fff", fontFamily: "Poppins_500Medium" },
  topText: { fontSize: 12, color: "#fff", fontFamily: "Poppins_400Regular", textAlign: "center", marginTop: 4 },
  header: { position: "absolute", right: 20, left: 20, height: 45, flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 10, elevation: 10 },
  headericonbg: { backgroundColor: "#004927ff", padding: 8, borderRadius: 12 },
  redDot: { position: "absolute", top: -2, right: -2, width: 9, height: 9, borderRadius: 5, backgroundColor: "red" },
  dropdown: { position: "absolute", height: "100%", width: "100%", backgroundColor: "rgba(0,0,0,0.85)", borderRadius: 12, padding: 20, zIndex: 999 },
  ntitle: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium", marginBottom: 10 },
  ncard: { flexDirection: "row", padding: 10, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 10, alignItems: "center" },
  ncardTitle: { color: "#fff", fontWeight: "bold" },
  cardMsg: { color: "#ccc", fontSize: 12, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "red", marginLeft: 10 },
  nempty: { color: "#aaa", textAlign: "center", padding: 10 },
});