import { createStyles } from "@/src/styles/style";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import MarketList from "@/src/components/Market/MarketList";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/src/types/types";
import { useData } from "@/src/context/DataContext";

export default function MarketsScreen() {
  const styles = createStyles();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { marketData, loadingMarketData, refreshMarketData } = useData();
  const [sortCriterion, setSortCriterion] = useState<
    "cap" | "vol" | "change24h"
  >("cap");
  const [sortedAscending, setSortedAscending] = useState(true);
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

  // useMemo für das Sortieren der Ticker
  const sortedTickers = useMemo(() => {
    return [...marketData].sort((a, b) => {
      if (sortCriterion === "cap") {
        return sortedAscending ? b.market_cap - a.market_cap : a.market_cap - b.market_cap;
      } else if (sortCriterion === "vol") {
        return sortedAscending ? b.total_volume - a.total_volume : a.total_volume - b.total_volume;
      } else if (sortCriterion === "change24h") {
        return sortedAscending
          ? b.price_change_percentage_24h - a.price_change_percentage_24h
          : a.price_change_percentage_24h - b.price_change_percentage_24h;
      }
      return 0;
    });
  }, [marketData, sortCriterion, sortedAscending]);

  // useMemo für das Filtern der Ticker
  const filteredTickers = useMemo(() => {
    return sortedTickers.filter((ticker) =>
      (ticker.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedTickers, searchQuery]);

  if (loadingMarketData && marketData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00a9d7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sortier-Zeile */}
      <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 8, marginTop:15 }]}>
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
            styles.baseButton,
            {
              paddingVertical: 4,
              paddingHorizontal: 8,
              marginHorizontal: 12,
              backgroundColor:               
                sortCriterion === "cap"
                  ? styles.accent.color
                  : styles.container.backgroundColor,
            },
          ]}
        >
          <Text style={styles.baseButtonText}>
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
            styles.baseButton,
            {
              paddingVertical: 4,
              paddingHorizontal: 8,
              marginHorizontal: 12,
              backgroundColor:
                sortCriterion === "vol"
                  ? styles.accent.color
                  : styles.defaultText.backgroundColor,
            },
          ]}
        >
          <Text style={styles.baseButtonText}>
            Vol {sortCriterion === "vol" ? (sortedAscending ? "↓" : "↑") : ""}
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
            styles.baseButton,
            {
              paddingVertical: 4,
              paddingHorizontal: 8,
              marginHorizontal: 12,
              backgroundColor:               
                sortCriterion === "change24h"
                  ? styles.accent.color
                  : styles.container.backgroundColor,
            },
          ]}
        >
          <Text style={styles.baseButtonText}>
            24h {sortCriterion === "change24h" ? (sortedAscending ? "↓" : "↑") : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsSearchActive((prev) => !prev)}
          style={[
            styles.baseButton,
            {
              paddingVertical: 4,
              paddingHorizontal: 8,
              marginHorizontal: 12,
              backgroundColor: isSearchActive
                ? styles.accent.color
                : styles.container.backgroundColor,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={styles.defaultText.color} />
        </TouchableOpacity>
      </View>
      {/* <View
        style={{
          maxWidth: 600,
          minWidth: 280,
          marginHorizontal: "auto",
          width: "95%",
        }}
      >
        <CashInfo />
      </View> */}
      {/* Neue horizontale Linie unter den Sortier-Buttons */}
      <View style={{ height: 1, backgroundColor: "gray", marginVertical: 8 }} />
      {/* Falls Suchmodus aktiv, wird TextInput angezeigt */}
      {isSearchActive && (
        <TextInput
          placeholder="search coin..."
          placeholderTextColor={styles.defaultText.color}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={[styles.input, { alignSelf: "center" }]}
        />
      )}
      {/* Marktliste als Komponente: Jetzt mit gefilterter Liste */}
      <MarketList
        tickers={filteredTickers}
        onPressItem={(item) => {
          navigation.navigate("Trade", { coin: item });
        }}
        accentColor={styles.accent.color}
        defaultTextColor={styles.defaultText.color}
        containerBackground={styles.container.backgroundColor}
        onRefresh={refreshMarketData}
      />
      
    </SafeAreaView>
  );
}
