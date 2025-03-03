import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Svg, { G, Path, Circle, Text as SvgText } from "react-native-svg";
import * as d3Shape from "d3-shape";
import * as d3Scale from "d3-scale";
import { useContext } from "react";
import { ThemeContext } from "@/src/context/ThemeContext";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface PortfolioItem {
  symbol: string;
  amount: number;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioPieChartProps {
  portfolioPositions?: any[];
  totalValue: number;
  width?: number;
  height?: number;
  outerRadius?: number;
  innerRadius?: number;
}

export default function PortfolioPieChart({
  portfolioPositions = [],
  totalValue = 0,
  width = Dimensions.get("window").width * 0.95,
  height = 300,
  outerRadius = Math.min(width, height) * 0.4,
  innerRadius = outerRadius * 0.4, // für Donut-Stil
}: PortfolioPieChartProps) {
  const { theme } = useContext(ThemeContext);
  const [selectedSegment, setSelectedSegment] = useState<PortfolioItem | null>(
    null
  );

  // Create portfolio items with calculated values and percentages
  const portfolioItems = React.useMemo(() => {
    if (!portfolioPositions || portfolioPositions.length === 0) return [];

    // Farbskala für Diagramm-Segmente
    const colorScale = d3Scale
      .scaleOrdinal<string>()
      .range([
        "#4CAF50",
        "#2196F3",
        "#9C27B0",
        "#FF9800",
        "#F44336",
        "#3F51B5",
        "#009688",
        "#FFC107",
        "#795548",
        "#607D8B",
      ]);

    return portfolioPositions
      .filter((pos) => pos.marketInfo && pos.amount > 0)
      .map((position, index) => {
        const value = position.amount * position.marketInfo.current_price;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        return {
          symbol: position.marketInfo.symbol.toUpperCase(),
          amount: position.amount,
          value: value,
          percentage: percentage,
          color: colorScale(position.marketInfo.symbol),
        };
      })
      .filter((item) => item.value > 0) // Only include items with value
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [portfolioPositions, totalValue]);

  // No items or total value equals 0
  if (portfolioItems.length === 0 || totalValue === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          Portfolio-Verteilung
        </Text>
        <Text
          style={{
            color: theme.text,
            textAlign: "center",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          Keine Portfolio-Daten verfügbar
        </Text>
      </View>
    );
  }

  // Create pie data
  const pieData = d3Shape
    .pie<PortfolioItem>()
    .value((d) => d.value)
    .sort(null)(portfolioItems);

  // Arc generator
  const arc = d3Shape
    .arc<d3Shape.PieArcDatum<PortfolioItem>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  // Center point
  const center = { x: width / 2, y: height / 2 };

  // Handle segment click
  const handleSegmentPress = (item: PortfolioItem) => {
    setSelectedSegment(item === selectedSegment ? null : item);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        Portfolio-Verteilung
      </Text>

      <Svg width={width} height={height}>
        <G transform={`translate(${center.x}, ${center.y})`}>
          {/* Draw circle segments */}
          {pieData.map((d, i) => {
            const isSelected =
              selectedSegment && selectedSegment.symbol === d.data.symbol;
            const shift = isSelected ? 10 : 0; // highlight selected segment

            // Calculate new position for shifted segment
            const centroid = arc.centroid(d);
            const x = shift ? centroid[0] * 0.1 : 0;
            const y = shift ? centroid[1] * 0.1 : 0;

            return (
              <Path
                key={`arc-${i}`}
                d={arc(d) || ""}
                fill={d.data.color}
                opacity={selectedSegment ? (isSelected ? 1 : 0.5) : 1}
                transform={`translate(${x}, ${y})`}
                onPress={() => handleSegmentPress(d.data)}
              />
            );
          })}

          {/* Display total value when no segment selected */}
          {!selectedSegment && (
            <SvgText
              x={0}
              y={0}
              fontSize={18}
              fontWeight="bold"
              fill={theme.text}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {formatCurrency(totalValue)}
            </SvgText>
          )}

          {/* Display info for selected segment */}
          {selectedSegment && (
            <G>
              <SvgText
                x={0}
                y={-15}
                fontSize={18}
                fontWeight="bold"
                fill={selectedSegment.color}
                textAnchor="middle"
              >
                {selectedSegment.symbol}
              </SvgText>
              <SvgText
                x={0}
                y={15}
                fontSize={16}
                fill={theme.text}
                textAnchor="middle"
              >
                {formatCurrency(selectedSegment.value)}
              </SvgText>
              <SvgText
                x={0}
                y={40}
                fontSize={14}
                fill={theme.text}
                textAnchor="middle"
              >
                {selectedSegment.percentage.toFixed(2)}%
              </SvgText>
            </G>
          )}
        </G>
      </Svg>

      {/* Legend below chart */}
      <View style={styles.legendContainer}>
        {portfolioItems.map((item, index) => (
          <TouchableOpacity
            key={`legend-${index}`}
            style={styles.legendItem}
            onPress={() => handleSegmentPress(item)}
          >
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={[styles.legendText, { color: theme.text }]}>
              {item.symbol} ({item.percentage.toFixed(1)}%)
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
});
