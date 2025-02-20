import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface SortingProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  sortedAscending: boolean;
  setSortedAscending: (asc: boolean) => void;
  filterOptions: string[];
  theme: any;
  styles: any;
  selectedHistory: string;
  setSelectedHistory: (hist: string) => void;
  historyOptions: string[];
}

export default function Sorting({
  selectedFilter,
  setSelectedFilter,
  sortedAscending,
  setSortedAscending,
  filterOptions,
  theme,
  styles,
  selectedHistory,
  setSelectedHistory,
  historyOptions,
}: SortingProps) {
  return (
    <View>
      <View style={styles.filterContainer}>
        {historyOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              selectedHistory === option && styles.selectedFilterButton,
              {marginBottom: 10},
            ]}
            onPress={() => setSelectedHistory(option)}
          >
            <Text
              style={[
                styles.filterText,
                selectedHistory === option && styles.selectedFilterText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.hr} />
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
      <TouchableOpacity
        style={styles.amountSortButton}
        onPress={() => setSortedAscending(!sortedAscending)}
      >
        <Text style={styles.amountSortText}>
          Amount {sortedAscending ? "↑" : "↓"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
