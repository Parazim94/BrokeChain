import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

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
    profit: "+5.4%",
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    amount: "2 ETH",
    value: "$3,400",
    profit: "-2.1%",
  },
  {
    id: "3",
    name: "Solana",
    symbol: "SOL",
    amount: "10 SOL",
    value: "$1,000",
    profit: "+8.7%",
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
      <Text style={styles.header}>💰 Dein Portfolio</Text>

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
            <TouchableOpacity style={styles.menuButton}>
              <MaterialIcons name="more-vert" size={24} color={theme.text} />
            </TouchableOpacity>

            <Text style={styles.name}>
              {item.name} ({item.symbol})
            </Text>
            <Text style={styles.amount}>{item.amount}</Text>
            <Text style={styles.value}>{item.value}</Text>

            <Text
              style={[
                styles.profit,
                item.profit.includes("-") ? styles.loss : styles.gain,
              ]}
            >
              {item.profit}
            </Text>
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
      justifyContent: "space-between",
      alignItems: "center",
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
    futureContent: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.cardBackground,
    },
    futureText: {
      color: theme.secondaryText,
      fontSize: 14,
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
    menuButton: {
      position: "absolute",
      top: 10,
      right: 10,
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
    profit: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 5,
    },
    gain: {
      color: "green",
    },
    loss: {
      color: "red",
    },
  });
}
