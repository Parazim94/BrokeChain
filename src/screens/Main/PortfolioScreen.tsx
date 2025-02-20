import React, { useContext, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { portfolioData, filterOptions, coinCategories } from "./portfolioData";
import { createStyles } from "./portfolioStyles";

export default function PortfolioScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
  const [selectedFilter, setSelectedFilter] = useState("Holding");
  const [selectedCategory, setSelectedCategory] = useState("Coins");
  const [sortedAscending, setSortedAscending] = useState(true);

  // Coins nach Kategorie filtern
  const filteredData = portfolioData.filter(
    (coin) => selectedCategory === "All" || coin.category === selectedCategory
  );

  // Coins nach Wert sortieren
  const sortedData = [...filteredData].sort((a, b) =>
    sortedAscending ? a.value - b.value : b.value - a.value
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>User</Text>

      {/* Navigation Bar (Holding, Hot, etc.) */}
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

      {/* Coin-Kategorien & Amount-Sortierung */}
      <View style={styles.categoryAndSortContainer}>
        {/* Links: Kategorien */}
        <View style={styles.categoryContainer}>
          {coinCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rechts: Sortieroption nach Amount */}
        <TouchableOpacity
          style={styles.amountSortButton}
          onPress={() => setSortedAscending(!sortedAscending)}
        >
          <Text style={styles.amountSortText}>
            Amount {sortedAscending ? "↑" : "↓"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio-Liste */}
      <FlatList
        data={sortedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Drei-Punkte-Menü */}
            <TouchableOpacity style={styles.menuButton}>
              <MaterialIcons name="more-vert" size={24} color={theme.text} />
            </TouchableOpacity>

            {/* Coin-Details */}
            <Text style={styles.name}>
              {item.name} ({item.symbol})
            </Text>
            <Text style={styles.amount}>{item.amount}</Text>
            <Text style={styles.value}>${item.value.toLocaleString()}</Text>

            {/* Gewinn oder Verlust */}
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
