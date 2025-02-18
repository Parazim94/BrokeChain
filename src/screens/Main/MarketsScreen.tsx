import { createStyles } from "@/src/styles/style";
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/src/utils/formatCurrency";
import Sparkline from "@/src/components/Sparkline";

// Neuer Typ für CoinGecko-Daten inkl. Sparkline-Feld
type Ticker = {
  id: string;
  name: string; // neu hinzugefügt
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  image: string;
  sparkline_in_7d: { price: number[] };
};

export default function MarketsScreen() {
  const styles = createStyles();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortCriterion, setSortCriterion] = useState<'cap' | 'vol'>('cap');

  // Lokale Styles für FlatList, Cards, Zeilen und Text-Abhebung
  const localStyles = StyleSheet.create({
    flatList: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    card: {
      backgroundColor: styles.container.backgroundColor,
      padding: 12,
      marginVertical: 8,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 1, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
      maxWidth: 400,
      minWidth: 300,
      marginHorizontal: "auto",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 4,
    },
    coinIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    sortRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 8,
    },
    sortButton: {
      marginHorizontal: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      borderWidth: 1,
    },
    labelText: {
      fontWeight: "bold",
      marginRight: 4,
      color: styles.defaultText.color,
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    hr: {
      height: 1,
      backgroundColor: "gray",
      marginVertical: 4,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true");
        const data: Ticker[] = await response.json();
        setTickers(data);
      } catch (error) {
        console.error("Fehler beim Abrufen der CoinGecko-Daten:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sorted Daten basierend auf dem ausgewählten Sortierkriterium
  const sortedTickers = [...tickers].sort((a, b) =>
    sortCriterion === "cap" ? b.market_cap - a.market_cap : b.total_volume - a.total_volume
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sortier-Zeile */}
      <View style={localStyles.sortRow}>
        <TouchableOpacity
          onPress={() => setSortCriterion("cap")}
          style={[
            localStyles.sortButton,
            { borderColor: sortCriterion === "cap" ? styles.accent.color : "gray" },
          ]}
        >
          <Text style={styles.defaultText}>Cap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortCriterion("vol")}
          style={[
            localStyles.sortButton,
            { borderColor: sortCriterion === "vol" ? styles.accent.color : "gray" },
          ]}
        >
          <Text style={styles.defaultText}>Vol</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        contentContainerStyle={localStyles.flatList}
        data={sortedTickers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={localStyles.card}>
            {/* Neue erste Zeile: Icon, Name und Sparkline in einer Reihe */}
            <View style={[localStyles.row, { alignItems: "center" }]}>
              <Image source={{ uri: item.image }} style={localStyles.coinIcon} />
              <Text style={[styles.defaultText, localStyles.labelText, { marginLeft: 8, flex: 1 }]}>
                {item.name}
              </Text>
              <Sparkline prices={item.sparkline_in_7d.price} width={100} height={30} stroke="cadetblue" />
            </View>
            <View style={localStyles.hr} />
            {/* Zweite Zeile: Preis und prozentuale Veränderung */}
            <View style={localStyles.row}>
              <Text style={[styles.defaultText, { fontFamily: "monospace" }]}>
                {item.current_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
              </Text>
              <Text style={[styles.defaultText, { color: item.price_change_percentage_24h < 0 ? "red" : "green" }]}>
                {item.price_change_percentage_24h?.toFixed(2)}%
              </Text>
            </View>
            {/* Dritte Zeile: High und Low nebeneinander */}
            <View style={localStyles.row}>
              <Text style={styles.defaultText}>
                <Text style={localStyles.labelText}>High:</Text>
                <Text style={styles.defaultText}>
                  {" "}{item.high_24h.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                </Text>
              </Text>
              <Text style={styles.defaultText}>
                <Text style={localStyles.labelText}>Low:</Text>
                <Text style={styles.defaultText}>
                  {" "}{item.low_24h.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                </Text>
              </Text>
            </View>
            {/* Vierte Zeile: Volumen und Marktkapitalisierung nebeneinander */}
            <View style={localStyles.row}>
              <Text style={styles.defaultText}>
                <Text style={localStyles.labelText}>Vol:</Text>
                <Text style={styles.defaultText}> {formatCurrency(item.total_volume)}</Text>
              </Text>
              <Text style={styles.defaultText}>
                <Text style={localStyles.labelText}>Cap:</Text>
                <Text style={styles.defaultText}> {formatCurrency(item.market_cap)}</Text>
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}