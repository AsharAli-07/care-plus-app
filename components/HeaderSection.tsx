// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Animated,
//   Dimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { DrawerActions } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { BlurView } from "expo-blur";
// import { BASE_URL } from "../api";

// const { height } = Dimensions.get("window");

// // Notification categories that should navigate to WellnessTracker
// const WELLNESS_TITLES = [
//   "💧 Hydration Insight",
//   "🌙 Sleep Insight",
//   "😊 Mood Check",
//   "🍽 Meal Reminder",
// ];

// type HeaderSectionProps = {
//   navigation: any;
//   hasUnread: boolean;
//   showDropdown: boolean;
//   notifications: any[];
//   onToggleNotifications: () => void;
// };

// export const HeaderSection: React.FC<HeaderSectionProps> = ({
//   navigation,
//   hasUnread,
//   showDropdown,
//   notifications,
//   onToggleNotifications,
// }) => {
//   const [showQuote, setShowQuote] = useState<boolean>(false);
//   const [quoteText, setQuoteText] = useState<string>("");
//   const [localNotifications, setLocalNotifications] = useState<any[]>(notifications);
//   // Controls whether the dropdown is in the React tree at all.
//   // Stays true during the closing animation, then flips false once animation ends.
//   const [dropdownMounted, setDropdownMounted] = useState<boolean>(false);

//   const slideAnim = useRef(new Animated.Value(height)).current;

//   // ── Fetch daily quote on mount ──────────────────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         const res = await axios.get(`${BASE_URL}/wellness/daily-quote`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.data?.showQuote && res.data?.text) {
//           setQuoteText(res.data.text);
//           setShowQuote(true);
//         }
//       } catch (err) {
//         // Fallback quote so the section never stays empty
//         setQuoteText("Take care of your mind today 🧠");
//         setShowQuote(true);
//       }
//     })();
//   }, []);

//   // ── Sync incoming notifications ─────────────────────────────────────────────
//   useEffect(() => {
//     if (notifications.length === 0) {
//       setLocalNotifications([
//         {
//           id: "welcome-back",
//           title: "Welcome Back!",
//           message: "We're glad to see you again. Check out your daily wellness goals.",
//           read_status: 0,
//           type: "general",
//         },
//       ]);
//     } else {
//       setLocalNotifications(notifications);
//     }
//   }, [notifications]);

//   // ── Slide animation — mount before opening, unmount after closing ───────────
//   useEffect(() => {
//     if (showDropdown) {
//       setDropdownMounted(true);
//       slideAnim.setValue(height);
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//         tension: 70,
//         friction: 12,
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: height,
//         duration: 280,
//         useNativeDriver: true,
//       }).start(() => setDropdownMounted(false));
//     }
//   }, [showDropdown]);

//   // ── Tap a notification ──────────────────────────────────────────────────────
//   const handleNotificationPress = (notification: any) => {
//     onToggleNotifications(); // close dropdown
//     const isWellness = WELLNESS_TITLES.some((t) =>
//       notification.title?.includes(t.replace(/[^\w\s]/g, "").trim()) ||
//       notification.title === t
//     );
//     // Any hydration / sleep / mood / meal notification → WellnessTracker
//     if (
//       notification.title?.includes("Hydration") ||
//       notification.title?.includes("Sleep") ||
//       notification.title?.includes("Mood") ||
//       notification.title?.includes("Meal")
//     ) {
//       navigation.navigate("WellnessTracker");
//     }
//     // Achievements, motivation, journal, meditation → stay on Home / no nav
//   };

//   const unreadCount = localNotifications.filter((n) => n.read_status === 0).length;

//   return (
//     <>
//       {/* ── Daily Quote Banner ── */}
//       {showQuote && quoteText ? (
//         <View style={styles.topSection}>
//           <Text style={styles.headerText}>Quote of the Day</Text>
//           <Text style={styles.topText}>"{quoteText}"</Text>
//         </View>
//       ) : (
//         <View style={{ height: 65 }} />
//       )}

//       {/* ── Top Bar ── */}
//       <View style={[styles.header, { top: showQuote && quoteText ? 20 : 20 }]}>
//         <TouchableOpacity
//           style={styles.headericonbg}
//           onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
//         >
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={onToggleNotifications} style={styles.headericonbg}>
//           <Ionicons name="notifications" size={22} color="#fff" />
//           {hasUnread && !showDropdown && unreadCount > 0 && (
//             <View style={styles.redDot}>
//               {unreadCount > 1 && (
//                 <Text style={styles.redDotText}>
//                   {unreadCount > 9 ? "9+" : unreadCount}
//                 </Text>
//               )}
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* ── Backdrop ── */}
//       {showDropdown && (
//         <TouchableOpacity
//           activeOpacity={1}
//           style={styles.backdrop}
//           onPress={onToggleNotifications}
//         />
//       )}

