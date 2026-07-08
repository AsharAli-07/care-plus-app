import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "expo-blur";
import { BASE_URL } from "../api";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
const { height } = Dimensions.get("window");

function getNotifIcon(title: string = ""): string {
  if (title.includes("Hydration") || title.includes("Water")) return "💧";
  if (title.includes("Sleep"))       return "🌙";
  if (title.includes("Mood"))        return "😊";
  if (title.includes("Meal"))        return "🍽️";
  if (title.includes("Meditation"))  return "🧘";
  if (title.includes("Journal"))     return "📔";
  if (title.includes("Motivation"))  return "✨";
  if (
    title.includes("Achievement") || title.includes("Streak") ||
    title.includes("Master")      || title.includes("Hero")   ||
    title.includes("Sleeper")     || title.includes("Zen")
  ) return "🏆";
  return "🔔";
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationOverlay — render this OUTSIDE the ScrollView in Home.tsx
// so it floats fixed over the entire screen and doesn't scroll with content.
// ─────────────────────────────────────────────────────────────────────────────
type OverlayProps = {
  visible: boolean;
  notifications: any[];
  onClose: () => void;
  onNotificationPress: (n: any) => void;
};

export const NotificationOverlay: React.FC<OverlayProps> = ({
  visible,
  notifications,
  onClose,
  onNotificationPress,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [mounted, setMounted] = useState(false);

  const unreadCount = notifications.filter((n) => n.read_status === 0).length;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      slideAnim.setValue(height);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 260,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    // Modal with transparent background sits above everything — including the
    // ScrollView — so it can never scroll with the page content.
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop — tap outside to close */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Animated panel */}
   <Animated.View
        style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}
      >
        <LinearGradient
          colors={["rgba(0,40,20,0.97)", "rgba(0,20,10,0.99)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.panelInner}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.panelHeader}>
            <Text style={styles.ntitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{unreadCount} new</Text>
              </View>
            )}
          </View>

          {/* List — scrolls independently inside the panel */}
          {notifications.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-off-outline" size={36} color="rgba(255,255,255,0.2)" />
              <Text style={styles.nempty}>No notifications yet</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
              // Critical: prevent this ScrollView's gestures from bubbling up
              keyboardShouldPersistTaps="handled"
            >
       
              {notifications.map((n) => {
                const isWellness =
                  n.title?.includes("Hydration") ||
                  n.title?.includes("Sleep") ||
                  n.title?.includes("Mood") ||
                  n.title?.includes("Meal");

                return (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => onNotificationPress(n)}
                    
                    style={[styles.ncard, n.read_status === 0 && styles.ncardUnread]}
                  >
                    <View style={styles.niconWrap}>
                      <Text style={styles.nicon}>{getNotifIcon(n.title)}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.ncardTitleRow}>
                        <Text style={styles.ncardTitle} numberOfLines={1}>
                          {n.title}
                        </Text>
                        {isWellness && (
                          <View style={styles.actionPill}>
                            <Text style={styles.actionPillText}>Log now</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardMsg} numberOfLines={2}>
                        {n.message}
                      </Text>
                    </View>

                    {n.read_status === 0 && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HeaderSection — the top bar + quote banner only.
// Stays inside the ScrollView in Home.tsx as before.
// ─────────────────────────────────────────────────────────────────────────────
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
  const [showQuote, setShowQuote] = useState<boolean>(false);
  const [quoteText, setQuoteText] = useState<string>("");

  const unreadCount = notifications.filter((n) => n.read_status === 0).length;

  const loadQuote = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(`${BASE_URL}/wellness/daily-quote`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data?.showQuote && res.data?.text) {
      setQuoteText(res.data.text);
      setShowQuote(true);
    } else {
      setShowQuote(false);
      setQuoteText("");
    }
  } catch {
    setShowQuote(false);
    setQuoteText("");
  }
};

  // ── Fetch daily quote on mount ────────────────────────────────────────────
 useFocusEffect(
  useCallback(() => {
    loadQuote();
  }, [])
);

  return (
    <>
      {/* Daily Quote Banner */}
{showQuote && quoteText ? (
  <View style={styles.topSection}>
    <Text style={styles.headerText}>Quote of the Day</Text>
    <Text style={styles.topText}>"{quoteText}"</Text>
  </View>
) : (
  <View style={styles.topSection} />
)}

      {/* Top Bar */}
      <View style={[styles.header, { top: 20 }]}>
        <TouchableOpacity
          style={styles.headericonbg}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleNotifications} style={styles.headericonbg}>
          <Ionicons name="notifications" size={22} color="#fff" />
          {hasUnread && !showDropdown && unreadCount > 0 && (
            <View style={styles.redDot}>
              {unreadCount > 1 && (
                <Text style={styles.redDotText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Header bar ──
  topSection: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 60,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    color: "#4ade80",
    fontFamily: "Poppins_500Medium",
    marginTop: 25
  },
  topText: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  header: {
    position: "absolute",
    right: 20,
    left: 20,
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  headericonbg: {
    backgroundColor: "#004927",
    padding: 8,
    borderRadius: 12,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    shadowColor: "#004927",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 6,
  },
  redDot: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#050f09",
  },
  redDotText: {
    color: "#fff",
    fontSize: 8,
    fontFamily: "Poppins_500Medium",
    lineHeight: 10,
  },

  // ── Overlay / Modal ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    
  },
  panel: {
    position: "absolute",
    top: 170,          // sits just below the header buttons
    left: 16,
    right: 16,
    height: "90%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.15)",
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  ntitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
  },
  countBadge: {
    backgroundColor: "rgba(74,222,128,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
  },
  countBadgeText: {
    color: "#4ade80",
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 10,
  },
  nempty: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  ncard: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  ncardUnread: {
    backgroundColor: "rgba(74,222,128,0.06)",
    borderColor: "rgba(74,222,128,0.15)",
  },
  niconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(0,73,39,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  nicon: { fontSize: 18 },
  ncardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  ncardTitle: {
    color: "#fff",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    flex: 1,
  },
  actionPill: {
    backgroundColor: "rgba(0,73,39,0.6)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
  },
  actionPillText: {
    color: "#4ade80",
    fontSize: 9,
    fontFamily: "Poppins_500Medium",
    letterSpacing: 0.5,
  },
  cardMsg: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    lineHeight: 17,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    marginLeft: 4,
    alignSelf: "center",
  },
  panelInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
});