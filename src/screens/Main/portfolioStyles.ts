import { StyleSheet } from "react-native";

interface Theme {
  background: string;
  text: string;
  cardBackground: string;
  secondaryText: string;
  accent: string;
}

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
    },

    // Navigation Bar (Holding, Hot, etc.)
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.cardBackground,
    },
    selectedFilterButton: { backgroundColor: theme.accent },
    filterText: { color: theme.text, fontSize: 14 },
    selectedFilterText: { fontWeight: "bold", color: "#00a9d7" },

    // Kategorie- & Sortierleiste
    categoryAndSortContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    categoryContainer: { flexDirection: "row" },
    categoryButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: theme.cardBackground,
      marginRight: 8,
    },
    selectedCategoryButton: { backgroundColor: theme.accent },
    categoryText: { color: theme.text, fontSize: 14 },
    selectedCategoryText: { fontWeight: "bold", color: "#00a9d7" },
    amountSortButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: theme.cardBackground,
    },
    amountSortText: { color: theme.text, fontSize: 14, fontWeight: "bold" },

    // Portfolio-Item
    card: {
      backgroundColor: theme.cardBackground,
      padding: 12,
      margin: 8,
      borderRadius: 10,
    },
    menuButton: { position: "absolute", top: 10, right: 10 },
    name: { fontSize: 18, color: theme.text },
    amount: { fontSize: 16, color: theme.text },
    value: { fontSize: 16, fontWeight: "bold", color: theme.text },
    profit: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
    gain: { color: "green" },
    loss: { color: "red" },
  });
