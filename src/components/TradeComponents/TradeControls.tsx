import React, { useState } from "react";
import { View, TextInput, StyleSheet, Dimensions, Platform } from "react-native";
import { useData } from "@/src/context/DataContext";
import Button from "@/src/components/Button";
import { useAlert } from "@/src/context/AlertContext";
import { createStyles } from "@/src/styles/style";
import { createTradeControlsStyles } from "@/src/components/TradeComponents/sharedstyles";
import Card from "@/src/components/Card";

interface TradeControlsProps {
  symbol: string;
  marketPrice: number | null;
  user: any;
  setUser: (user: any) => void;
  theme: any;
}

export default function TradeControls({ 
  symbol, 
  marketPrice, 
  user, 
  setUser, 
  theme 
}: TradeControlsProps) {
  // Zustände für Trade-Controls
  const [quantity, setQuantity] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [tradeType, setTradeType] = useState<"spot" | "order">("spot");
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { executeTrade } = useData();
  const { showAlert } = useAlert();
  const baseStyles = createStyles();
  const styles = createTradeControlsStyles(theme);
  
  // Responsive layout detection
  const windowWidth = Dimensions.get("window").width;
  const isMobile = windowWidth < 768;

  const handleMax = () => {
    if (user && symbol && user.positions && marketPrice) {
      const coinNormalized = symbol.toLowerCase().replace(/usdt$/, "");
      let maxAmount = 0;
      let found = false;
      
      Object.keys(user.positions).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/usdt$/, "");
        if (normalizedKey === coinNormalized) {
          maxAmount = user.positions[key];
          found = true;
        }
      });
      
      if (!found && marketPrice && user.cash) {
        maxAmount = (user.cash - 10) / marketPrice;
      }
      
      setQuantity(String(maxAmount));
    }
  };
  
  const handleTrade = async () => {
    if (!symbol || !user?.token) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Coin or user token missing"
      });
      return;
    }
    
    const quantityInput = parseFloat(quantity);
    if (isNaN(quantityInput) || quantityInput <= 0) {
      showAlert({
        type: "error",
        title: "Invalid Input",
        message: "Please enter a valid quantity"
      });
      return;
    }

    try {
      setIsLoading(true);
      // Verwende tradeAction, um das Vorzeichen zu bestimmen
      const amount = tradeAction === "sell" ? -Math.abs(quantityInput) : quantityInput;

      if (tradeType === "order") {
        const threshold = parseFloat(orderPrice);
        if (isNaN(threshold)) {
          showAlert({
            type: "error",
            title: "Invalid Price",
            message: "Please enter a valid order price"
          });
          return;
        }
        const orderPayload = {
          token: user.token,
          symbol,
          amount: amount,
          threshold: threshold,
        };
        const result = await executeTrade(orderPayload, "order");
        if (result) {
          setUser(result);
        }
        showAlert({
          type: "success",
          title: "Order Placed",
          message: `${tradeAction === "buy" ? "Buy" : "Sell"} order successfully placed!`
        });
      } else {
        const spotPayload = { symbol, value: amount };
        const result = await executeTrade(spotPayload, "spot");
        if (result) {
          setUser(result);
        }
        showAlert({
          type: "success",
          title: "Trade Executed",
          message: `${tradeAction === "buy" ? "Buy" : "Sell"} trade successfully executed!`
        });
      }

      setQuantity("");
      if (tradeType === "order") setOrderPrice("");
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unexpected error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{maxWidth: 1024, marginTop: 20}}>
      {/* <View style={styles.container}> */}
        {/* Handelstyp und Aktion Umschalter */}
        <View style={styles.header}>
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => setTradeType(tradeType === "spot" ? "order" : "spot")}
              title={tradeType === "spot" ? "Spot" : "Order"}
              type="outline"
              size="small"
              style={{ paddingVertical: 4, paddingHorizontal: 12 }}
            />
            <Button
              onPress={() => setTradeAction(tradeAction === "buy" ? "sell" : "buy")}
              title={tradeAction === "buy" ? "Sell" : "Buy"}
              type={tradeAction === "buy" ? "secondary" : "primary" }
              size="small"
              style={{ paddingVertical: 4, paddingHorizontal: 12 }}
            />
          </View>
        </View>

        {/* Eingabefelder und Handels-Button - Responsive Layout */}

        {/* mobile layout */}
        {isMobile ? (
          // Mobile Layout: Amount + Max in row 1, Price in row 2 (if order)
          <View>
            {/* Row 1: Amount + Max */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  baseStyles.input,
                  { flex: 1, padding: 8, fontFamily: "monospace", marginRight: 8 },
                ]}
                placeholder="Amount..."
                placeholderTextColor={baseStyles.defaultText?.color}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              
              <Button
                onPress={handleMax}
                title="Max"
                size="small"
                style={{ padding: 4, paddingHorizontal: 10, height: 30, margin: "auto" }}
                textStyle={{ fontSize: 12 }}
              />
            </View>
            
            {/* Row 2: Price (if order) */}
            {tradeType === "order" && (
              <View style={{ marginBottom: 12 }}>
                <TextInput
                  style={[
                    baseStyles.input,
                    { width: "100%", padding: 8, fontFamily: "monospace" },
                  ]}
                  placeholder="Price..."
                  placeholderTextColor={baseStyles.defaultText?.color}
                  value={orderPrice}
                  onChangeText={setOrderPrice}
                  keyboardType="numeric"
                />
              </View>
            )}
            
            {/* Trade Button */}
            <Button
              onPress={handleTrade}
              title={tradeAction === "buy" ? "Buy Now" : "Sell Now"}
              type={tradeAction === "buy" ? "primary" : "secondary"}
              size="medium"
              style={{ 
                paddingVertical: 8, 
                paddingHorizontal: 16,
                backgroundColor: tradeAction === "buy" ? theme.accent : "#F44336",
                width: "100%",
              }}
              loading={isLoading}
            />
          </View>
        ) : (
          // Desktop Layout: All in one row
          <View style={styles.controlsRow}>
            {!isMobile && Platform.OS === "web" ? (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TextInput
                  style={[
                    baseStyles.input,
                    { flex: 1, padding: 8, fontFamily: "monospace", maxWidth: 100, marginRight: 8 },
                  ]}
                  placeholder="Amount..."
                  placeholderTextColor={baseStyles.defaultText?.color}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
                <Button
                  onPress={handleMax}
                  title="Max"
                  size="small"
                  style={{ padding: 4, paddingHorizontal: 10, height: 35, marginRight: 8 }}
                  textStyle={{ fontSize: 12 }}
                />
                {tradeType === "order" && (
                  <TextInput
                    style={[
                      baseStyles.input,
                      { flex: 1, padding: 8, fontFamily: "monospace", marginRight: 8 },
                    ]}
                    placeholder="Price..."
                    placeholderTextColor={baseStyles.defaultText?.color}
                    value={orderPrice}
                    onChangeText={setOrderPrice}
                    keyboardType="numeric"
                  />
                )}
                <Button
                  onPress={handleTrade}
                  title={tradeAction === "buy" ? "Buy Now" : "Sell Now"}
                  type={tradeAction === "buy" ? "primary" : "secondary"}
                  size="medium"
                  style={{ paddingVertical: 8, paddingHorizontal: 16, minWidth: 120,
                           backgroundColor: tradeAction === "buy" ? theme.accent : "#F44336" }}
                  loading={isLoading}
                />
              </View>
            ) : (
              <View style={styles.controlsRow}>
                <View style={styles.controlsGroup}>
                  <TextInput
                    style={[
                      baseStyles.input,
                      { flex: 1, padding: 8, fontFamily: "monospace",maxWidth: 100 },
                    ]}
                    placeholder="Amount..."
                    placeholderTextColor={baseStyles.defaultText?.color}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                  
                  <Button
                    onPress={handleMax}
                    title="Max"
                    size="small"
                    style={{ padding: 4, paddingHorizontal: 10, height: 35 }}
                    textStyle={{ fontSize: 12 }}
                  />
                  
                  {tradeType === "order" && (
                    <TextInput
                      style={[
                        baseStyles.input,
                        { flex: 1, padding: 8, fontFamily: "monospace" },
                      ]}
                      placeholder="Price..."
                      placeholderTextColor={baseStyles.defaultText?.color}
                      value={orderPrice}
                      onChangeText={setOrderPrice}
                      keyboardType="numeric"
                    />
                  )}
                </View>
                
                <Button
                  onPress={handleTrade}
                  title={tradeAction === "buy" ? "Buy Now" : "Sell Now"}
                  type={tradeAction === "buy" ? "primary" : "secondary"}
                  size="medium"
                  style={{ 
                    paddingVertical: 8, 
                    paddingHorizontal: 16, 
                    minWidth: 120,
                    backgroundColor: tradeAction === "buy" ? theme.accent : "#F44336"
                  }}
                  loading={isLoading}
                />
              </View>
            )}
          </View>
        )}
      {/* </View> */}
    </View>
  );
}




