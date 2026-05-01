import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3001/chat"
    : "http://localhost:3001/chat";

const Therapy = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi. What’s been on your mind today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "user",
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();
      console.log("SERVER RESPONSE:", data);

      if (!response.ok) {
        const errorMessage = data?.error || "Unknown error";
        const errorBotMessage: Message = {
          id: Date.now().toString() + "-error",
          text: `Error: ${errorMessage}`,
          sender: "bot",
        };
        setMessages((prev) => [...prev, errorBotMessage]);
        return;
      }

      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        text: data.reply || "I’m here with you.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log("FETCH ERROR:", error);

      const networkErrorMessage: Message = {
        id: Date.now().toString() + "-network-error",
        text: "Could not reach the backend server. Make sure it is running.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, networkErrorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.sender === "user" ? styles.user : styles.bot,
      ]}
    >
      <Text style={item.sender === "user" ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.overlay}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.chatContainer}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />

            <View style={styles.inputContainer}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Talk to your AI companion..."
                placeholderTextColor="#666"
                style={styles.input}
                editable={!loading}
                multiline
              />

              <TouchableOpacity
                onPress={sendMessage}
                style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default Therapy;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  chatContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  message: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: "80%",
  },
  user: {
    backgroundColor: "#045d33",
    alignSelf: "flex-end",
  },
  bot: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  userText: {
    color: "#fff",
    fontSize: 15,
  },
  botText: {
    color: "#000",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    bottom: 100
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minHeight: 48,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: "#045d33",
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginLeft: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.7,
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
  },
});