//       {/* ── Animated Dropdown — only in tree while open or animating closed ── */}
//       {dropdownMounted && (
//       <Animated.View
//         style={[styles.dropdown, { transform: [{ translateY: slideAnim }] }]}
//       >
//         <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
//           <View style={styles.dropdownInner}>
//             {/* Header row */}
//             <View style={styles.dropdownHeader}>
//               <Text style={styles.ntitle}>Notifications</Text>
//               {unreadCount > 0 && (
//                 <View style={styles.countBadge}>
//                   <Text style={styles.countBadgeText}>{unreadCount} new</Text>
//                 </View>
//               )}
//             </View>

//             {localNotifications.length === 0 ? (
//               <View style={styles.emptyWrap}>
//                 <Ionicons name="notifications-off-outline" size={36} color="rgba(255,255,255,0.2)" />
//                 <Text style={styles.nempty}>No notifications yet</Text>
//               </View>
//             ) : (
//               <ScrollView
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={{ paddingBottom: 30 }}
//               >
//                 {localNotifications.map((n) => {
//                   const isWellness =
//                     n.title?.includes("Hydration") ||
//                     n.title?.includes("Sleep") ||
//                     n.title?.includes("Mood") ||
//                     n.title?.includes("Meal");

//                   return (
//                     <TouchableOpacity
//                       key={n.id}
//                       onPress={() => handleNotificationPress(n)}
//                       activeOpacity={0.75}
//                       style={[
//                         styles.ncard,
//                         n.read_status === 0 && styles.ncardUnread,
//                       ]}
//                     >
//                       {/* Icon */}
//                       <View style={styles.niconWrap}>
//                         <Text style={styles.nicon}>
//                           {getNotifIcon(n.title)}
//                         </Text>
//                       </View>

//                       <View style={{ flex: 1 }}>
//                         <View style={styles.ncardTitleRow}>
//                           <Text style={styles.ncardTitle} numberOfLines={1}>
//                             {n.title}
//                           </Text>
//                           {isWellness && (
//                             <View style={styles.actionPill}>
//                               <Text style={styles.actionPillText}>Log now</Text>
//                             </View>
//                           )}
//                         </View>
//                         <Text style={styles.cardMsg} numberOfLines={2}>
//                           {n.message}
//                         </Text>
//                       </View>

//                       {n.read_status === 0 && (
//                         <View style={styles.unreadDot} />
//                       )}
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>
//             )}
//           </View>
//         </BlurView>
//       </Animated.View>
//       )}
//     </>
//   );
// };

// // ── Helper: pick an emoji icon by notification title ────────────────────────
// function getNotifIcon(title: string = ""): string {
//   if (title.includes("Hydration") || title.includes("Water")) return "💧";
//   if (title.includes("Sleep"))      return "🌙";
//   if (title.includes("Mood"))       return "😊";
//   if (title.includes("Meal"))       return "🍽️";
//   if (title.includes("Meditation")) return "🧘";
//   if (title.includes("Journal"))    return "📔";
//   if (title.includes("Motivation")) return "✨";
//   if (title.includes("Achievement") || title.includes("Streak") ||
//       title.includes("Master") || title.includes("Hero") ||
//       title.includes("Sleeper") || title.includes("Zen")) return "🏆";
//   return "🔔";
// }

