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
      position: "relative",
      width: "100%",
      alignSelf: "flex-end", 
      alignItems: "flex-end",
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

    // Karten und Container Styles
    cardContainer: {
      backgroundColor: theme.background,
      maxWidth: "100%",
      minWidth: 280,
      marginTop: 8,
      padding: 12,
      borderRadius: 4,
    },
    
    // Erweiterte Grid-Layout Styles
    cardContent: { 
      flexDirection: "row", 
      width: "100%" 
    },
    logoContainer: { 
      padding: 8, 
      alignItems: "center", 
      justifyContent: "center" 
    },
    detailsContainer: { 
      flex: 1, 
      paddingLeft: 8, 
      width: "100%" 
    },
    
    // Text-Styling
    monoText: { 
      fontFamily: "monospace", 
      fontWeight: "bold" 
    },
    priceText: { 
      fontSize: 16, 
      fontWeight: "bold", 
      color: theme.accent, 
      fontFamily: "monospace" 
    },
    accentText: {
      color: theme.accent,
      fontWeight: "bold",
    },
    
    // Button und Interaktionselemente
    actionButton: {
      padding: 8,
      borderRadius: 4,
    },
    
    // Chart-Komponenten
    tooltip: {
      position: "absolute",
      padding: 8,
      borderRadius: 6,
      width: 150,
      zIndex: 1000,
    },
    tooltipHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    tooltipDate: {
      fontSize: 12,
      fontWeight: "bold",
    },
    tooltipValue: {
      fontSize: 14,
    },
    
    // Badge-Styles
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: "flex-start",
    },
    badgeText: {
      color: "white",
      fontWeight: "bold",
    },
    buyBadge: {
      backgroundColor: "green",
    },
    sellBadge: {
      backgroundColor: "red",
    },
    
    // Tabellen und Listen
    twoColumnRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginVertical: 4,
    },
    twoColumnContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between'
    },
    divider: {
      height: 1,
      backgroundColor: `${theme.text}20`,
      marginVertical: 4,
    },
  });
