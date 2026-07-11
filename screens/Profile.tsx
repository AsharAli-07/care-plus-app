import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

const Profile = ({ navigation }: any) => {
  const [privacyMode, setPrivacyMode] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD USER DATA
  // =========================
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setName(res.data.name);
      setPhone(res.data.phone_number);
      setEmail(res.data.email);
      setProfileImage(`${BASE_URL}/${res.data.profile_image}`);
      setPrivacyMode(res.data.privacy_mode);
    } catch (error) {
      console.log("LOAD USER ERROR:", error);
    }
  };

  // =========================
  // PICK IMAGE
  // =========================
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required");
      return;
    }

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ["images"], // was: ImagePicker.MediaTypeOptions.Images
  allowsEditing: true,
  aspect: [1, 1],
  quality: 1,
});

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // =========================
  // FORMAT PHONE (same pattern as Register)
  // =========================
  function formatDisplayPhone(text: string) {
    let cleaned = text.replace(/\D/g, "");

    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }

    if (cleaned.length > 4) {
      return cleaned.slice(0, 4) + " " + cleaned.slice(4);
    }

    return cleaned;
  }

  // =========================
  // UPDATE PROFILE
  // =========================
const updateProfile = async () => {
  setError("");

  if (!name.trim() || !email.trim() || !phone.trim()) {
    setError("Please fill all fields");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    setError("Please enter a valid email address");
    return;
  }

  if (phone.replace(/\D/g, "").length !== 11) {
    setError("Please enter a valid phone number");
    return;
  }

  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("phone_number", phone);

    // Only attach a new image if the user picked one that isn't already
    // a remote URL (i.e. it's a fresh local file from the picker)
    if (profileImage && !profileImage.startsWith("http")) {
      const filename = profileImage.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("profile_image", {
        uri: profileImage,
        name: filename,
        type,
      } as any);
    }

    await axios.put(`${BASE_URL}/update-profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    Alert.alert("Success", "Profile updated successfully");
    loadUser();
  } catch (err: any) {
    console.log("UPDATE ERROR:", err);
    setError(err?.response?.data?.message || "Something went wrong. Try again.");
  } finally {
    setLoading(false);
  }
};

  const mask = (value: string) => {
    return privacyMode ? "••••••••" : value;
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

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
          >
           

            {/* PROFILE CARD */}
            <View style={styles.card}>
              <Ionicons
  name="person-circle-outline"
  size={60}
  color="#4ade80"
  style={{ alignSelf: "center", marginBottom: 15 }}
/>

<Text style={styles.heading}>Edit Profile</Text>

<Text style={styles.subtitle}>
  Update your personal information, profile picture, and account details to keep your Care Plus profile up to date.
</Text>
              {/* PROFILE IMAGE */}
              <View style={styles.imageWrapper}>
<Image
  source={
    privacyMode
      ? require("../assets/images/profile.png")
      : profileImage
      ? { uri: profileImage }
      : require("../assets/images/profile.png")
  }
  style={styles.profileImage}
/>

                <TouchableOpacity style={styles.editImageBtn} onPress={pickImage}>
                  <Ionicons name="camera" size={18} color="#4ade80" />
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorWrap}>
                  <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* NAME */}
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={16} color="#999" />
                <TextInput
                  value={mask(name)}
                  onChangeText={(text) => {
                    setName(text);
                    if (error) setError("");
                  }}
                  placeholder="Enter name"
                  placeholderTextColor="#999"
                  style={styles.input}
                  editable={!privacyMode}
                  maxLength={50}
                />
              </View>

              {/* EMAIL */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={16} color="#999" />
                <TextInput
                  value={mask(email)}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError("");
                  }}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  style={styles.input}
                  selectTextOnFocus={false}
                  editable={!privacyMode}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={100}
                />
              </View>

              {/* PHONE */}
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={16} color="#999" />
                <TextInput
                  value={mask(phone)}
                  onChangeText={(text) => {
                    setPhone(formatDisplayPhone(text));
                    if (error) setError("");
                  }}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  style={styles.input}
                  editable={!privacyMode}
                  maxLength={12} // 11 digits + 1 formatting space
                />
              </View>

              {/* SAVE BUTTON */}
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={updateProfile}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default Profile;

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

    justifyContent: "center",
  },

  heading: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Poppins_500Medium",
  },
subtitle:{
     fontSize: 12,
    color: '#aaa',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
},
  card: {
    borderRadius: 25,
    padding: 20,
    marginTop: 20,
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    backgroundColor: "rgba(0, 26, 17, 0.50)",
  },

  imageWrapper: {
    alignSelf: "center",
    marginBottom: 30,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
  },

  editImageBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#004927ff",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
  },

  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(248,113,113,0.1)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.2)",
    marginBottom: 16,
    width: "100%",
  },

  errorText: {
    color: "#f87171",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },

  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    alignSelf: "flex-start",
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  button: {
    backgroundColor: "#004927ff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    borderColor: "rgba(74,222,128,0.3)",
    borderWidth: 1,
    marginTop: 5,
    paddingVertical: 12
  },

  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});