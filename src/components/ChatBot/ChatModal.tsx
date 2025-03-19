import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import CustomModal from "../CustomModal";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";



interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface NewsItem {
  guid: string;
  link: string;
  title: string;
  pubDate: string;
  description: string;
  content: string;
  enclosure?: { link: string };
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

// New LoadingDots component for the typing indicator
const LoadingDots = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animateDots = () => {
      // Reset values
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);

      // Sequence animations with delays
      Animated.stagger(200, [
        Animated.timing(dot1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat animation
        setTimeout(animateDots, 800);
      });
    };

    animateDots();
    return () => {
      // Cleanup animations
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.loadingContainer}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.loadingDot,
            {
              opacity: dot,
              transform: [
                {
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoaded, setNewsLoaded] = useState(false);

  // Lade Nachrichtendaten wenn die Komponente geladen wird
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "https://broke.dev-space.vip/marketData/news"
        );
        const data = await response.json();
        setNews(data.items);
        setNewsLoaded(true);
      } catch (error) {
        console.error("Fehler beim Laden der Nachrichten:", error);
        setNewsLoaded(true); // Trotzdem als geladen markieren
      }
    };
    fetchNews();
  }, []);

  //ohne useCallback
  const generateAIResponse = async (userPrompt: string): Promise<string> => {
    console.log("user", user);
    try {
      const response = await fetch("https://broke.dev-space.vip/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userPrompt, token: user.token }),
      });
      if (!response.ok) {
        const errorText = await response.text();

        console.error(`[POST] Error response (${response.status}):`, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

      if (setUser && user) {
        console.log(responseData.token);
        setUser({ ...user, token: responseData.token });
      }
      console.log(user);
      return responseData.message;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "Sorry, I couldn't process that request. Please try again later.";
    }
  };
  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const userPrompt = message;
    setMessage("");
    setIsLoading(true);

    // Generate AI response
    try {
      const aiResponse = await generateAIResponse(userPrompt);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error in AI response:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const { width } = Dimensions.get("window");
  const modalWidth =
    Platform.OS === "web" ? Math.min(600, width * 0.9) : width * 0.9;

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      width={modalWidth}
      showCloseButton={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: "white" }]}>
              Trading Assistant
            </Text>
            <Text style={[styles.subtitle, { color: "white" }]}>
              {newsLoaded ? "Mit aktuellen News-Daten" : "Lade News-Daten..."}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} >
            <Ionicons name="close-circle" size={36} color="red" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === "user"
                  ? [styles.userMessage, { backgroundColor: theme.accent }]
                  : [styles.botMessage, { backgroundColor: "transparent" }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: "#FFFFFF" },
                  { backgroundColor: "transparent" },
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          ListFooterComponent={() =>
            isLoading ? (
              <View
                style={[
                  styles.messageBubble,
                  styles.botMessage,
                  { backgroundColor: "transparent" },
                ]}
              >
                <LoadingDots />
              </View>
            ) : null
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inputContainer}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.accent,
              },
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.text}
            multiline={true}
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, { backgroundColor: theme.accent }]}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 450,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  botMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    backgroundColor: "transparent",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 3,
  },
});

export default ChatModal;
