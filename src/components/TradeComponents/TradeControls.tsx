import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useData } from "@/src/context/DataContext";
import Button from "@/src/components/UiComponents/Button";
import { useAlert } from "@/src/context/AlertContext";
import { createStyles } from "@/src/styles/style";
import { createTradeControlsStyles } from "@/src/components/TradeComponents/sharedstyles";
import Card from "@/src/components/UiComponents/Card";

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
  theme,
}: TradeControlsProps) {
  const [quantity, setQuantity] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [tradeType, setTradeType] = useState<"spot" | "order">("spot");
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const { executeTrade } = useData();
  const { showAlert } = useAlert();
  const baseStyles = createStyles();
  const styles = createTradeControlsStyles(theme);

  const windowWidth = Dimensions.get("window").width;
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const amount = parseFloat(quantity);
    const price =
      tradeType === "order"
        ? parseFloat(orderPrice) || marketPrice || 0
        : marketPrice || 0;

    if (!isNaN(amount) && !isNaN(price) && amount > 0 && price > 0) {
      setEstimatedCost(amount * price);
    } else {
      setEstimatedCost(null);
    }
  }, [quantity, orderPrice, marketPrice, tradeType]);

  const handleMax = () => {
    if (user && symbol && marketPrice) {
      const coinNormalized = symbol.toLowerCase().replace(/usdt$/, "");
      let maxAmount = 0;
      let found = false;

      if (tradeAction === "sell" && user.positions) {
        Object.keys(user.positions).forEach((key) => {
          const normalizedKey = key.toLowerCase().replace(/usdt$/, "");
          if (normalizedKey === coinNormalized) {
            maxAmount = user.positions[key];
            found = true;
          }
        });

        if (!found) {
          showAlert({
            type: "warning",
            title: "No Position",
            message: `You don't own any ${symbol} to sell.`,
          });
          return;
        }
      } else if (user.cash && marketPrice) {
        const price =
          tradeType === "order" && orderPrice
            ? parseFloat(orderPrice)
            : marketPrice;
        maxAmount = (user.cash * 0.95) / price;
        maxAmount = Math.floor(maxAmount * 10000000) / 10000000;
      }

      setQuantity(String(maxAmount));
    }
  };

  const handleTrade = async () => {
    if (!symbol || !user?.token) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Coin or user token missing",
      });
      return;
    }

    const quantityInput = parseFloat(quantity);
    if (isNaN(quantityInput) || quantityInput <= 0) {
      showAlert({
        type: "error",
        title: "Invalid Input",
        message: "Please enter a valid quantity",
      });
      return;
    }

    try {
      setIsLoading(true);
      const amount =
        tradeAction === "sell" ? -Math.abs(quantityInput) : quantityInput;

      if (tradeType === "order") {
        const threshold = parseFloat(orderPrice);
        if (isNaN(threshold)) {
          showAlert({
            type: "error",
            title: "Invalid Price",
            message: "Please enter a valid order price",
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
          message: `${
            tradeAction === "buy" ? "Buy" : "Sell"
          } order successfully placed!`,
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
          message: `${
            tradeAction === "buy" ? "Buy" : "Sell"
          } trade successfully executed!`,
        });
      }

      setQuantity("");
      if (tradeType === "order") setOrderPrice("");
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTradeDescription = () => {
    if (tradeType === "spot") {
      return "Execute trade immediately at current market price.";
    } else {
      return "Place order to execute at specified price.";
    }
  };

  // Optimierte Toggle-Komponente mit verbesserter Reaktionsfähigkeit
  const Toggle = ({
    options,
    value,
    onChange,
    colors = { active: theme.accent, inactive: "transparent" },
  }: {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    colors?: { active: string; inactive: string };
  }) => {
    return (
      <View style={styles.toggleContainer}>
        {options.map((option) => {
          const isActive = option === value;

          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.7}
              style={[
                styles.toggleButton,
                isActive && styles.toggleButtonActive,
                isActive && { backgroundColor: colors.active },
              ]}
              onPress={() => onChange(option)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  isActive && styles.toggleButtonTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Handler für Toggle-Buttons direkt implementieren
  const handleTradeTypeToggle = (val: string) => {
    setTradeType(val === "Spot" ? "spot" : "order");
  };

  const handleTradeActionToggle = (val: string) => {
    setTradeAction(val === "Buy" ? "buy" : "sell");
  };

  return (
    <View
      style={{
        width: "100%",
        maxWidth: 800,
        marginTop: 16,
        marginHorizontal: "auto",
      }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Toggle
              options={["Spot", "Order"]}
              value={tradeType === "spot" ? "Spot" : "Order"}
              onChange={handleTradeTypeToggle}
            />

            <Toggle
              options={["Buy", "Sell"]}
              value={tradeAction === "buy" ? "Buy" : "Sell"}
              onChange={handleTradeActionToggle}
              colors={{
                active: tradeAction === "buy" ? theme.accent : "#F44336",
                inactive: "transparent",
              }}
            />
          </View>
        </View>

        <View style={[styles.tradeInfoBox, { padding: 8, marginBottom: 12 }]}>
          <Text style={styles.helpText}>{getTradeDescription()}</Text>
          {marketPrice && (
            <Text style={styles.helpText}>
              Current price:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {marketPrice.toFixed(4)} USDT
              </Text>
            </Text>
          )}
          {estimatedCost !== null && (
            <Text
              style={[
                styles.helpText,
                {
                  marginTop: 4,
                  fontWeight: "500",
                  color: tradeAction === "buy" ? theme.accent : "#F44336",
                },
              ]}
            >
              Total:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {estimatedCost.toFixed(4)} USDT
              </Text>
            </Text>
          )}
        </View>

        {isMobile ? (
          <View style={{ width: "100%" }}>
            <View style={[styles.inputWrapper, { marginBottom: 8 }]}>
              <View style={[styles.inputContainer, { marginBottom: 8 }]}>
                <TextInput
                  style={[
                    baseStyles.input,
                    {
                      flex: 1,
                      padding: 6,
                      fontFamily: "monospace",
                      marginRight: 6,
                      maxWidth: 100,
                    },
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
                  style={{ padding: 2, paddingHorizontal: 8, height: 30, marginRight: 8 }}
                  textStyle={{ fontSize: 12 }}
                />
              </View>
            </View>

            {tradeType === "order" && (
              <View style={[styles.inputWrapper, { marginBottom: 8, }]}>
                <TextInput
                  style={[
                    baseStyles.input,
                    {
                      width: "100%",
                      padding: 6,
                      fontFamily: "monospace",
                      maxWidth: 100,
                    },
                  ]}
                  placeholder="Price..."
                  placeholderTextColor={baseStyles.defaultText?.color}
                  value={orderPrice}
                  onChangeText={setOrderPrice}
                  keyboardType="numeric"
                />
              </View>
            )}

            <Button
              onPress={handleTrade}
              title={
                tradeAction === "buy"
                  ? tradeType === "spot"
                    ? "Buy Now"
                    : "Place Buy Order"
                  : tradeType === "spot"
                  ? "Sell Now"
                  : "Place Sell Order"
              }
              type="primary"
              size="medium"
              style={{
                paddingTop: 12,
                paddingHorizontal: 16,
                backgroundColor:
                  tradeAction === "buy" ? theme.accent : "#F44336",
                marginTop: 16,
                marginHorizontal: "auto",
                maxWidth: 150,
              }}
              loading={isLoading}
            />
          </View>
        ) : (
          <View style={[styles.controlsRow, { gap: 8 }]}>
            <View style={[styles.inputWrapper]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  style={[
                    baseStyles.input,
                    {
                      flex: 1,
                      padding: 6,
                      fontFamily: "monospace",
                      maxWidth: 100,
                      marginRight: 6,
                    },
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
                  style={{
                    padding: 2,
                    paddingHorizontal: 8,
                    height: 30,
                    marginLeft: 4,
                  }}
                  textStyle={{ fontSize: 11 }}
                />
                {tradeType === "order" && (
                  <View style={[styles.inputWrapper]}>
                    <TextInput
                      style={[
                        baseStyles.input,
                        {
                          width: "100%",
                          padding: 6,
                          fontFamily: "monospace",
                          maxWidth: 100,
                          marginLeft: 8,
                        },
                      ]}
                      placeholder="Price..."
                      placeholderTextColor={baseStyles.defaultText?.color}
                      value={orderPrice}
                      onChangeText={setOrderPrice}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginLeft: "auto", alignItems: "flex-end" }}>
              <Button
                onPress={handleTrade}
                title={
                  tradeAction === "buy"
                    ? tradeType === "spot"
                      ? "Buy Now"
                      : "Place Buy Order"
                    : tradeType === "spot"
                    ? "Sell Now"
                    : "Place Sell Order"
                }
                type="primary"
                size="small"
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  backgroundColor:
                    tradeAction === "buy" ? theme.accent : "#F44336",
                  minWidth: 100,
                }}
                loading={isLoading}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
