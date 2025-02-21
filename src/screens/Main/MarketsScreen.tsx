import { createStyles } from "@/src/styles/style";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput, // Neuer Import für TextInput
  SafeAreaView, // Neuer Import für SafeAreaView
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
  sparkline: { price: number[] };
};

export default function MarketsScreen() {
  const styles = createStyles();
  const navigation = useNavigation();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortCriterion, setSortCriterion] = useState<"cap" | "vol" | "change24h">("cap");
  const [sortedAscending, setSortedAscending] = useState(true); // neuer State für Sortierreihenfolge
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

    // Erstes Abrufen
    fetchData();
    // Intervall: alle 5 Sekunde
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Aktualisierte Sortierlogik abhängig von sortedAscending
  const sortedTickers = [...tickers].sort((a, b) => {
    if (sortCriterion === "cap") {
      return sortedAscending
        ? b.market_cap - a.market_cap
        : a.market_cap - b.market_cap;
    } else if (sortCriterion === "vol") {
      return sortedAscending
        ? b.total_volume - a.total_volume
        : a.total_volume - b.total_volume;
    } else if (sortCriterion === "change24h") {
      return sortedAscending
        ? b.price_change_percentage_24h - a.price_change_percentage_24h
        : a.price_change_percentage_24h - b.price_change_percentage_24h;
    }
    return 0;
  });

  // Filtere die Ticker basierend auf dem Suchtext
  const filteredTickers = sortedTickers.filter((ticker) =>
    (ticker.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00a9d7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>         
      {/* Sortier-Zeile */}
      <View style={sortLocalStyles.sortRow}>
        <TouchableOpacity
          onPress={() => {
            if (sortCriterion === "cap") {
              setSortedAscending(!sortedAscending);
            } else {
              setSortCriterion("cap");
              setSortedAscending(true);
            }
          }}
          style={[
            sortLocalStyles.sortButton,
            {
              borderColor:
                sortCriterion === "cap" ? styles.accent.color : "gray",
            },
          ]}
        >
          <Text style={styles.defaultText}>
            Cap {sortCriterion === "cap" ? (sortedAscending ? "↓" : "↑") : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (sortCriterion === "vol") {
              setSortedAscending(!sortedAscending);
            } else {
              setSortCriterion("vol");
              setSortedAscending(true);
            }
          }}
          style={[
            sortLocalStyles.sortButton,
            {
              borderColor:
                sortCriterion === "vol" ? styles.accent.color : "gray",
            },
          ]}
        >
          <Text style={styles.defaultText}>
            Vol {sortCriterion === "vol" ? (sortedAscending ? "↓":"↑") : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (sortCriterion === "change24h") {
              setSortedAscending(!sortedAscending);
            } else {
              setSortCriterion("change24h");
              setSortedAscending(true);
            }
          }}
          style={[
            sortLocalStyles.sortButton,
            {
              borderColor:
                sortCriterion === "change24h" ? styles.accent.color : "gray",
            },
          ]}
        >
          <Text style={styles.defaultText}>
            24h {sortCriterion === "change24h" ? (sortedAscending ? "↓" : "↑") : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsSearchActive(prev => !prev)} 
          style={[
            sortLocalStyles.sortButton,
            { borderColor: isSearchActive ? styles.accent.color : "gray" },
          ]}
        >
          <Ionicons name="search" size={18} color={styles.defaultText.color} />
        </TouchableOpacity>
       
      </View>
        {/* Falls Suchmodus aktiv, wird TextInput angezeigt */}
 {isSearchActive && (
        <TextInput
          placeholder="Suche..."
          placeholderTextColor={styles.defaultText.color}
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          style={[styles.input, { alignSelf: "center" }]}
        />
      )}
      {/* Marktliste als Komponente: Jetzt mit gefilterter Liste */}
      <MarketList
        tickers={filteredTickers}
        onPressItem={(item) => navigation.navigate("Trade" as never, { item })}
        accentColor={styles.accent.color}
        defaultTextColor={styles.defaultText.color}
        containerBackground={styles.container.backgroundColor}
      />
    </SafeAreaView>
  );
}
