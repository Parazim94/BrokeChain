import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { createStyles } from "@/src/styles/style";
import { useNavigation, useRoute } from "@react-navigation/native";
import Sparkline from "@/src/components/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { ThemeContext } from "@/src/context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

export default function TradeScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles();
  const navigation = useNavigation();
  const route = useRoute();
  const { coin: routeCoin } = (route.params || {}) as { coin?: any };
  const [coin, setCoin] = useState<any>(routeCoin);
  console.log(coin);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (routeCoin && routeCoin !== coin) {
      setCoin(routeCoin);
    }
  }, [routeCoin]);

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
    console.log("market-trade");
  }, [coin]);

  const handleTrade = async (type: "buy" | "sell") => {
    if (!coin || !user?.token) {
      alert("Münze oder User-Token fehlt");
      return;
    }
    const quantityInput = parseFloat(quantity);
    if (isNaN(quantityInput)) {
      alert("Ungültige Menge");
      return;
    }
    const amount = type === "sell" ? -Math.abs(quantityInput) : quantityInput;
    const payload = {
      symbol: coin.symbol,
      value: amount,
      token: user.token,
    };
    console.log(payload);
    try {
      const response = await fetch("https://broke-end.vercel.app/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.log(response);
        throw new Error(`${type} Trade fehlgeschlagen`);
      }
      const updatedUser = await response.json();

      setUser(updatedUser);
      alert(`${type} Trade erfolgreich!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unerwarteter Fehler");
    }
  };

  const { user, setUser } = useContext(AuthContext);

  // Setze das Input-Feld auf das Maximum der gehandelten Position
  const handleMax = () => {
    if (user && coin && user.positions) {
      const coinNormalized = coin.symbol ? coin.symbol.toLowerCase().replace(/usdt$/, "") : "";
      let maxAmount = 0;
      let found = false;
      Object.keys(user.positions).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/usdt$/, "");
        if (normalizedKey === coinNormalized) {
          maxAmount = user.positions[key];
          found = true;
        }
      });
      // Falls keine Position vorhanden ist, berechne max über Cash / MarketPrice
      if (!found && marketPrice && user.cash) {
        maxAmount = (user.cash -10) / marketPrice;
      }
      setQuantity(String(maxAmount));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={[styles.defaultText, { fontSize: 20, marginBottom: 12 }]}>
          {coin?.name} ({coin?.symbol ? coin.symbol.toUpperCase() : ""})
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <TextInput
            style={[styles.input, { width: "35%" }]} 
            placeholder="Menge eingeben..."
            placeholderTextColor={styles.defaultText.color}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <TouchableOpacity
            onPress={handleMax}
            style={{
              padding: 10,
              backgroundColor: theme.accent,
              borderRadius: 5,
              marginRight: 8,
            }}
          >
            <Text style={{ color: "white" }}>Max</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buySellButton, { backgroundColor: "green" }]}
            onPress={() => handleTrade("buy")}
          >
            <Text style={{ backgroundColor: "green", color: "white" }}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buySellButton, { backgroundColor: "red" }]}
            onPress={() => handleTrade("sell")}
          >
            <Text style={{ backgroundColor: "red", color: "white" }}>Sell</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
