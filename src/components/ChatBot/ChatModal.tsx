import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
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
import Card from "../Card";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setMessage("");

    // Simulate bot response (this will be replaced with your AI implementation)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm just a placeholder response. The real AI will be implemented later!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  const { width, height } = Dimensions.get("window");
  const isSmallScreen = width < 500;
  const modalWidth =
    Platform.OS === "web" ? Math.min(400, width * 0.9) : width * 0.9;
  const modalHeight =
    Platform.OS === "web" ? Math.min(500, height * 0.7) : height * 0.7;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={styles.modalOverlay}>
        <Card
          style={[
            styles.modalContainer,
            {
              width: modalWidth,
              height: modalHeight,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: theme.text }]}>
                Trading Assistant
              </Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>
                How can I help?
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
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
                    : [
                        styles.botMessage,
                        { backgroundColor: "transparent" },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: item.sender === "user" ? "#FFFFFF" : theme.text },
                    {backgroundColor: "transparent"}
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
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(5px)",
  },
  modalContainer: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
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
