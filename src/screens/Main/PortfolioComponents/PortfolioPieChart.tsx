import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
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

// Neue Helperfunktion zur Anpassung der Helligkeit einer Hex-Farbe
function adjustColorBrightness(hex: string, factor: number): string {
  // Entferne das '#' falls vorhanden
  hex = hex.replace("#", "");
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.round(Math.min(255, r * factor));
  g = Math.round(Math.min(255, g * factor));
  b = Math.round(Math.min(255, b * factor));

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export default function PortfolioPieChart({
  portfolioPositions = [],
  totalValue = 0,
  width = Dimensions.get("window").width * 0.95,
  height = 200,
  outerRadius = Math.min(width, height) * 0.4,
  innerRadius = outerRadius * 0.4, // für Donut-Stil
}: PortfolioPieChartProps) {
  const { theme } = useContext(ThemeContext);
  const accent = theme.accent; // Basis-Akzentfarbe
  const [selectedSegment, setSelectedSegment] = useState<PortfolioItem | null>(
    null
  );
  const isWeb = Platform.OS === "web";
  const svgRef = useRef(null);

  // Angepasste Erstellung der Portfolio-Items mit Farbabstufungen
  const portfolioItems = React.useMemo(() => {
    if (!portfolioPositions || portfolioPositions.length === 0) return [];
    const validPositions = portfolioPositions.filter(
      (pos) => pos.marketInfo && pos.amount > 0
    );
    const n = validPositions.length;
    return validPositions
      .map((position, index) => {
        const value = position.amount * position.marketInfo.current_price;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        // Berechne einen Faktor von 1 (keine Änderung) bis ca. 0.6 für dunklere Abstufung
        const factor = n > 1 ? 1 - (index / (n - 1)) * 0.4 : 1;
        return {
          symbol: position.marketInfo.symbol.toUpperCase(),
          amount: position.amount,
          value: value,
          percentage: percentage,
          color: adjustColorBrightness(accent, factor),
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [portfolioPositions, totalValue, accent]);

  // No items or total value equals 0
  if (portfolioItems.length === 0 || totalValue === 0) {
    return (
      <View style={styles.container}>
 
        <Text
          style={{
            color: theme.text,
            textAlign: "center",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          No portfolio positions available
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
     

      <View style={styles.chartContainer}>
        <Svg width={width} height={height} ref={svgRef}>
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

              // For web, we use regular SVG path without onPress
              // For native, onPress works correctly
              const pathProps = isWeb
                ? {
                    // No onPress for web - we'll handle clicks differently
                    onClick: () => handleSegmentPress(d.data),
                  }
                : {
                    onPress: () => handleSegmentPress(d.data),
                  };

              return (
                <Path
                  key={`arc-${i}`}
                  d={arc(d) || ""}
                  fill={d.data.color}
                  opacity={selectedSegment ? (isSelected ? 1 : 0.5) : 1}
                  transform={`translate(${x}, ${y})`}
                  {...pathProps}
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
                fontFamily="monospace"
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
                  fontFamily="monospace"
                >
                  {formatCurrency(selectedSegment.value)}
                </SvgText>
                <SvgText
                  x={0}
                  y={40}
                  fontSize={14}
                  fill={theme.text}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {selectedSegment.percentage.toFixed(2)}%
                </SvgText>
              </G>
            )}
          </G>
        </Svg>
      </View>

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
  chartContainer: {
    position: "relative",
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
    fontFamily: "monospace",
  },
});
