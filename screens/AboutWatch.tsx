import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.89;

export const SectionHeader = ({
  label,
  icon,
  color = "#4ade80",
}: any) => (
  <View style={sh.row}>
    <View style={[sh.bar, { backgroundColor: color }]} />
    <Ionicons name={icon} size={14} color={color} />
    <Text style={[sh.txt, { color }]}>{label}</Text>
  </View>
);

const sh = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 15,
  },
  bar: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  txt: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
});

const AboutWatch = ({ navigation }: any) => {
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {/* HERO */}
          <View style={styles.card}>
            <MaterialCommunityIcons
              name="watch-variant"
              size={70}
              color="#4ade80"
              style={{ alignSelf: "center", marginBottom: 15 }}
            />

            <Text style={styles.heading}>Smartwatch</Text>

            <Text style={styles.subtitle}>
              Pair a compatible smartwatch with Care Plus to automatically
              monitor your health, receive smarter wellness insights, and
              improve emergency support with real-time vitals.
            </Text>
          </View>

          {/* FEATURES */}

          <SectionHeader
            label="Watch Features"
            icon="watch-outline"
            color="#4ade80"
          />

          <View style={styles.cardF}>
            <FeatureRow
              icon="heart-outline"
              title="Heart Rate Monitoring"
              description="Track your heart rate continuously and receive alerts for unusual readings."
            />

            <FeatureRow
              icon="pulse-outline"
              title="Blood Oxygen (SpO₂)"
              description="Monitor oxygen saturation levels throughout the day."
            />

            <FeatureRow
              icon="thermometer-outline"
              title="Body Temperature"
              description="Detect temperature changes that may indicate illness."
            />

            <FeatureRow
              icon="walk-outline"
              title="Activity Tracking"
              description="Measure movement and activity to better understand your daily routine."
              isLast
            />
          </View>

          {/* HOW IT WORKS */}

          <SectionHeader
            label="How It Works"
            icon="git-network-outline"
            color="#4ade80"
          />

          <View style={styles.cardF}>
            <StepRow
              number="1"
              title="Enable Bluetooth"
              description="Turn on Bluetooth on your phone and make sure your smartwatch is nearby."
            />

            <StepRow
              number="2"
              title="Scan Devices"
              description="Open Connect Watch and scan for compatible smartwatches."
            />

            <StepRow
              number="3"
              title="Pair Your Watch"
              description="Select your smartwatch from the list and complete the pairing process."
            />

            <StepRow
              number="4"
              title="Start Tracking"
              description="Wear your watch comfortably while Care Plus syncs your health data automatically."
              isLast
            />
          </View>

          {/* PRIVACY */}

          <SectionHeader
            label="Privacy & Security"
            icon="shield-checkmark-outline"
            color="#4ade80"
          />

          <View style={styles.card}>
            <Text style={styles.text}>
              Your smartwatch data is encrypted and stored securely. Care Plus
              only uses this information to improve your wellness experience and
              provide better emergency assistance. You remain in complete
              control and can disable syncing or enable Privacy Mode whenever
              you like.
            </Text>
          </View>

          {/* BUTTON */}

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ConnectWatch")}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="watch-variant"
                size={18}
                color="#fff"
              />
              <Text style={styles.buttonText}>Connect Your Watch</Text>
            </View>
          </TouchableOpacity>

          {/* FOOTER */}

          <Text style={styles.footer}>
            Stay connected. Stay healthy. Stay protected.
          </Text>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const FeatureRow = ({ icon, title, description, isLast }: any) => (
  <View style={[styles.featureRow, !isLast && styles.rowDivider]}>
    <View style={styles.featureIconWrap}>
      <Ionicons name={icon} size={18} color="#4ade80" />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const StepRow = ({ number, title, description, isLast }: any) => (
  <View style={[styles.featureRow, !isLast && styles.rowDivider]}>
    <View style={styles.stepNumberWrap}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

export default AboutWatch;

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)",
    pointerEvents: "none",
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "flex-start",
  },

  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 25,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0,26,17,0.50)",
    marginBottom: 30,
  },

  cardF: {
    width: CARD_WIDTH,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0,26,17,0.50)",
    marginBottom: 30,
  },

  heading: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Poppins_500Medium",
  },

  subtitle: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
  },

  text: {
    fontSize: 12,
    color: "#aaa",
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(74,222,128,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  stepNumberWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(74,222,128,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  stepNumberText: {
    color: "#4ade80",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },

  featureTitle: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 5,
  },

  featureDescription: {
    color: "#aaa",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
  },

  button: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    paddingVertical: 12,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  footer: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    alignSelf: "center",
  },
});