import React, { useMemo, useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Sparkline from "@/src/components/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { createStyles as createGlobalStyles } from "@/src/styles/style";
import PortfolioPieChart from "./PortfolioPieChart";
import { AuthContext } from "../../context/AuthContext";
import { useAlert } from "@/src/context/AlertContext";
import Button from "@/src/components/Button";
import Card from "@/src/components/Card";

interface UserInfoProps {
  userName: string;
  cash: number;
  positionsValue: number;
  combinedValue: number;
  history: { total: number; date: string }[];
  theme: any;
  styles: any;
  positions?: any[]; // Optional positions for diversity chart
}

export default function UserInfo({
  userName,
  cash,
  positionsValue,
  combinedValue,
  history,
  theme,
  styles: propStyles,
  positions = [],
}: UserInfoProps) {
  const globalStyles = createGlobalStyles();

  // Neue Hooks für Logout
  const { setIsLoggedIn, setUser } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setUser(null);
      setIsLoggedIn(false);
      setIsLoggingOut(false);
      showAlert({
        type: "success",
        title: "Logged Out",
        message: "You have been successfully logged out."
      });
    }, 500);
  };

  // Internal state
  const [localHistory, setLocalHistory] = React.useState("7d");
  const historyOptions = ["7d", "30d", "360d"];

  // Calculate history data points based on selected timeframe
  let dataPoints = 7;
  switch (localHistory) {
    case "30d":
      dataPoints = 30;
      break;
    case "360d":
      dataPoints = 360;
      break;
    default:
      dataPoints = 7;
  }

  // Prepare chart data
  const historyData = history.slice(-dataPoints);
  const historyValues = historyData.map((item) => item.total);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (historyValues.length < 2)
      return { change: 0, percentage: 0, isPositive: true };

    const oldestValue = historyValues[0] || 0;
    const newestValue = historyValues[historyValues.length - 1] || 0;
    const change = newestValue - oldestValue;
    const percentage = oldestValue > 0 ? (change / oldestValue) * 100 : 0;

    return {
      change,
      percentage,
      isPositive: percentage >= 0,
    };
  }, [historyValues]);

  // Calculate portfolio composition percentages
  const portfolioComposition = useMemo(() => {
    const total = cash + positionsValue;
    if (total <= 0) return { cash: 50, positions: 50 }; // Default equal split if no data

    return {
      cash: (cash / total) * 100,
      positions: (positionsValue / total) * 100,
    };
  }, [cash, positionsValue]);

  // Check if we have valid portfolio positions to display
  const hasValidPositions =
    positions.length > 0 &&
    positions.some((pos) => pos.marketInfo && pos.amount > 0);

  // Local styles
  const styles = StyleSheet.create({
    container: {
      maxWidth: 1024,
      marginHorizontal: "auto",
      width: "95%",
      marginTop: 10,
      marginBottom: 20,
      padding: 16,
      backgroundColor: theme.background,
      borderRadius: 12,
      // More subtle themed box shadow
      // boxShadow: `0px 0px 11px ${theme.accent}`,
      // More subtle themed border
      // borderWidth: 1.5,
      // borderColor: theme.accent,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: `${theme.text}20`,
      paddingBottom: 10,
    },
    userNameContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    profileIcon: {
      marginRight: 8,
      color: theme.accent,
    },
    userName: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.accent,
    },
    performanceContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    performanceText: {
      fontWeight: "bold",
      fontSize: 14,
      color: performanceMetrics.isPositive ? "#4CAF50" : "#F44336",
    },
    performanceIcon: {
      marginRight: 4,
    },
    metricsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      flexWrap: "wrap",
    },
    metricBox: {
      width: "30%",
      backgroundColor: `${theme.accent}10`,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
      marginBottom: 8,
    },
    metricLabel: {
      color: theme.text,
      fontSize: 12,
      marginBottom: 4,
    },
    metricValue: {
      color: theme.accent,
      fontSize: 16,
      fontWeight: "bold",
      fontFamily: Platform.OS === "ios" ? undefined : "monospace",
    },
    compositionContainer: {
      marginVertical: 16,
      backgroundColor: `${theme.background}20`,
    },
    compositionBar: {
      height: 8,
      borderRadius: 4,
      flexDirection: "row",
      marginTop: 8,
      overflow: "hidden",
    },
    cashPortion: {
      height: "100%",
      backgroundColor: theme.accent,
      width: `${portfolioComposition.cash}%`,
    },
    positionsPortion: {
      height: "100%",
      backgroundColor: theme.accent + "80", // Using accent with opacity for better visibility in dark mode
      width: `${portfolioComposition.positions}%`,
    },
    legendContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginTop: 8,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 6,
    },
    legendText: {
      color: theme.text,
      fontSize: 12,
    },
    historyContainer: {
      marginTop: 16,
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    historyTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "600",
    },
    historyTabsContainer: {
      flexDirection: "row",
    },
    historyTab: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginLeft: 4,
      borderRadius: 16,
      backgroundColor: `${theme.text}20`,
    },
    historyTabActive: {
      backgroundColor: `${theme.accent}40`,
    },
    historyTabText: {
      color: theme.text,
      fontSize: 12,
    },
    historyTabTextActive: {
      color: theme.accent,
      fontWeight: "600",
      fontSize: 12,
    },
    sparklineContainer: {
      marginTop: 10,
      height: 80,
      width: "100%",
    },
  });

  return (
    <Card style={styles.container}>
          
      {/* Header mit Name, Performance und Logout-Button */}
      <View style={styles.headerRow}>
        <View style={styles.userNameContainer}>
          <Ionicons name="person-circle" size={30} style={styles.profileIcon} />
          <Text style={styles.userName}>{userName}</Text>
          <View style={[styles.performanceContainer, { marginLeft: 10 }]}>
        <Ionicons
          name={
            performanceMetrics.isPositive ? "trending-up" : "trending-down"
          }
          size={18}
          color={performanceMetrics.isPositive ? "#4CAF50" : "#F44336"}
          style={styles.performanceIcon}
        />
        <Text style={styles.performanceText}>
          {performanceMetrics.isPositive ? "+" : ""}
          {performanceMetrics.percentage.toFixed(2)}%
        </Text>
          </View>
        </View>
        <Button
          onPress={handleLogout}
          title="Logout"
          loading={isLoggingOut}
          style={{ marginLeft: 10 }}
          size="small"
          type="danger"
        />
      </View>

      {/* Key metrics in boxes */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Cash</Text>
          <Text style={styles.metricValue}>{formatCurrency(cash)}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Positions</Text>
          <Text style={styles.metricValue}>
            {positionsValue === 0 ? "0.00 $" : formatCurrency(positionsValue)}
          </Text>
        </View>

        <View
          style={[styles.metricBox, { backgroundColor: `${theme.accent}20` }]}
        >
          <Text style={styles.metricLabel}>Total Value</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(combinedValue)}
          </Text>
        </View>
      </View>

      {/* Portfolio composition */}
      <View style={styles.compositionContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="pie-chart-outline" size={20} color={theme.accent} style={{ marginRight: 6 }} />
          <Text style={styles.historyTitle}>Distribution</Text>
        </View>

        <View style={styles.compositionBar}>
          <View style={styles.cashPortion} />
          <View style={styles.positionsPortion} />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: theme.accent }]}
            />
            <Text style={styles.legendText}>
              Cash ({portfolioComposition.cash.toFixed(0)}%)
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.accent + "80" },
              ]}
            />
            <Text style={styles.legendText}>
              Positions ({portfolioComposition.positions.toFixed(0)}%)
            </Text>
          </View>
        </View>
      </View>

      {/* Portfolio Pie Chart */}
      {hasValidPositions && (
        <PortfolioPieChart
          portfolioPositions={positions}
          totalValue={positionsValue}
        />
      )}

      {/* Value history chart */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={20} color={theme.accent} style={{ marginRight: 6 }} />
            <Text style={styles.historyTitle}>Value History</Text>
          </View>

          <View style={styles.historyTabsContainer}>
            {historyOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setLocalHistory(opt)}
                style={[
                  styles.historyTab,
                  localHistory === opt && styles.historyTabActive,
                ]}
              >
                <Text
                  style={
                    localHistory === opt
                      ? styles.historyTabTextActive
                      : styles.historyTabText
                  }
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sparklineContainer}>
          <Sparkline
            prices={historyValues}
            width="100%"
            height={80}
            stroke={performanceMetrics.isPositive ? "#4CAF50" : "#F44336"}
            strokeWidth={2}
          />
        </View>
      </View>
      </Card>
    
  );
}
