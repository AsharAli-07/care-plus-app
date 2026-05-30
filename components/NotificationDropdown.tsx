import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

type NotificationDropdownProps = {
  notifications: any[];
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications }) => {
  return (
    <View style={styles.dropdown}>
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
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: 80,
    height: '100%',
    width: '100%',
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 12,
    padding: 20,
    zIndex: 999,
  },
  ntitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 10,
  },
  ncard: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  ncardTitle: { color: "#fff", fontWeight: "bold" },
  cardMsg: { color: "#ccc", fontSize: 12, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    marginLeft: 10,
  },
  nempty: { color: "#aaa", textAlign: "center", padding: 10 },
});