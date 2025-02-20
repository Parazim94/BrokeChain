import React, { useContext, useState, useEffect } from "react";
import { View } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { createStyles } from "./portfolioStyles";
import { mockUser } from "../../data/mockUser";
import UserInfo from "./PortfolioComponents/UserInfo";
import Sorting from "./PortfolioComponents/Sorting";
import Holding from "./PortfolioComponents/Holding";
import Fav from "./PortfolioComponents/Fav";
import New from "./PortfolioComponents/New";

const filterOptions = ["Holding", "Favorites", "New"];

export default function PortfolioScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
  const [selectedFilter, setSelectedFilter] = useState("Holding");
  const [sortedAscending, setSortedAscending] = useState(true);
  const { userName, positions, history, favorites } = mockUser;
  const [marketData, setMarketData] = useState<any[]>([]);

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

  const mergedPositions = positions.map((pos) => {
    const coinData = marketData.find(
      (coin) => coin.name.toLowerCase() === pos.coinId.toLowerCase()
    );
    return { ...pos, marketInfo: coinData };
  });

  const computedCash = mergedPositions.reduce((acc, pos) => {
    if (pos.marketInfo) return acc + pos.amount * pos.marketInfo.current_price;
    return acc;
  }, 0);

  const filteredPositions = mergedPositions.filter((position) => {
    const coinIdLower = position.coinId.toLowerCase();
    if (selectedFilter === "Holding") return true;
    if (selectedFilter === "Favorites")
      return favorites.some((fav) => fav.toLowerCase() === coinIdLower);
    if (selectedFilter === "New")
      return !favorites.some((fav) => fav.toLowerCase() === coinIdLower);
    return true;
  });

  const sortedPositions = [...filteredPositions].sort((a, b) =>
    sortedAscending ? a.amount - b.amount : b.amount - a.amount
  );

  const favoriteMarketData = marketData.filter((coin) =>
    favorites.some((fav) => fav.toLowerCase() === coin.name.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <UserInfo
        userName={userName}
        cash={computedCash}
        history={history}
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
      />
      {selectedFilter === "Favorites" ? (
        <Fav data={favoriteMarketData} theme={theme}  />
      ) : selectedFilter === "New" ? (
        <New data={sortedPositions} theme={theme}  />
      ) : (
        <Holding data={sortedPositions} theme={theme}  />
      )}
    </View>
  );
}
