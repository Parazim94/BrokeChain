import React, { useContext, useState, useEffect, useMemo } from "react";
import { SafeAreaView, View, Text, SectionList } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { createStyles } from "./PortfolioComponents/portfolioStyles";
import UserInfo from "./PortfolioComponents/UserInfo";
import Sorting from "./PortfolioComponents/Sorting";
import Holding from "./PortfolioComponents/Holding";
import Fav from "./PortfolioComponents/Fav";
import TradeHistory from "./PortfolioComponents/TradeHistory";
import Orders from "./PortfolioComponents/Orders";
import PortfolioPieChart from "./PortfolioComponents/PortfolioPieChart";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types/types";
import { AuthContext } from "../../context/AuthContext";
import { useData } from "@/src/context/DataContext";
import { fetchPost } from "../../hooks/useFetch";

const filterOptions = ["Holding", "Favorites", "TradeHistory", "Orders"]; // "New" zu "TradeHistory" geändert

export default function PortfolioScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isLoggedIn, user, setUser } = useContext(AuthContext);
  const { marketData } = useData();
  const [selectedFilter, setSelectedFilter] = useState("Holding");
  const [sortedAscending, setSortedAscending] = useState(true);

  const userData = user || {
    userName: "Gast",
    cash: 10000, // Standardwert gesetzt
    positions: [] as { coinId: string; amount: number; [key: string]: any }[],
    history: [] as number[],
    favorites: [] as string[],
    orders: [] as { symbol: string; amount: number; threshold: number; user_id: string; }[], // Orders hinzugefügt
    tradeHistory: [] as { symbol: string; price: number; amount: number; order: boolean; createdAt: string }[], // TradeHistory hinzugefügt
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.navigate("Login");
    }
  }, [isLoggedIn, navigation]);

  // useEffect zum Abrufen des aktuellen Benutzers via POST mit Token
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.token) {
        try {
          const updatedUser = await fetchPost("user", { token: user.token });
          console.log("Benutzerdaten aktualisiert:", updatedUser); // Debugging-Ausgabe hinzufügen
          setUser(updatedUser);
        } catch (err) {
          console.error("Fehler beim Abrufen des Benutzers:", err);
        }
      }
    };    
    fetchUserData();
  }, [Orders]); // Optionale Verkettung hinzugefügt

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
    (
      acc: number,
      pos: { amount: number; marketInfo?: { current_price: number } }
    ) => {
      if (pos.marketInfo)
        return acc + pos.amount * pos.marketInfo.current_price;
      return acc;
    },
    0
  );
  const combinedValue = (userData.cash || 0) + positionsValue;

  // Check if we have valid portfolio positions to display
  const hasValidPositions =
    mergedPositions.length > 0 &&
    mergedPositions.some((pos) => pos.marketInfo && pos.amount > 0);

  const filteredPositions = mergedPositions.filter(
    (position: { coinId: string; [key: string]: any }) => {
      const coinIdLower = position.coinId.toLowerCase();
      if (selectedFilter === "Holding") return true;
      if (selectedFilter === "Favorites")
        return userData.favorites.some(
          (fav: string) => fav.toLowerCase() === coinIdLower
        );
      if (selectedFilter === "TradeHistory") // "New" zu "TradeHistory" geändert
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
      const valueB = b.marketInfo ? a.amount * b.marketInfo.current_price : 0;
      return sortedAscending ? valueA - valueB : valueB - valueA;
    }
  );

  const favoriteMarketData = useMemo(() => {
    if (!user?.favorites || !Array.isArray(user.favorites) || !Array.isArray(marketData)) {
      return [];
    }
    
    // Filter marketData für alle Coins, deren Symbol in user.favorites ist
    // Define interfaces for coin data types
    interface MarketDataCoin {
      symbol: string;
      name: string;
      current_price: number;
      [key: string]: any;
    }

    return marketData.filter((coin: MarketDataCoin) => 
      user.favorites.some((fav: string) => 
      fav.toLowerCase() === coin.symbol.toLowerCase()
      )
    );
  }, [user?.favorites, marketData]);

  // Handle-Funktion zum Löschen einer Order korrigiert für die Backend-Route
  const handleDeleteOrder = (orderId: string) => {
    if (!user || !user.token) return;
    
    console.log("Lösche Order mit ID:", orderId);
    
    fetchPost("trade/deleteorder", { 
      token: user.token, 
      order: { _id: orderId } // Korrekte Struktur für das Backend
    })
      .then((updatedUser) => {
        if (updatedUser) {
          // Wenn das Backend direkt den aktualisierten Benutzer zurückgibt
          setUser(updatedUser);
        } else {
          console.error("Unerwartete Antwort vom Server");
        }
      })
      .catch((err) => console.error("Fehler beim Löschen der Order:", err));
  };

  // Bereite die Daten für SectionList vor.
  let sectionData = [];
  let currentData = [];
  switch (selectedFilter) {
    case "Orders":
      currentData = userData.orders || [];
      break;
    case "Favorites":
      currentData = favoriteMarketData;
      break;
    case "TradeHistory": 
      currentData = ["trades_placeholder"];
      break;
    default:
      currentData = sortedPositions;
      break;
  }
  sectionData.push({
    title: selectedFilter,
    data: currentData.length ? currentData : [null],
    type: selectedFilter.toLowerCase(),
  });

  const renderSectionItem = ({ item, index, section }: any) => {
    if (!item) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.text, textAlign: "center", marginTop: 20 }}>
            {selectedFilter === "Orders" ? "Keine offenen Bestellungen vorhanden" : "Keine Daten verfügbar"}
          </Text>
        </View>
      );
    }
    switch (section.type) {
      case "orders":
        return <Orders data={[item]} theme={theme} onDeleteOrder={handleDeleteOrder} />;
      case "favorites":
        return <Fav data={[item]} theme={theme} />;
      case "tradehistory": 
        return <TradeHistory theme={theme} tradeHistory={userData.tradeHistory} isLoggedIn={isLoggedIn} />;
      default:
        return <Holding data={[item]} theme={theme} />;
    }
  };

  const headerComponent = () => (
    <>
      <UserInfo
        userName={userData.userName}
        cash={userData.cash}
        positionsValue={positionsValue}
        combinedValue={combinedValue}
        history={userData.history}
        theme={theme}
        styles={styles}
      />
      {hasValidPositions && (
        <View style={styles.chartContainer}>
          <PortfolioPieChart portfolioPositions={mergedPositions} totalValue={positionsValue} />
        </View>
      )}
      <Sorting
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        sortedAscending={sortedAscending}
        setSortedAscending={setSortedAscending}
        filterOptions={filterOptions}
        theme={theme}
        styles={styles}
      />
      {(userData.positions || []).length === 0 && (
        <Text style={[styles.header, { marginLeft: 12 }]}>
          {user?.userName !== "gast"
            ? "Login or Register first!"
            : "buy some!"}
        </Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sectionData}
        keyExtractor={(item, index) => `${selectedFilter}-${index}`}
        renderItem={renderSectionItem}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
