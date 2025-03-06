import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

interface AssetDistributionProps {
  assets: {
    name: string;
    value: number;
    color: string;
  }[];
  theme: any;
}

const AssetDistributionChart = ({ assets, theme }: AssetDistributionProps) => {
  // Get the total value
  const total = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Calculate percentages for the asset distribution
  const chartData = assets.map((asset) => {
    const percentage = (asset.value / total) * 100;
    return {
      ...asset,
      percentage,
    };
  });

  // Sort data by value (descending)
  chartData.sort((a, b) => b.value - a.value);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        Asset Distribution
      </Text>

      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
        <Text style={[styles.totalValue, { color: theme.accent }]}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(total)}
        </Text>
      </View>

      <View style={styles.barsContainer}>
        {chartData.map((item, index) => (
          <View key={`asset-${index}`} style={styles.assetRow}>
            <View style={styles.assetLabelContainer}>
              <View
                style={[styles.colorIndicator, { backgroundColor: item.color }]}
              />
              <Text style={[styles.assetName, { color: theme.text }]}>
                {item.name}
              </Text>
            </View>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
              <Text style={[styles.percentageText, { color: theme.text }]}>
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
            <Text style={[styles.valueText, { color: theme.accent }]}>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(item.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "transparent",
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  barsContainer: {
    marginTop: 8,
  },
  assetRow: {
    marginBottom: 14,
  },
  assetLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  assetName: {
    fontSize: 14,
    fontWeight: "500",
  },
  barContainer: {
    height: 16,
    backgroundColor: "rgba(200, 200, 200, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  bar: {
    height: "100%",
    opacity: 0.8,
  },
  percentageText: {
    position: "absolute",
    left: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  valueText: {
    fontSize: 12,
    textAlign: "right",
  },
});

export default AssetDistributionChart;
