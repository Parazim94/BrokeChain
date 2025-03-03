import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Svg, { Rect, Line, Text as SvgText, G } from "react-native-svg";
import * as d3Scale from "d3-scale";
import { format } from "date-fns";
import { ThemeContext } from "@/src/context/ThemeContext";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { useData } from "@/src/context/DataContext";

// Neue helper-Funktion: adjustColor (wie in der normalen CandlestickChart)
function adjustColor(hex: string, amt: number): string {
  let usePound = false;
  if (hex[0] === "#") {
    hex = hex.slice(1);
    usePound = true;
  }
  let num = parseInt(hex, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return (
    (usePound ? "#" : "") +
    ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")
  );
}

export interface CandleData {
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface CandlestickChartProps {
  symbol: string;
  interval: string;
  width?: number;
  height?: number;
}

export default function D3CandlestickChart({
  symbol,
  interval,
  width = Dimensions.get("window").width * 0.90,
  height = 300,
}: CandlestickChartProps) {
  const { theme } = useContext(ThemeContext);
  const { getHistoricalCandleData } = useData(); // Neu: getHistoricalCandleData verwenden
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<{
    index: number;
    x: number;
    y: number;
    isVisible: boolean;
  } | null>(null);
  const [showMA, setShowMA] = useState<boolean>(true);
  // Neuer State: Verwendung von Theme-Farben
  const [useThemeColors, setUseThemeColors] = useState<boolean>(false);

  // Configuration
  const CHART_HEIGHT = Math.round(height * 0.8);
  const VOLUME_HEIGHT = Math.round(height * 0.15);
  const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
  const effectiveWidth = width *0.95;  // neu: effectiveWidth berechnen
  const INNER_WIDTH = effectiveWidth - MARGIN.left - MARGIN.right;
  const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Moving average period
  const MA_PERIOD = 20;

  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      try {
        const data = await getHistoricalCandleData(symbol, interval);
        setCandles(data);
      } catch (error) {
        console.error("Error fetching candlestick data:", error);
        setCandles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandles();
  }, [symbol, interval, getHistoricalCandleData]);

  // Calculate moving averages
  const movingAverages = useMemo(() => {
    if (candles.length < MA_PERIOD) return [];

    const result = [];
    for (let i = MA_PERIOD - 1; i < candles.length; i++) {
      let sum = 0;
      for (let j = 0; j < MA_PERIOD; j++) {
        sum += candles[i - j].close;
      }
      result.push({
        index: i,
        value: sum / MA_PERIOD,
      });
    }
    return result;
  }, [candles]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { height }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 10 }}>
          Loading chart data...
        </Text>
      </View>
    );
  }

  if (candles.length === 0) {
    return (
      <View style={[styles.loadingContainer, { height }]}>
        <Text style={{ color: theme.text }}>No data available</Text>
      </View>
    );
  }

  // Bestimme die Farben: Standard oder abhängig vom theme.accent
  const bullColor = useThemeColors ? adjustColor(theme.accent, 80) : "#4CAF50";
  const bearColor = useThemeColors ? adjustColor(theme.accent, -40) : "#F44336";

  // Calculate price range and scales
  const allPrices = candles.flatMap((c) => [c.open, c.close, c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceMargin = (maxPrice - minPrice) * 0.1; // Add 10% margin

  // Calculate volume range
  const volumes = candles.map((c) => c.volume);
  const maxVolume = Math.max(...volumes);

  // Create scale for Y-axis (price)
  const yScale = d3Scale
    .scaleLinear()
    .domain([minPrice - priceMargin, maxPrice + priceMargin])
    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]);

  // Create scale for Y-axis (volume)
  const yVolumeScale = d3Scale
    .scaleLinear()
    .domain([0, maxVolume])
    .range([height - MARGIN.bottom, CHART_HEIGHT]);

  // Create scale for X-axis
  const xScale = d3Scale
    .scaleBand()
    .domain(candles.map((_, i) => i.toString()))
    .range([MARGIN.left, effectiveWidth - MARGIN.right]) // angepasst
    .padding(0.1);

  // Calculate tick values for Y-axis
  const yTicks = d3Scale
    .scaleLinear()
    .domain([minPrice - priceMargin, maxPrice + priceMargin])
    .ticks(10);

  // Format dates for X-axis labels
  const getDateLabel = (index: number): string => {
    if (index < 0 || index >= candles.length) return "";
    const date = new Date(candles[index].timestamp);
    return format(date, "HH:mm"); // neu: Zeige Uhrzeit statt "MMM d"
  };

  // Get X-axis labels (show fewer labels to avoid crowding)
  const xLabels = candles
    .map((_, i) => i)
    .filter((i) => i % Math.ceil(candles.length / 6) === 0);

  // PanResponder for tooltip
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleTouch,
    onPanResponderMove: handleTouch,
    onPanResponderRelease: () => {
      if (tooltip) {
        // Keep tooltip visible, but mark it as "sticky"
        setTooltip({ ...tooltip, isVisible: false });
        setTimeout(() => setTooltip(null), 2000);
      }
    },
  });

  // Handle touch events to show tooltip
  function handleTouch(event: GestureResponderEvent) {
    const { locationX } = event.nativeEvent;

    // Find nearest candle to touch position
    const chartX = locationX - MARGIN.left;
    const candleWidth = INNER_WIDTH / candles.length;
    const approxIndex = Math.floor(chartX / candleWidth);

    if (approxIndex >= 0 && approxIndex < candles.length) {
      const candle = candles[approxIndex];
      const x = xScale(approxIndex.toString())! + xScale.bandwidth() / 2;
      const y = yScale(candle.close);
      setTooltip({ index: approxIndex, x, y, isVisible: true });
    }
  }

  return (
    <ScrollView horizontal={true} contentContainerStyle={{ minWidth: effectiveWidth, margin: "auto", marginTop: 10 }}>
      <View style={styles.container} {...panResponder.panHandlers}>
        <Svg width={effectiveWidth} height={height}>
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <Line
              key={`grid-${tick}`}
              x1={MARGIN.left}
              y1={yScale(tick)}
              x2={effectiveWidth - MARGIN.right} // angepasst
              y2={yScale(tick)}
              stroke={`${theme.text}20`}
              strokeWidth={0.5}
              strokeDasharray="3,3"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map((tick) => (
            <SvgText
              key={`label-${tick}`}
              x={5} // angepasst, um dieselbe Position wie im Linechart zu erreichen
              y={yScale(tick)}
              fontSize="10"
              fill={theme.text}
            >
              {formatCurrency(tick)}
            </SvgText>
          ))}

          {/* X-axis labels */}
          {xLabels.map((i) => (
            <SvgText
              key={`date-${i}`}
              x={xScale(i.toString())! + xScale.bandwidth() / 2}
              y={CHART_HEIGHT - MARGIN.bottom + 20}
              fontSize="9"
              textAnchor="middle"
              alignmentBaseline="middle"
              fill={theme.text}
            >
              {getDateLabel(i)}
            </SvgText>
          ))}

          {/* Volume bars */}
          {candles.map((candle, i) => {
            const x = xScale(i.toString())!;
            const isBullish = candle.close >= candle.open;
            const volumeColor = isBullish
              ? `${bullColor}80` // Semi-transparent green for bullish
              : `${bearColor}80`; // Semi-transparent red for bearish

            return (
              <Rect
                key={`vol-${i}`}
                x={x}
                y={yVolumeScale(candle.volume)}
                width={xScale.bandwidth()}
                height={yVolumeScale(0) - yVolumeScale(candle.volume)}
                fill={volumeColor}
              />
            );
          })}

          {/* Candlesticks */}
          {candles.map((candle, i) => {
            const x = xScale(i.toString())!;
            const isBullish = candle.close >= candle.open;
            const candleColor = isBullish ? bullColor : bearColor;

            return (
              <G key={`candle-${i}`}>
                {/* Wick */}
                <Line
                  x1={x + xScale.bandwidth() / 2}
                  x2={x + xScale.bandwidth() / 2}
                  y1={yScale(candle.high)}
                  y2={yScale(candle.low)}
                  stroke={candleColor}
                  strokeWidth={1}
                />

                {/* Body */}
                <Rect
                  x={x}
                  y={yScale(Math.max(candle.open, candle.close))}
                  width={xScale.bandwidth()}
                  height={Math.max(
                    1,
                    Math.abs(yScale(candle.open) - yScale(candle.close))
                  )}
                  fill={candleColor}
                  stroke={candleColor}
                  strokeWidth={1}
                />
              </G>
            );
          })}

          {/* Moving Average Line */}
          {showMA && movingAverages.length > 0 && (
            <G>
              {movingAverages.map((point, i) => {
                if (i === 0) return null;
                const prevPoint = movingAverages[i - 1];
                return (
                  <Line
                    key={`ma-${i}`}
                    x1={
                      xScale(prevPoint.index.toString())! +
                      xScale.bandwidth() / 2
                    }
                    y1={yScale(prevPoint.value)}
                    x2={
                      xScale(point.index.toString())! + xScale.bandwidth() / 2
                    }
                    y2={yScale(point.value)}
                    stroke={theme.accent} // Orange color for MA line
                    strokeWidth={2}
                  />
                );
              })}
            </G>
          )}

          {/* Horizontal separator between price chart and volume chart */}
          <Line
            x1={MARGIN.left}
            y1={CHART_HEIGHT}
            x2={effectiveWidth - MARGIN.right} // angepasst
            y2={CHART_HEIGHT}
            stroke={`${theme.text}40`}
            strokeWidth={0.5}
          />

          {/* Volume label */}
          <SvgText
            x={MARGIN.left - 5}
            y={CHART_HEIGHT + (height - CHART_HEIGHT) / 2}
            fontSize="8"
            textAnchor="end"
            alignmentBaseline="middle"
            fill={theme.text}
          >
            VOLUME
          </SvgText>
        </Svg>

        {/* Enhanced Tooltip */}
        {tooltip && tooltip.isVisible && (
          <View
            style={[
              styles.enhancedTooltip,
              {
                left: Math.min(tooltip.x - 75, width - 150),
                top: Math.min(tooltip.y - 70, CHART_HEIGHT - 140),
              },
            ]}
          >
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>
                {format(
                  new Date(candles[tooltip.index].timestamp),
                  "MMM d, yyyy HH:mm"
                )}
              </Text>
            </View>
            <View style={styles.tooltipRow}>
              <Text style={styles.tooltipLabel}>Open:</Text>
              <Text style={styles.tooltipValue}>
                {formatCurrency(candles[tooltip.index].open)}
              </Text>
            </View>
            <View style={styles.tooltipRow}>
              <Text style={styles.tooltipLabel}>High:</Text>
              <Text style={styles.tooltipValue}>
                {formatCurrency(candles[tooltip.index].high)}
              </Text>
            </View>
            <View style={styles.tooltipRow}>
              <Text style={styles.tooltipLabel}>Low:</Text>
              <Text style={styles.tooltipValue}>
                {formatCurrency(candles[tooltip.index].low)}
              </Text>
            </View>
            <View style={styles.tooltipRow}>
              <Text style={styles.tooltipLabel}>Close:</Text>
              <Text
                style={[
                  styles.tooltipValue,
                  {
                    color:
                      candles[tooltip.index].close >=
                      candles[tooltip.index].open
                        ? bullColor
                        : bearColor,
                  },
                ]}
              >
                {formatCurrency(candles[tooltip.index].close)}
              </Text>
            </View>
            <View style={styles.tooltipRow}>
              <Text style={styles.tooltipLabel}>Volume:</Text>
              <Text style={styles.tooltipValue}>
                {Number(candles[tooltip.index].volume).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Legend/Controls */}
        <View style={styles.legend}>
          <TouchableOpacity
            style={[styles.legendItem, showMA ? styles.legendItemActive : {}]}
            onPress={() => setShowMA(!showMA)}
          >
            <View
              style={[styles.legendColor, { backgroundColor: theme.accent }]}
            />
            <Text style={{ color: theme.text, fontSize: 10 }}>
              MA({MA_PERIOD})
            </Text>
          </TouchableOpacity>
          {/* Neuer Button: Toggle für Theme-Farben */}
          <TouchableOpacity
            style={[styles.legendItem, useThemeColors ? styles.legendItemActive : {}]}
            onPress={() => setUseThemeColors(!useThemeColors)}
          >
            <View style={[styles.legendColor, { backgroundColor: theme.accent }]} />
            <Text style={{ color: theme.text, fontSize: 10 }}>Theme Colors</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "transparent",
    paddingBottom: 10,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  enhancedTooltip: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 8,
    padding: 0,
    width: 150,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  legend: {
    position: "absolute",
    top: 10,
    right: 15,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    padding: 4,
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
});


