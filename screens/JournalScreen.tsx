import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BASE_URL } from "../api";

type JournalEntry = {
  id: number;
  entry_text: string;
  mood_emoji: string | null;
  created_at: string;
};

const MOODS = ["😄", "🙂", "😐", "😕", "😔"];

export default function JournalScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [entryText, setEntryText] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/journal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data || []);
    } catch (err) {
      console.log("Journal load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async () => {
    if (!entryText.trim()) {
      Alert.alert("Empty Entry", "Write something before saving.");
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/journal`,
        { entry_text: entryText.trim(), mood_emoji: selectedMood },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntryText("");
      setSelectedMood(null);
      await loadEntries();
    } catch (err) {
      console.log("Journal save error:", err);
      Alert.alert("Error", "Could not save your journal entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this journal entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(`${BASE_URL}/journal/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setEntries((prev) => prev.filter((e) => e.id !== id));
          } catch (err) {
            console.log("Journal delete error:", err);
          }
        },
      },
    ]);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.9)"]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 60,
          }}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Journal</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* New Entry Card */}
          <BlurView intensity={50} tint="dark" style={styles.card}>
            <Text style={styles.cardLabel}>Write your journal</Text>
            <Text style={styles.cardSubLabel}>Reflect on your day — what's on your mind?</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Today I felt..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              value={entryText}
              onChangeText={setEntryText}
              textAlignVertical="top"
            />

            <View style={styles.moodRow}>
              {MOODS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.moodBtn,
                    selectedMood === emoji && styles.moodBtnSelected,
                  ]}
                  onPress={() => setSelectedMood(selectedMood === emoji ? null : emoji)}
                >
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#050f09" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#050f09" />
                  <Text style={styles.saveBtnText}>Save Entry</Text>
                </>
              )}
            </TouchableOpacity>
          </BlurView>

          {/* Past Entries */}
          <Text style={styles.pastLabel}>Past Entries</Text>

          {loading ? (
            <ActivityIndicator color="#4ade80" style={{ marginTop: 20 }} />
          ) : entries.length === 0 ? (
            <Text style={styles.emptyText}>
              No journal entries yet. Write your first one above.
            </Text>
          ) : (
            entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.entryCard}
                  activeOpacity={0.85}
                  onPress={() => setExpandedId(isExpanded ? null : entry.id)}
                  onLongPress={() => handleDelete(entry.id)}
                >
                  <View style={styles.entryHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {entry.mood_emoji ? (
                        <Text style={{ fontSize: 16 }}>{entry.mood_emoji}</Text>
                      ) : null}
                      <Text style={styles.entryDate}>{formatDate(entry.created_at)}</Text>
                    </View>
                    <Text style={styles.entryTime}>{formatTime(entry.created_at)}</Text>
                  </View>
                  <Text
                    style={styles.entryText}
                    numberOfLines={isExpanded ? undefined : 2}
                  >
                    {entry.entry_text}
                  </Text>
                  {!isExpanded && entry.entry_text.length > 80 && (
                    <Text style={styles.readMore}>Tap to read more</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
    padding: 18,
    overflow: "hidden",
    marginBottom: 26,
  },
  cardLabel: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  cardSubLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
    marginBottom: 14,
  },
  textInput: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 18,
  },
  moodBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  moodBtnSelected: {
    backgroundColor: "rgba(74,222,128,0.15)",
    borderColor: "#4ade80",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4ade80",
    borderRadius: 14,
    paddingVertical: 14,
  },
  saveBtnText: {
    color: "#050f09",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  pastLabel: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 20,
  },
  entryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.15)",
    backgroundColor: "rgba(0,26,17,0.4)",
    padding: 14,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  entryDate: {
    color: "#4ade80",
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
  entryTime: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  entryText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
  },
  readMore: {
    color: "rgba(74,222,128,0.6)",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    marginTop: 6,
  },
});