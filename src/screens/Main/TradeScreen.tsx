import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, TextInput } from "react-native";
import { createStyles } from "@/src/styles/style";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import Sparkline from "@/src/components/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { ThemeContext } from "@/src/context/ThemeContext";

type TradeScreenRouteParams = {
  Trade: { item: any };
};

export default function TradeScreen() {
  const { theme } = useContext(ThemeContext); 
  const styles = createStyles();
  
  const route = useRoute<RouteProp<TradeScreenRouteParams, "Trade">>();
  const navigation = useNavigation();
  const coinFromRoute = route.params?.item;
  const [currentCoin, setCurrentCoin] = useState<any>(coinFromRoute || null);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");

  // Falls kein Coin übergeben wurde, hole BTC als Fallback
  useEffect(() => {
    if (!currentCoin) {
      fetch("https://broke-end.vercel.app/marketData")
        .then((res) => res.json())
        .then((data) => {
          const btcCoin = data.find(
            (item: any) => item.symbol.toLowerCase() === "btc"
          );
          if (btcCoin) {
            setCurrentCoin(btcCoin);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [currentCoin]);

  // Marktpreis laden, wenn currentCoin vorhanden ist
  useEffect(() => {
    if (currentCoin && currentCoin.symbol) {
      fetch("https://broke-end.vercel.app/marketData")
        .then((res) => res.json())
        .then((data) => {
          const ticker = data.find(
            (item: any) =>
              item.symbol.toLowerCase() === currentCoin.symbol.toLowerCase()
          );
          if (ticker?.current_price) {
            setMarketPrice(parseFloat(ticker.current_price));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [currentCoin]);

  const handleTrade = (type: "buy" | "sell") => {
    console.log(
      `${type === "buy" ? "Kaufen" : "Verkaufen"}:`,
      { coinId: currentCoin.id, amount: quantity }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Kein zusätzlicher Leertext zwischen den Elementen */}
      <View style={{ padding: 16 }}>
        <Text style={[styles.defaultText, { fontSize: 20, marginBottom: 12 }]}>
          {currentCoin?.name} ({currentCoin?.symbol.toUpperCase()})
        </Text>
        {marketPrice !== null && (
          <Text style={[styles.defaultText, { fontSize: 14, color: "gray" }]}>
            Market: {formatCurrency(marketPrice)}
          </Text>
        )}
        <Sparkline 
          prices={currentCoin?.sparkline.price}
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