// const styles = StyleSheet.create({
//   topSection: {
//     alignItems: "center",
//     marginBottom: 20,
//     marginTop: 60,
//     paddingHorizontal: 20,
//   },
//   headerText: {
//     fontSize: 20,
//     color: "#fff",
//     fontFamily: "Poppins_500Medium",
//   },
//   topText: {
//     fontSize: 12,
//     color: "rgba(255,255,255,0.75)",
//     fontFamily: "Poppins_400Regular",
//     textAlign: "center",
//     marginTop: 4,
//     lineHeight: 18,
//   },
//   header: {
//     position: "absolute",
//     right: 20,
//     left: 20,
//     height: 45,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     zIndex: 10,
//     elevation: 10,
//   },
//   headericonbg: {
//     backgroundColor: "#004927",
//     padding: 8,
//     borderRadius: 12,
//     borderColor: "rgba(74,222,128,0.3)",
//     borderWidth: 1,
//     shadowColor: "#004927",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.55,
//     shadowRadius: 14,
//     elevation: 6,
//   },
//   redDot: {
//     position: "absolute",
//     top: -4,
//     right: -4,
//     minWidth: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: "#ef4444",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 3,
//     borderWidth: 1.5,
//     borderColor: "#050f09",
//   },
//   redDotText: {
//     color: "#fff",
//     fontSize: 8,
//     fontFamily: "Poppins_500Medium",
//     lineHeight: 10,
//   },
//   backdrop: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 998,
//   },
//   dropdown: {
//     position: "absolute",
//     top: 85,
//     left: 16,
//     right: 16,
//     height: "85%",
//     zIndex: 999,
//     borderRadius: 20,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "rgba(74,222,128,0.15)",
//   },
//   dropdownInner: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "rgba(0,30,15,0.35)",
//   },
//   dropdownHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 18,
//   },
//   ntitle: {
//     color: "#fff",
//     fontSize: 20,
//     fontFamily: "Poppins_500Medium",
//   },
//   countBadge: {
//     backgroundColor: "rgba(74,222,128,0.15)",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderWidth: 1,
//     borderColor: "rgba(74,222,128,0.3)",
//   },
//   countBadgeText: {
//     color: "#4ade80",
//     fontSize: 11,
//     fontFamily: "Poppins_500Medium",
//   },
//   emptyWrap: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingTop: 60,
//     gap: 10,
//   },
//   nempty: {
//     color: "rgba(255,255,255,0.35)",
//     fontSize: 14,
//     fontFamily: "Poppins_400Regular",
//   },
//   ncard: {
//     flexDirection: "row",
//     padding: 14,
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 14,
//     marginBottom: 10,
//     alignItems: "center",
//     gap: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.06)",
//   },
//   ncardUnread: {
//     backgroundColor: "rgba(74,222,128,0.06)",
//     borderColor: "rgba(74,222,128,0.15)",
//   },
//   niconWrap: {
//     width: 38,
//     height: 38,
//     borderRadius: 10,
//     backgroundColor: "rgba(0,73,39,0.5)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   nicon: {
//     fontSize: 18,
//   },
//   ncardTitleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 2,
//     flexWrap: "wrap",
//   },
//   ncardTitle: {
//     color: "#fff",
//     fontFamily: "Poppins_500Medium",
//     fontSize: 13,
//     flex: 1,
//   },
//   actionPill: {
//     backgroundColor: "rgba(0,73,39,0.6)",
//     borderRadius: 6,
//     paddingHorizontal: 7,
//     paddingVertical: 2,
//     borderWidth: 1,
//     borderColor: "rgba(74,222,128,0.25)",
//   },
//   actionPillText: {
//     color: "#4ade80",
//     fontSize: 9,
//     fontFamily: "Poppins_500Medium",
//     letterSpacing: 0.5,
//   },
//   cardMsg: {
//     color: "rgba(255,255,255,0.55)",
//     fontSize: 12,
//     fontFamily: "Poppins_400Regular",
//     lineHeight: 17,
//   },
//   unreadDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#4ade80",
//     marginLeft: 4,
//     alignSelf: "center",
//   },
// });


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
        // Stop touch events leaking to the backdrop behind the panel
      >
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

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
              contentContainerStyle={{ paddingBottom: 40 }}
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
                    activeOpacity={0.75}
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

  // ── Fetch daily quote on mount ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/wellness/daily-quote`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.showQuote && res.data?.text) {
          setQuoteText(res.data.text);
          setShowQuote(true);
        }
      } catch {
        setQuoteText("Take care of your mind today 🧠");
        setShowQuote(true);
      }
    })();
  }, []);

  return (
    <>
      {/* Daily Quote Banner */}
      {showQuote && quoteText ? (
        <View style={styles.topSection}>
          <Text style={styles.headerText}>Quote of the Day</Text>
          <Text style={styles.topText}>"{quoteText}"</Text>
        </View>
      ) : (
        <View style={{ height: 65 }} />
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
    marginBottom: 20,
    marginTop: 60,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
  },
  topText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  header: {
    position: "absolute",
    right: 20,
    left: 20,
    height: 45,
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
    
  },
  panel: {
    position: "absolute",
    top: 80,          // sits just below the header buttons
    left: 16,
    right: 16,
    height: "90%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.15)",
  },
  panelInner: {
    flex: 1,
    padding: 20,
    paddingTop: 12,
    backgroundColor: "rgba(0,20,10,0.4)",
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
    marginBottom: 18,
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
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
    gap: 12,
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
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
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
    color: "rgba(255,255,255,0.55)",
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
});