import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, TextInput } from "react-native";
import { createStyles } from "@/src/styles/style";
import { useNavigation } from "@react-navigation/native";
import Sparkline from "@/src/components/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { ThemeContext } from "@/src/context/ThemeContext";
import { useTrade } from "@/src/context/TradeContext";

export default function TradeScreen() {
  const { theme } = useContext(ThemeContext); 
  const styles = createStyles();
  const navigation = useNavigation();
  const { selectedCoin, setSelectedCoin } = useTrade();
  const [coin, setCoin] = useState<any>(selectedCoin);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (selectedCoin) {
      setCoin(selectedCoin);
    }
  }, [selectedCoin]);

  useEffect(() => {
    if (!coin) {
      // Falls kein Coin übergeben wurde, BTC laden
      fetch("https://broke-end.vercel.app/marketData")
        .then((res) => res.json())
        .then((data) => {
          const btcCoin = data.find(
            (item: any) => item.symbol.toLowerCase() === "btc"
          );
          if (btcCoin) {
            setCoin(btcCoin);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [coin]);

  useEffect(() => {
    if (coin && coin.symbol) {
      fetch("https://broke-end.vercel.app/marketData")
        .then((res) => res.json())
        .then((data) => {
          const ticker = data.find(
            (item: any) =>
              item.symbol.toLowerCase() === coin.symbol.toLowerCase()
          );
          if (ticker?.current_price) {
            setMarketPrice(parseFloat(ticker.current_price));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [coin]);

  const handleTrade = (type: "buy" | "sell") => {
    console.log(
      `${type === "buy" ? "Kaufen" : "Verkaufen"}:`,
      { coinId: coin.id, amount: quantity }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={[styles.defaultText, { fontSize: 20, marginBottom: 12 }]}>
          {coin?.name} ({coin?.symbol.toUpperCase()})
        </Text>
        {marketPrice !== null && (
          <Text style={[styles.defaultText, { fontSize: 14, color: "gray" }]}>
            Market: {formatCurrency(marketPrice)}
          </Text>
        )}
        <Sparkline 
          prices={coin?.sparkline.price}
          stroke={theme.accent}
          width="100%"
          height={100}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems:"center", marginTop: 16 }}>
          <TextInput
            style={[styles.input, { width: "40%" }]}
            placeholder="Menge eingeben..."
            placeholderTextColor={styles.defaultText.color}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <TouchableOpacity style={[styles.buySellButton, { backgroundColor: "green" }]} onPress={() => handleTrade("buy")}>
            <Text style={{ backgroundColor: "green", color:"white" }}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buySellButton, { backgroundColor: "red" }]} onPress={() => handleTrade("sell")}>
            <Text style={{ backgroundColor: "red", color:"white" }}>Sell</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
