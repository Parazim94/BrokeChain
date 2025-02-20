import { createStyles } from "@/src/styles/style";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput, // Neuer Import für TextInput
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import MarketList from "@/src/components/MarketList";
import { Ionicons } from "@expo/vector-icons";

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
  const [sortCriterion, setSortCriterion] = useState<"cap" | "vol">("cap");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false); 
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
        const response = await fetch("https://broke-end.vercel.app/marketData");
        const data = await response.json();
        if (Array.isArray(data)) {
          setTickers(data);
        } else {
          console.error("Unerwartetes Datenformat:", data);
          setTickers([]);
        }
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
    sortCriterion === "cap"
      ? b.market_cap - a.market_cap
      : b.total_volume - a.total_volume
  );

  // Filtere die Ticker basierend auf dem Suchtext
  const filteredTickers = sortedTickers.filter(ticker =>
    (ticker.name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Falls Suchmodus aktiv, wird TextInput angezeigt */}
      {isSearchActive && (
        <TextInput
          placeholder="Suche..."
          placeholderTextColor={styles.defaultText.color}
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          style={styles.input}
        />
      )}
      {/* Sortier-Zeile */}
      <View style={sortLocalStyles.sortRow}>
        <TouchableOpacity
          onPress={() => setSortCriterion("cap")}
          style={[
            sortLocalStyles.sortButton,
            {
              borderColor:
                sortCriterion === "cap" ? styles.accent.color : "gray",
            },
          ]}
        >
          <Text style={styles.defaultText}>Cap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortCriterion("vol")}
          style={[
            sortLocalStyles.sortButton,
            {
              borderColor:
                sortCriterion === "vol" ? styles.accent.color : "gray",
            },
          ]}
        >
          <Text style={styles.defaultText}>Vol</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsSearchActive(prev => !prev)} // Umschalten des Suchmodus
          style={[
            sortLocalStyles.sortButton,
            { borderColor: styles.accent.color },
          ]}
        >
          <Ionicons name="search" size={18} color={styles.defaultText.color} />
        </TouchableOpacity>
      </View>

      {/* Marktliste als Komponente: Jetzt mit gefilterter Liste */}
      <MarketList
        tickers={filteredTickers}
        onPressItem={(item) => navigation.navigate("Trade" as never, { item })}
        accentColor={styles.accent.color}
        defaultTextColor={styles.defaultText.color}
        containerBackground={styles.container.backgroundColor}
      />
    </View>
  );
}
