import React, { useContext, useState } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types/types";
import { Text, View, TouchableOpacity, Modal, TextInput, StyleSheet, Image, Platform } from "react-native";
import Card from "@/src/components/Card";
import Animated, { FadeInUp } from "react-native-reanimated";
import { createStyles } from "@/src/components/PortfolioComponents/portfolioStyles";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "@/src/context/DataContext";
import { fetchPost } from "@/src/hooks/useFetch";
import { AuthContext } from "@/src/context/AuthContext";

interface OrderProps {
  data: {
    symbol: string;
    amount: number;
    threshold: number;
    user_id: string;
    id?: string;
    _id?: string;
    createdAt?: string;
  }[];
  theme: any;
  onDeleteOrder?: (orderId: string) => void;
}

type OrderEditData = {
  id: string;
  symbol: string;
  amount: number;
  threshold: number;
};

export default function Orders({ data, theme, onDeleteOrder }: OrderProps) {
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { marketData } = useData();
  const { user, setUser } = useContext(AuthContext);
  
  // State für das Edit-Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState<OrderEditData | null>(null);
  const [newAmount, setNewAmount] = useState("");
  const [newThreshold, setNewThreshold] = useState("");
  
  // Hilfsfunktion zum Finden der passenden Münze aus marketData
  const findCoinBySymbol = (symbol: string) => {
    if (!marketData || marketData.length === 0) return null;
    
    // Symbol normalisieren (zu Kleinbuchstaben)
    const normalizedSymbol = symbol.toLowerCase();
    
    // Suche nach übereinstimmendem Symbol in marketData
    return marketData.find(
      (coin) => 
        coin.symbol.toLowerCase() === normalizedSymbol ||
        coin.name.toLowerCase() === normalizedSymbol
    );
  };
  
  // Funktion zum Öffnen des Edit-Modals
  const handleEditPress = (item: any) => {
    const orderId = item.id || item._id;
    if (!orderId) return;
    
    setEditData({
      id: orderId,
      symbol: item.symbol,
      amount: item.amount,
      threshold: item.threshold
    });
    setNewAmount(Math.abs(item.amount).toString());
    setNewThreshold(item.threshold.toString());
    setModalVisible(true);
  };
  
  // Funktion zum Speichern der bearbeiteten Order angepasst an Backend-Route
  const handleSaveEdit = () => {
    if (!editData || !user?.token) return;
    
    // Berechne das korrekte Vorzeichen für die Menge (kaufen oder verkaufen)
    const amountWithSign = editData.amount > 0 
      ? parseFloat(newAmount) // kaufen: positiv
      : -parseFloat(newAmount); // verkaufen: negativ
      
    // Erstelle das Order-Objekt mit den korrekten Werten
    const orderData = {
      _id: editData.id,
      symbol: editData.symbol,
      amount: amountWithSign,
      threshold: parseFloat(newThreshold)
    };
    
    // Korrekter Endpunkt und Payload-Struktur
    fetchPost("trade/editorder", {
      token: user.token,
      order: orderData // Korrekte Struktur für das Backend
    })
      .then((updatedUser) => {
        if (updatedUser) {
          setUser(updatedUser);
          setModalVisible(false);
        } else {
          console.error("Unerwartete Antwort vom Server");
        }
      })
      .catch(err => console.error("Fehler beim Bearbeiten der Order:", err));
  };

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: theme.text, textAlign: "center", marginTop: 20 }}>
          Keine offenen Bestellungen vorhanden
        </Text>
      </View>
    );
  }

  return (
    <>
      <Animated.FlatList
        data={data}
        style={[styles.list, { width: '100%' }]}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        keyExtractor={(item, index) => item.id || item._id || `order-${index}`}
        renderItem={({ item, index }) => {
          const coinData = findCoinBySymbol(item.symbol);
          const orderId = item.id || item._id;
          
          return (
            <Animated.View 
              entering={FadeInUp.delay(index * 50)}
              style={{ width: '100%' }}
            >
              <Card
                onPress={() => {
                  // Navigiere zur Trade-Ansicht mit dem korrekten coin-Objekt
                  if (coinData) {
                    navigation.navigate("Trade", { coin: coinData });
                  } else {
                    console.warn(`Keine Münzdaten für Symbol ${item.symbol} gefunden`);
                  }
                }}
                style={{ 
                  ...styles.card, 
                  width: Platform.OS === "web" ? "100%" : "95%", // mobile width 95%
                  marginHorizontal: Platform.OS === "web" ? 0 : "auto" 
                }}
              >                
                <View style={{ flexDirection: 'row', width: '100%' }}>                
                  {coinData?.image && (
                    <View style={{ justifyContent: 'center', paddingRight: 10 }}>
                      <Image
                        source={{ uri: coinData.image }}
                        style={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: 25
                        }}
                      />
                    </View>
                  )}
                  
                  {/* Inhalt rechts */}
                  <View style={{ flex: 1 }}>
                    {/* Zeile 1: Symbol und Typ der Order */}
                    <View style={[styles.row, { width: '100%' }]}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={[styles.marketName, { marginRight: 8 }]}>
                          {item.symbol.toUpperCase()}
                        </Text>
                        <View 
                          style={{
                            backgroundColor: item.amount > 0 ? "green" : "red",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "bold" }}>
                            {item.amount > 0 ? "BUY" : "SELL"}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Aktions-Buttons (Bearbeiten und Löschen) */}
                      <View style={{ flexDirection: 'row' }}>
                        {/* Edit Button */}
                        <TouchableOpacity
                          onPress={() => handleEditPress(item)}
                          style={{ padding: 8 }}
                        >
                          <Ionicons name="create-outline" size={22} color={theme.accent} />
                        </TouchableOpacity>
                        
                        {/* Delete Button */}
                        {onDeleteOrder && orderId && (
                          <TouchableOpacity
                            onPress={() => onDeleteOrder(orderId)}
                            style={{ padding: 8 }}
                          >
                            <Ionicons name="close-circle" size={24} color={"red"}  />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    
                    {/* Zeile 2: Menge und Preisschwelle */}
                    <View style={styles.gridRow}>
                      <View style={{width: '50%'}}>
                        <Text style={{ color: theme.text }}>
                          <Text style={styles.labelText}>Menge:</Text>{" "}
                          <Text style={{ fontFamily: "monospace" }}>
                            {Math.abs(item.amount)}
                          </Text>
                        </Text>
                      </View>
                      <View style={{width: '50%'}}>
                        <Text style={{ color: theme.text, textAlign: 'right' }}>
                          <Text style={styles.labelText}>Limit:</Text>{" "}
                          <Text style={{ fontFamily: "monospace" }}>
                            {formatCurrency(item.threshold)}
                          </Text>
                        </Text>
                      </View>
                    </View>
                    
                    {/* Optionale Zeile 3: Aktuelle Marktdaten, falls verfügbar */}
                    {coinData && (
                      <View style={styles.gridRow}>
                        <View style={{width: '100%'}}>
                          <Text style={{ color: theme.text, fontSize: 12, textAlign: 'right' }}>
                            <Text style={{ color: 'grey' }}>Market: </Text>
                            <Text style={{ fontFamily: "monospace", color: theme.accent }}>
                              {formatCurrency(coinData.current_price)}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        }}
      />
      
      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={[modalStyles.modalView, { backgroundColor: theme.background }]}>
            <Text style={[modalStyles.modalTitle, { color: theme.text }]}>
              Order bearbeiten
            </Text>
            
            {editData && (
              <>
                <Text style={[modalStyles.orderInfo, { color: theme.text }]}>
                  {editData.symbol.toUpperCase()} • {editData.amount > 0 ? "KAUFEN" : "VERKAUFEN"}
                </Text>
                
                <View style={modalStyles.inputContainer}>
                  <Text style={[modalStyles.label, { color: theme.text }]}>Menge:</Text>
                  <TextInput
                    style={[modalStyles.input, { color: theme.text, borderColor: theme.text, fontFamily: "monospace" }]}
                    value={newAmount}
                    onChangeText={setNewAmount}
                    keyboardType="decimal-pad"
                    placeholder="Neue Menge"
                    placeholderTextColor="gray"
                  />
                </View>
                
                <View style={modalStyles.inputContainer}>
                  <Text style={[modalStyles.label, { color: theme.text }]}>Limit:</Text>
                  <TextInput
                    style={[modalStyles.input, { color: theme.text, borderColor: theme.text, fontFamily: "monospace" }]}
                    value={newThreshold}
                    onChangeText={setNewThreshold}
                    keyboardType="decimal-pad"
                    placeholder="Neues Preislimit"
                    placeholderTextColor="gray"
                  />
                </View>
                
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={modalStyles.buttonText}>Abbrechen</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[modalStyles.button, { backgroundColor: theme.accent }]}
                    onPress={handleSaveEdit}
                  >
                    <Text style={modalStyles.buttonText}>Speichern</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

// Modal-spezifische Styles
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 20,
    width: "80%",
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Android elevation
    elevation: 5,
    // Web box-shadow for React Native Web
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center"
  },
  orderInfo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    flex: 1,
    margin: 5
  },
  cancelButton: {
    backgroundColor: "#9e9e9e",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16
  }
});
