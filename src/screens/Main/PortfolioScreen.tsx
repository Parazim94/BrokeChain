import React, { useContext, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { createStyles } from "./PortfolioComponents/portfolioStyles";
import UserInfo from "./PortfolioComponents/UserInfo";
import Sorting from "./PortfolioComponents/Sorting";
import Holding from "./PortfolioComponents/Holding";
import Fav from "./PortfolioComponents/Fav";
import New from "./PortfolioComponents/New";
import Orders from "./PortfolioComponents/Orders"; // Neue Orders-Komponente importieren
import PortfolioPieChart from "./PortfolioComponents/PortfolioPieChart";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import { AuthContext } from "../../context/AuthContext";
import { useData } from "@/src/context/DataContext";
import { fetchPost } from "../../hooks/useFetch";

const filterOptions = ["Holding", "Favorites", "New", "Orders"]; // Orders hinzugefügt

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
          setUser(updatedUser);
        } catch (err) {
          console.error("Fehler beim Abrufen des Benutzers:", err);
        }
      }
    };    
    fetchUserData();
  }, []); // Wird einmalig beim Mount ausgeführt

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
      const valueB = b.marketInfo ? a.amount * b.marketInfo.current_price : 0;
      return sortedAscending ? valueA - valueB : valueB - valueA;
    }
  );

  const favoriteMarketData = marketData.filter(
    (coin: { name: string; [key: string]: any }) =>
      userData.favorites.some(
        (fav: string) => fav.toLowerCase() === coin.name.toLowerCase()
      )
  );

  // Handle-Funktion zum Löschen einer Order
  const handleDeleteOrder = (orderId: string) => {
    if (!user || !user.token) return;
    
    console.log("Lösche Order mit ID:", orderId); // Debugging-Ausgabe hinzufügen
    
    fetchPost("deleteOrder", { token: user.token, orderId })
      .then((response) => {
        if (response.success) {
          // Aktualisieren des Benutzers nach Löschung
          fetchPost("user", { token: user.token })
            .then((updatedUser) => setUser(updatedUser))
            .catch((err) => console.error("Fehler beim Aktualisieren:", err));
        } else {
          console.error("Fehler beim Löschen:", response.message || "Unbekannter Fehler");
        }
      })
      .catch((err) => console.error("Fehler beim Löschen der Order:", err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ width: "100%" }}>
        <UserInfo
          userName={userData.userName}
          cash={userData.cash}
          positionsValue={positionsValue}
          combinedValue={combinedValue}
          history={userData.history}
          theme={theme}
          styles={styles}
        />

        {/* Portfolio Pie Chart - only show if user has valid positions */}
        {hasValidPositions && (
          <View style={styles.chartContainer}>
            <PortfolioPieChart
              portfolioPositions={mergedPositions}
              totalValue={positionsValue}
            />
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

        {/* Absicherung mit || [] hinzugefügt, um "cannot read properties of undefined" zu vermeiden */}
        {(userData.positions || []).length === 0 ? (
          <Text style={[styles.header, { marginLeft: 12 }]}>
            {user.userName !== "gast"
              ? "Login or Register first!"
              : "buy some!"}
          </Text>
        ) : selectedFilter === "Orders" ? (
          <Orders 
            data={userData.orders || []} 
            theme={theme}
            onDeleteOrder={handleDeleteOrder}
          />
        ) : selectedFilter === "Favorites" ? (
          <Fav data={favoriteMarketData} theme={theme} />
        ) : selectedFilter === "New" ? (
          <New data={sortedPositions} theme={theme} />
        ) : (
          <Holding data={sortedPositions} theme={theme} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
