import { StyleSheet } from "react-native";

interface Theme {
  background: string;
  text: string;
  accent: string;
}

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 12 },
    header: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
    },

    // Navigation Bar (Holding, Hot, etc.)
    filterContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    filterButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      color: theme.text,
    },
    selectedFilterButton: { backgroundColor: theme.accent },
    filterText: { color: theme.text, fontSize: 14 },
    selectedFilterText: { fontWeight: "bold", color: "white" },

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
      borderRadius: 4,
      marginRight: 8,
      color: theme.text,
    },
    selectedCategoryButton: { backgroundColor: theme.accent },
    categoryText: { color: theme.text, fontSize: 14 },
    selectedCategoryText: { fontWeight: "bold", color: "#00a9d7" },
    amountSortButton: {
      alignSelf: "flex-end",
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 4,
      marginLeft: "auto",
    },
    amountSortText: { color: theme.text, fontSize: 14, fontWeight: "bold" },
    hr: {
      height: 1,
      backgroundColor: "gray",
    },
    card: {
      backgroundColor: theme.background,
      padding: 12,
      marginVertical: 8,
      borderRadius: 4,
    },
    menuButton: { position: "absolute", top: 10, right: 10 },
    name: { fontSize: 18, color: theme.text },
    amount: { fontSize: 14, color: theme.text, fontWeight: "bold", fontFamily: "monospace" },
    value: { fontSize: 14, fontWeight: "bold", color: theme.text, fontFamily: "monospace" },
    profit: { fontSize: 16, fontWeight: "bold", marginTop: 5, fontFamily: "monospace" },
    gain: { color: "green", fontFamily: "monospace" },
    loss: { color: "red", fontFamily: "monospace" },

    // Gemeinsame Portfolio-Komponenten Styles
    componentContainer: {
      maxWidth: 1024,
      alignSelf: "center",
      width: "100%",
    },
    list: {
      maxWidth: 1024,
      alignSelf: "center",
      width: "100%",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
      width: "100%",
      justifyContent: "space-between",
    },
    coinIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    coinIconLarge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 8,
    },
    labelText: {
      fontWeight: "bold",
      marginRight: 4,
      color: theme.text,
    },
    marketName: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },

    // Grid Layout für Karten-Inhalte
    gridRow: {
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      marginVertical: 4,
    },
    gridCol1: {
      width: "30%",
      flexDirection: "row",
      alignItems: "center",
    },
    gridCol2: {
      width: "25%",
      textAlign: "center",
      alignItems: "center",
    },
    gridCol3: {
      width: "45%",
      textAlign: "right",
      alignItems: "flex-end",
    },
    intervalButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      backgroundColor: theme.background, // Standard-Hintergrund
      marginHorizontal: 4,
    },
    intervalButtonActive: {
      backgroundColor: theme.accent, // Aktiv: den Accent-Farbwert verwenden
    },
    intervalText: {
      fontSize: 14,
      color: theme.text,
    },
    intervalTextActive: {
      fontSize: 14,
      color: "#fff",
      fontWeight: "bold",
    },
    sparklineContainer: {
      marginTop: 8,
    },
    chartContainer: {
      width: "100%",
      marginVertical: 16,
      paddingHorizontal: 5,
      alignItems: "center",
      backgroundColor: theme.background,
    },
    
    // Leerer Container für "keine Daten" Anzeige
    emptyContainer: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      backgroundColor: theme.background,
      borderRadius: 8,
    },
  });
