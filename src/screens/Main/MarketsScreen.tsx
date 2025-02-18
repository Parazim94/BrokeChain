import { createStyles } from "@/src/styles/style";
import { View, Text, FlatList, ActivityIndicator, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/src/utils/formatCurrency";

// Neuer Typ für CoinGecko-Daten mit zusätzlichen Feldern
type Ticker = {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  image: string;
};

export default function MarketsScreen() {
  const styles = createStyles();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // API-Aufruf liefert alle benötigten Felder
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false")
      .then((response) => response.json())
      .then((data: Ticker[]) => {
        setTickers(data);
      })
      .catch((error) => {
        console.error("Fehler beim Abrufen der CoinGecko-Daten:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.coinIcon} />
            <Text style={styles.defaultText}>{item.symbol.toUpperCase()}</Text>
            <Text style={styles.defaultText}>
              Preis: ${item.current_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </Text>
            <Text style={[styles.defaultText, { color: item.price_change_percentage_24h < 0 ? "red" : "green" }]}>
              24h Veränderung: {item.price_change_percentage_24h?.toFixed(2)}%
            </Text>
            <Text style={styles.defaultText}>High: ${item.high_24h}</Text>
            <Text style={styles.defaultText}>Low: ${item.low_24h}</Text>
            <Text style={styles.defaultText}>
              Volumen: {formatCurrency(item.total_volume)}
            </Text>
            <Text style={styles.defaultText}>
              Marktkapitalisierung: {formatCurrency(item.market_cap)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}