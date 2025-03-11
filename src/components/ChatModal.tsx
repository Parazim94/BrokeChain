import React, { useState, useEffect, useContext } from "react";
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { isLoggedIn } = useContext(AuthContext); // AuthContext verwenden
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && isLoggedIn) { // Nur laden wenn eingeloggt
      fetchNews();
    }
  }, [visible, isLoggedIn]);

  async function fetchNews() {
    if (!isLoggedIn) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      // URL ggf. anpassen - im Beispiel ein lokaler Endpunkt
      const response = await fetch("https://broke-end.vercel.app/news");
      if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error("Fehler beim Laden der Nachrichten:", error);
      setMessages([]); // Fallback: leere Nachrichtenliste
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: colors.text }]}>Nachrichten</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <Text style={{ color: colors.text }}>Lädt...</Text>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.messageContainer}>
                  <Text style={[styles.messageText, { color: colors.text }]}>
                    {item.message || "Keine Nachricht verfügbar"}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.text, textAlign: 'center', padding: 20 }}>
                  {isLoggedIn ? "Keine Nachrichten verfügbar" : "Bitte melden Sie sich an, um Nachrichten zu sehen"}
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messageContainer: {
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
  },
});

export default ChatModal;