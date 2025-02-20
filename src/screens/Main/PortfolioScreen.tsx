import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

interface Theme {
  background: string;
  text: string;
  cardBackground: string;
  secondaryText: string;
  accent: string;
}

const portfolioData = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    amount: "0.5 BTC",
    value: "$25,000",
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    amount: "2 ETH",
    value: "$3,400",
  },
  {
    id: "3",
    name: "Solana",
    symbol: "SOL",
    amount: "10 SOL",
    value: "$1,000",
  },
];

const filterOptions = [
  "Holding",
  "Hot",
  "New Listing",
  "Favorite",
  "Top Gainer",
];

export default function PortfolioScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
  const [selectedFilter, setSelectedFilter] = useState("Holding");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User</Text>

      {/* Navigation Bar */}
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              selectedFilter === option && styles.selectedFilterButton,
            ]}
            onPress={() => setSelectedFilter(option)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === option && styles.selectedFilterText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={portfolioData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.name} ({item.symbol})
            </Text>
            <Text style={styles.amount}>{item.amount}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        )}
      />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.cardBackground,
    },
    selectedFilterButton: {
      backgroundColor: theme.accent,
    },
    filterText: {
      color: theme.text,
      fontSize: 14,
    },
    selectedFilterText: {
      fontWeight: "bold",
      color: "#00a9d7",
    },
    card: {
      backgroundColor: theme.background,
      padding: 12,
      margin: 8,
      borderRadius: 10,
      shadowColor: theme.text,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    name: {
      fontSize: 18,
      color: theme.text,
    },
    amount: {
      fontSize: 16,
      color: theme.text,
    },
    value: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
  });
}
