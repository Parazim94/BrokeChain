import { StyleSheet } from "react-native";

// Gemeinsame Typen für die Stylesheets
export interface ChartStyles {
  container: object;
  loadingContainer: object;
  tooltip: object;
  tooltipText: object;
  enhancedTooltip: object;
  tooltipHeader: object;
  tooltipTitle: object;
  tooltipRow: object;
  tooltipLabel: object;
  tooltipValue: object;
  legend: object;
  legendItem: object;
  legendItemActive: object;
  legendColor: object;
  dataDisplay: object;
  dataHeader: object;
  dataTitle: object;
  dataSubtitle: object;
  dataGrid: object;
  dataGridItem: object;
  dataRow: object;
  dataLabel: object;
  dataValue: object;
  dataItem: object;
}

export interface TradeControlsStyles {
  container: object;
  header: object;
  controlsRow: object;
  controlsGroup: object;
  inputContainer: object;
  buttonContainer: object;
  inputLabel: object;
  helpText: object;
  inputWrapper: object;
  tradeInfoBox: object;
  pricePreview: object;
  divider: object;
  sectionTitle: object;
  toggleContainer: object;
  toggleButton: object;
  toggleButtonActive: object;
  toggleButtonText: object;
  toggleButtonTextActive: object;
}

/**
 * Erzeugt Chart-spezifische Stile basierend auf dem Theme
 */
export function createChartStyles(theme: any): ChartStyles {
  return StyleSheet.create({
    container: {
      position: "relative",
      backgroundColor: "transparent",
      overflow: "visible",
      paddingBottom: 10,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    // Standard-Tooltip
    tooltip: {
      position: "absolute",
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: 6,
      borderRadius: 4,
      zIndex: 9999,
    },
    tooltipText: {
      color: "white",
      fontSize: 10,
    },
    // Erweiterter Tooltip
    enhancedTooltip: {
      position: "absolute",
      backgroundColor: "rgba(0,0,0,0.85)",
      borderRadius: 8,
      padding: 0,
      width: 150,
      zIndex: 9999,
      boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
      elevation: 5,
      overflow: "hidden",
    },
    tooltipHeader: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    tooltipTitle: {
      color: "white",
      fontSize: 10,
      fontWeight: "bold",
      textAlign: "center",
    },
    tooltipRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    tooltipLabel: {
      color: "#999",
      fontSize: 10,
    },
    tooltipValue: {
      color: "white",
      fontSize: 10,
      fontWeight: "bold",
    },
    // Legende und Steuerungselemente
    legend: {
      position: "absolute",
      top: 10,
      right: 15,
      flexDirection: "row",
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: 4,
      padding: 4,
      boxShadow: "0px 1px 2px rgba(0,0,0,0.2)",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 8,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
    },
    legendItemActive: {
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    legendColor: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
    },
    // Persistente Datenanzeige
    dataDisplay: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      backgroundColor: `${theme.accent}15`, 
      borderColor: `${theme.accent}40`,
      marginHorizontal: 10,
      marginTop: 8,
    },
    dataHeader: {
      marginBottom: 10,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(128,128,128,0.2)",
    },
    dataTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.accent,
    },
    dataSubtitle: {
      fontSize: 14,
      marginTop: 4,
      color: theme.text,
    },
    dataGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    dataGridItem: {
      width: "48%",
      padding: 8,
      marginBottom: 8,
      backgroundColor: "rgba(128,128,128,0.1)",
      borderRadius: 4,
    },
    dataRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
      alignItems: "center",
    },
    dataLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
    },
    dataValue: {
      fontSize: 14,
      fontFamily: "monospace",
      color: theme.text,
    },
    dataItem: {
      flex: 1,
      alignItems: "center",
    },
  }) as ChartStyles;
}

/**
 * Erzeugt Trade-Controls-spezifische Stile basierend auf dem Theme
 */
export function createTradeControlsStyles(theme: any): TradeControlsStyles {
  return StyleSheet.create({
    container: {
      flexDirection: "column", 
      marginTop: 12,
      marginHorizontal: 4,
      borderRadius: 8,
      padding: 12,
    },
    header: {
      flexDirection: "row", 
      justifyContent: "space-between", 
      marginBottom: 8,
      alignItems: "center",
    },
    controlsRow: {
      flexDirection: "row", 
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      width: "100%",
    },
    controlsGroup: {
      flexDirection: "row", 
      alignItems: "flex-start",
      flex: 1,
      minWidth: 200,
      maxWidth: 400,
      gap: 8,
    },
    inputContainer: {
      flexDirection: "row",
      marginBottom: 8,
      alignItems: "center",
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 6,
    },
    inputLabel: {
      fontSize: 12,
      color: theme.text,
      marginBottom: 4,
      fontWeight: "500",
    },
    helpText: {
      fontSize: 11,
      color: `${theme.text}99`,
      marginTop: 2,
      marginBottom: 4,
    },
    inputWrapper: {
      flexDirection: "column",
      marginBottom: 8,
      flex: 1,
      maxWidth: 180,
    },
    tradeInfoBox: {
      padding: 6,
      backgroundColor: `${theme.background}88`,
      borderRadius: 6,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: `${theme.accent}30`,
    },
    pricePreview: {
      marginTop: 6,
      padding: 6,
      borderRadius: 4,
      backgroundColor: `${theme.background}50`,
    },
    divider: {
      height: 1,
      backgroundColor: `${theme.accent}30`,
      width: "100%",
      marginVertical: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    toggleContainer: {
      flexDirection: 'row',
      borderRadius: 6,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: `${theme.accent}40`,
      backgroundColor: `${theme.background}80`,
      height: 36,
      marginLeft: 8,
    },
    toggleButton: {
      paddingHorizontal: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      height: '100%',
      minWidth: 60,
      // Note: React Native doesn't support CSS transitions
      // Use Animated API in your component for animations
    },
    toggleButtonActive: {
      backgroundColor: theme.accent,
      borderWidth: 0,
    },
    toggleButtonText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '500',
      pointerEvents: 'none',
    },
    toggleButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  }) as TradeControlsStyles;
}

/**
 * Gemeinsame Stile für Trade-Bereich
 */
export function createTradeScreenStyles(theme: any) {
  return StyleSheet.create({
    chartContainer: {
      flex: 1,
      backgroundColor: theme.background + "28",
      borderRadius: 8,
      marginTop: 8,
    },
    headerContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginLeft: 8,
    },
    coinInfoContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      flex: 1,
    },
    coinTitle: {
      fontSize: 20,
      marginBottom: 12,
      color: theme.text,
      backgroundColor: "transparent",
    },
    coinPrice: {
      fontSize: 14,
      color: theme.accent,
      fontFamily: "monospace",
    },
    searchContainer: {
      marginVertical: 10,
      backgroundColor: theme.background,
      borderRadius: 8,
    },
    searchResults: {
      maxHeight: 200,
      backgroundColor: theme.background,
      borderRadius: 8,
      marginTop: 4,
      borderWidth: 1,
      borderColor: theme.text,
    },
    searchResultItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.text,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    timeIntervalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 8,
    },
    timeIntervalButtonsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      flex: 1,
    },
  });
}