import React, { useContext, useState, useEffect } from "react";
import { SafeAreaView, View, TouchableOpacity, Text } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { createStyles } from "./PortfolioComponents/portfolioStyles";
import UserInfo from "./PortfolioComponents/UserInfo";
import Sorting from "./PortfolioComponents/Sorting";
import Holding from "./PortfolioComponents/Holding";
import Fav from "./PortfolioComponents/Fav";
import New from "./PortfolioComponents/New";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import { AuthContext } from "../../context/AuthContext";

const filterOptions = ["Holding", "Favorites", "New"];
const historyOptions = ["7d", "30d", "360d"];

export default function PortfolioScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isLoggedIn, user } = useContext(AuthContext);
  const [selectedFilter, setSelectedFilter] = useState("Holding");
  const [sortedAscending, setSortedAscending] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState("360d");
  const [marketData, setMarketData] = useState<any[]>([]);

  const userData = user || {
    userName: "Gast",
    cash: 10000, // Standardwert gesetzt
    positions: [] as { coinId: string; amount: number; [key: string]: any }[],
    history: [] as number[],
    favorites: [] as string[],
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.navigate("Login");
    }
  }, [isLoggedIn, navigation]);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await fetch("https://broke-end.vercel.app/marketData");
        const data = await response.json();
        if (Array.isArray(data)) {
          setMarketData(data);
        } else {
          console.error("Unerwartetes Datenformat:", data);
          setMarketData([]);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Marktdaten:", error);
      }
    }
    fetchMarketData();
  }, []);

  // Absicherung für neue Benutzer ohne positions
  const userPositionsArray = Object.entries(userData.positions || {}).map(
    ([key, value]) => {
      return { coinId: key, amount: value as number };
    }
  );
  const mergedPositions = userPositionsArray.map(
    (pos: { coinId: string; amount: number; [key: string]: any }) => {
      // Entferne 'usdt' und verwandle in Kleinbuchstaben
      const coinIdLower = pos.coinId.toLowerCase().replace(/usdt$/i, "");
      const coinData = marketData.find(
        (coin: { name: string; symbol: string; [key: string]: any }) =>
          coin.name.toLowerCase() === coinIdLower ||
          coin.symbol.toLowerCase() === coinIdLower
      );
      return { ...pos, marketInfo: coinData };
    }
  );

  // Neues: Positionswert und kombinierter Gesamtwert
  const positionsValue = mergedPositions.reduce(
    (acc: number, pos: { amount: number; marketInfo?: { current_price: number } }) => {
      if (pos.marketInfo)
        return acc + pos.amount * pos.marketInfo.current_price;
      return acc;
    },
    0
  );
  const combinedValue = (userData.cash || 0) + positionsValue;

  const filteredPositions = mergedPositions.filter(
    (position: { coinId: string; [key: string]: any }) => {
      const coinIdLower = position.coinId.toLowerCase();
      if (selectedFilter === "Holding") return true;
      if (selectedFilter === "Favorites")
        return userData.favorites.some(
          (fav: string) => fav.toLowerCase() === coinIdLower
        );
      if (selectedFilter === "New")
        return !userData.favorites.some(
          (fav: string) => fav.toLowerCase() === coinIdLower
        );
      return true;
    }
  );

  const sortedPositions = [...filteredPositions].sort(
    (
      a: { amount: number; marketInfo?: { current_price: number } },
      b: { amount: number; marketInfo?: { current_price: number } }
    ) => {
      const valueA = a.marketInfo ? a.amount * a.marketInfo.current_price : 0;
      const valueB = b.marketInfo ? b.amount * b.marketInfo.current_price : 0;
      return sortedAscending ? valueA - valueB : valueB - valueA;
    }
  );

  const favoriteMarketData = marketData.filter(
    (coin: { name: string; [key: string]: any }) =>
      userData.favorites.some(
        (fav: string) => fav.toLowerCase() === coin.name.toLowerCase()
      )
  );

  const getHistoryData = () => {
    // Überprüfe, ob history existiert und ein Array ist
    if (!userData.history || !Array.isArray(userData.history) || userData.history.length === 0) 
      return [];
    
    // Bestimme basierend auf der Auswahl, wie viele Datenpunkte zurückgegeben werden sollen
    let dataPoints = 7; // Standardwert für "7d"
    
    switch (selectedHistory) {
      case "30d":
        dataPoints = 30;
        break;
      case "360d":
        dataPoints = 360;
        break;
      default: // "7d"
        dataPoints = 7;
    }
    
    // Holen Sie sich die letzten 'dataPoints' Einträge aus dem History-Array
    // Nehmen Sie Rücksicht auf das neue Format {total: number, date: string}
    return userData.history.slice(-dataPoints);
  };

  return (
    <SafeAreaView style={styles.container}>
      <UserInfo
        userName={userData.userName}
        cash={userData.cash}
        positionsValue={positionsValue}
        combinedValue={combinedValue}
        history={getHistoryData()}
        theme={theme}
        styles={styles}
      />

      <Sorting
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        sortedAscending={sortedAscending}
        setSortedAscending={setSortedAscending}
        filterOptions={filterOptions}
        theme={theme}
        styles={styles}
        selectedHistory={selectedHistory}
        setSelectedHistory={setSelectedHistory}
        historyOptions={historyOptions}
      />
      {/* Absicherung mit || [] hinzugefügt, um "cannot read properties of undefined" zu vermeiden */}
      {(userData.positions || []).length === 0 ? (
        <Text style={[styles.header, {marginLeft:12}]}>Login or Register first!</Text>
      ) : selectedFilter === "Favorites" ? (
        <Fav data={favoriteMarketData} theme={theme} />
      ) : selectedFilter === "New" ? (
        <New data={sortedPositions} theme={theme} />
      ) : (
        <Holding data={sortedPositions} theme={theme} />
      )}
    </SafeAreaView>
  );
}
