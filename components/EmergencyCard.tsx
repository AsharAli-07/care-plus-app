import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function EmergencyCard({ contact }: any) {
  return (
    <View style={styles.card}>

      {/* NAME */}
      <Text style={styles.name}>
        👤  {contact?.name || "No Contact"}
      </Text>

      {/* PHONE */}
      <Text style={styles.text}>
        📞  {contact?.phone || "-"}
      </Text>

      {/* RELATIONSHIP */}
      {contact?.relationship ? (
        <Text style={styles.text}>
          {contact.relationship}
        </Text>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
     backgroundColor: "rgba(255,255,255,0.08)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15
  },

  name: {
    color: "#fff",
    fontSize: 12, // ✅ your system
    fontFamily: "Poppins_500Medium",
  },

  text: {
    color: "#ddd",
    fontSize: 12, // ✅ your system
    fontFamily: "Poppins_400Regular",
    marginTop: 5,
  },
});