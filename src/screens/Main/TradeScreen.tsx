import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ThemeContext } from "@/src/context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { createStyles } from "@/src/styles/style";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { fetchHistoricalData } from "./fetchHistoricalData";
import Sparkline from "@/src/components/Sparkline";

// Definiert, welche Binance-Intervalle zu welchen Zeiträumen gehören.
const timeIntervals = {
  "1D": "1h",
  "1W": "4h",
  "1M": "1d",
  "3M": "3d",
  "6M": "1w",
  "1Y": "1w",
};

export default function TradeScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles();
  const navigation = useNavigation();
  const route = useRoute();

  // Auth-Context für Benutzer & Positionen
  const { user, setUser } = useContext(AuthContext);

  // Coin kommt aus den Route-Parametern (z. B. { coin: { symbol: "btc", name: "Bitcoin" } })
  const { coin: routeCoin } = (route.params || {}) as { coin?: any };

  // Lokale States
  const [coin, setCoin] = useState<any>(routeCoin);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");

  // Zeitbereichsauswahl (Standard: "1D")
  const [selectedRange, setSelectedRange] =
    useState<keyof typeof timeIntervals>("1D");
  // Chartdaten, die ausschließlich von Binance kommen
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    if (routeCoin && routeCoin !== coin) {
      setCoin(routeCoin);
    }
  }, [routeCoin]);

  useEffect(() => {
    if (!coin) {
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

  useEffect(() => {
    if (coin && coin.symbol) {
      const symbol = coin.symbol.toUpperCase() + "USDT";
      const binanceInterval = timeIntervals[selectedRange];

      fetchHistoricalData(symbol, binanceInterval)
        .then((data) => {
          console.log("📈 Geladene historische Daten:", data.slice(0, 5));
          setChartData(data);
        })
        .catch((err) => console.error(err));
    }
  }, [coin, selectedRange]);

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
    const payload = { symbol: coin.symbol, value: amount, token: user.token };

    try {
      const response = await fetch("https://broke-end.vercel.app/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`${type} Trade fehlgeschlagen`);
      const updatedUser = await response.json();
      setUser(updatedUser);
      alert(`${type} Trade erfolgreich!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unerwarteter Fehler");
    }
  };

  const handleMax = () => {
    if (user && coin && user.positions) {
      const coinNormalized = coin.symbol
        ? coin.symbol.toLowerCase().replace(/usdt$/, "")
        : "";
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

        <View
          style={{ flexDirection: "row", marginVertical: 12, flexWrap: "wrap" }}
        >
          {Object.keys(timeIntervals).map((range) => (
            <TouchableOpacity
              key={range}
              style={{
                padding: 6,
                marginRight: 8,
                marginBottom: 8,
                borderRadius: 6,
                backgroundColor:
                  selectedRange === range ? theme.accent : "#ccc",
              }}
              onPress={() =>
                setSelectedRange(range as keyof typeof timeIntervals)
              }
            >
              <Text
                style={{ color: selectedRange === range ? "#000" : "#fff" }}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Sparkline
          prices={chartData.map(data => data.value)}
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
            }}
          >
            <Text style={{ color: "white" }}>Max</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buySellButton, { backgroundColor: "green" }]}
            onPress={() => handleTrade("buy")}
          >
            <Text style={{ color: "white" }}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buySellButton, { backgroundColor: "red" }]}
            onPress={() => handleTrade("sell")}
          >
            <Text style={{ color: "white" }}>Sell</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
