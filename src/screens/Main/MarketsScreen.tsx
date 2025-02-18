import { createStyles } from "@/src/styles/style";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import MarketList from "@/src/components/MarketList";

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
  const navigation = useNavigation();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortCriterion, setSortCriterion] = useState<'cap' | 'vol'>('cap');

  // Lokale Styles
  const sortLocalStyles = StyleSheet.create({
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
      <View style={sortLocalStyles.sortRow}>
        <TouchableOpacity
          onPress={() => setSortCriterion("cap")}
          style={[
            sortLocalStyles.sortButton,
            { borderColor: sortCriterion === "cap" ? styles.accent.color : "gray" },
          ]}
        >
          <Text style={styles.defaultText}>Cap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortCriterion("vol")}
          style={[
            sortLocalStyles.sortButton,
            { borderColor: sortCriterion === "vol" ? styles.accent.color : "gray" },
          ]}
        >
          <Text style={styles.defaultText}>Vol</Text>
        </TouchableOpacity>
      </View>
      
      {/* Marktliste als Komponente */}
      <MarketList
        tickers={sortedTickers}
        onPressItem={(item) => navigation.navigate("Trade", { item })}
        accentColor={styles.accent.color}
        defaultTextColor={styles.defaultText.color}
        containerBackground={styles.container.backgroundColor}
      />
    </View>
  );
}