import React, { useState, useCallback, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import CustomModal from "../CustomModal";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@env";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
          "https://broke-end.vercel.app/marketData/news"
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

  // Bereite Nachrichten für den Kontext vor
  const prepareNewsContext = useCallback(() => {
    if (!news || news.length === 0) return "";

    // Erstelle einen kurzen Überblick über die letzten 5 Nachrichten
    const recentNews = news.slice(0, 5);
    let newsContext = "Hier sind aktuelle Krypto-Nachrichten:\n\n";

    recentNews.forEach((item, index) => {
      newsContext += `${index + 1}. ${item.title}\n`;
      // Beschränke den Inhalt auf 100 Zeichen für einen kurzen Überblick
      const cleanContent =
        item.content.replace(/<[^>]+>/g, "").substring(0, 100) + "...";
      newsContext += `${cleanContent}\n\n`;
    });

    return newsContext;
  }, [news]);
  // Generate AI response using Google's Generative AI
  const generateAIResponse = useCallback(
    async (userPrompt: string): Promise<string> => {
      console.log("user", user);
      try {
        const response = await fetch("https://broke-end.vercel.app/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userPrompt, token: user.token }),
        });
        if (!response.ok) {
          const errorText = await response.text();

          console.error(
            `[POST] Error response (${response.status}):`,
            errorText
          );
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        // const newsContext = prepareNewsContext();
        // let fullPrompt = userPrompt;

        // // Füge Nachrichtenkontext hinzu, wenn Nachrichten verfügbar sind
        // if (newsContext) {
        //   fullPrompt = `Ich stelle dir eine Frage, aber bevor du antwortest, hier sind aktuelle Krypto-Nachrichten, die du in deine Antwort einbeziehen kannst, wenn relevant:\n\n${newsContext}\n\nMeine Frage ist: ${userPrompt}`;
        // }

        // const result = await model.generateContent(fullPrompt);
        const responseData = await response.json();

        if (setUser && user) {
          console.log(responseData.token);
          setUser({ ...user, token: responseData.token });
          // AsyncStorage.setItem("userToken", responseData.token);
        }
        console.log(user);
        return responseData.message;
      } catch (error) {
        console.error("Error generating AI response:", error);
        return "Sorry, I couldn't process that request. Please try again later.";
      }
    },
    [user, setUser]
  );

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
    Platform.OS === "web" ? Math.min(400, width * 0.9) : width * 0.9;

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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={"white"} />
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
});

export default ChatModal;
