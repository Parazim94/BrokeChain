import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  View,
  Text,
  PanResponder,
  GestureResponderEvent,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import Svg, { Rect, Line, Text as SvgText, G, Circle } from "react-native-svg";
import * as d3Scale from "d3-scale";
import { format } from "date-fns";
import { ThemeContext } from "@/src/context/ThemeContext";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { useData } from "@/src/context/DataContext";
import { createChartStyles } from "@/src/components/TradeComponents/sharedstyles";
import Card from "@/src/components/UiComponents/Card";
import { Ionicons } from "@expo/vector-icons";

// Neue helper-Funktion: adjustColor zum Anpassen der Helligkeit einer Hex-Farbe
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
  data?: CandleData[]; 
}

export default function D3CandlestickChart({
  symbol,
  interval,
  width = Dimensions.get("window").width * 0.95,
  height = 300,
  data, 
}: CandlestickChartProps) {
  const { theme } = useContext(ThemeContext);
  const styles = createChartStyles(theme);
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
  
  // Neuer State für die ausgewählte Candle
  const [selectedCandle, setSelectedCandle] = useState<CandleData | null>(null);
  // Neuer State für den Index der ausgewählten Candle (für Markierung)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Configuration
  const CHART_HEIGHT = Math.round(height * 0.8);
  const VOLUME_HEIGHT = Math.round(height * 0.15);
  const MARGIN = { top: 10, right: 10, bottom: 10, left: 60 };
  const INNER_WIDTH = width - MARGIN.left - MARGIN.right ;
  const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Moving average period
  const MA_PERIOD = 20;

  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      // Bei Änderung des Symbols oder Intervalls die Auswahl zurücksetzen
      setSelectedCandle(null);
      setSelectedIndex(null);
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

  // Wenn externe Daten übergeben werden, diese verwenden
  useEffect(() => {
    if (data && data.length > 0) {
      setCandles(data);
      setLoading(false);
    }
  }, [data]);

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
    .range([MARGIN.left, width - MARGIN.right])
    .padding(0.2);

  // Calculate tick values for Y-axis
  const yTicks = d3Scale
    .scaleLinear()
    .domain([minPrice - priceMargin, maxPrice + priceMargin])
    .ticks(5);

  // Format dates for X-axis labels
  const getDateLabel = (index: number): string => {
    if (index < 0 || index >= candles.length) return "";
    // Prüfe, ob der Timestamp in Millisekunden vorliegt
    const rawTimestamp = candles[index].timestamp;
    // Falls der Zeitstempel in Sekunden vorliegt (z.B. < 1e12), multipliziere mit 1000
    const validTimestamp = rawTimestamp < 1e12 ? rawTimestamp * 1000 : rawTimestamp;
    const date = new Date(validTimestamp);
    if (isNaN(date.getTime())) {
      return ""; // Führe Safety-Check ein
    }
    return format(date, "MMM d");
  };

  // Get X-axis labels (show fewer labels to avoid crowding)
  const xLabels = candles
    .map((_, i) => i)
    .filter((i) => i % Math.ceil(candles.length / 6) === 0);

  // Geänderte handleTouch-Funktion, um zwischen Touch und Klick zu unterscheiden
  function handleTouch(event: GestureResponderEvent, isPersistent = false) {
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
      
      // Beim Klicken (isPersistent=true) die ausgewählte Candle setzen
      if (isPersistent) {
        setSelectedCandle(candle);
        setSelectedIndex(approxIndex);
      }
    }
  }

  // PanResponder für temporären Tooltip und Auswahl bei Klick
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handleTouch(evt),
    onPanResponderMove: (evt) => handleTouch(evt),
    onPanResponderRelease: (evt) => {
      // Bei Release als Klick behandeln und ausgewählte Candle setzen
      handleTouch(evt, true);
      // Tooltip temporär ausblenden
      if (tooltip) {
        setTooltip({ ...tooltip, isVisible: false });
        setTimeout(() => setTooltip(null), 500);
      }
    },
  });

  return (
    <>
      <ScrollView horizontal={true} contentContainerStyle={{ minWidth: width }}>
        <View style={styles.container} {...panResponder.panHandlers}>
          <Svg width={width} height={height}>
            {/* Grid lines */}
            {yTicks.map((tick) => (
              <Line
                key={`grid-${tick}`}
                x1={MARGIN.left}
                y1={yScale(tick)}
                x2={width - MARGIN.right}
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
                x={MARGIN.left - 5}
                y={yScale(tick)}
                fontSize="10"
                textAnchor="end"
                alignmentBaseline="middle"
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
                ? `${bullColor}40` // Semi-transparent green for bullish
                : `${bearColor}40`; // Semi-transparent red for bearish

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
              
              // Verstärkte Markierung für ausgewählte Candle
              const isSelected = selectedIndex === i;
              const strokeWidth = isSelected ? 2 : 1;
              const extraProps = isSelected 
                ? { strokeWidth: 2, stroke: "black" } 
                : {};

              return (
                <G key={`candle-${i}`}>
                  {/* Wick */}
                  <Line
                    x1={x + xScale.bandwidth() / 2}
                    x2={x + xScale.bandwidth() / 2}
                    y1={yScale(candle.high)}
                    y2={yScale(candle.low)}
                    stroke={candleColor}
                    strokeWidth={strokeWidth}
                    {...extraProps}
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
                    strokeWidth={strokeWidth}
                    {...extraProps}
                  />
                  
                  {/* Markierung für ausgewählte Candle */}
                  {isSelected && (
                    <Circle
                      cx={x + xScale.bandwidth() / 2}
                      cy={yScale(candle.close)}
                      r={4}
                      fill={theme.accent}
                      stroke="white"
                      strokeWidth={1}
                    />
                  )}
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
              x2={width - MARGIN.right}
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
      
      {/* Persistente Datenanzeige unter dem Chart */}
      {selectedCandle && (
        <View style={[
          styles.dataDisplay,
          {
            backgroundColor: `${theme.accent}15`,
            borderColor: `${theme.accent}40`,
            marginHorizontal: 10,
            marginTop: 8,
            // Für Webmodus keine Begrenzung, ansonsten alte Einstellungen
            ...(Platform.OS === "web" ? {} : { maxWidth: 768, alignSelf: "flex-start" })
          }
        ]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={[styles.dataTitle, { color: theme.accent }]}>
                Chosen Candle
              </Text>
              <Text style={[styles.dataSubtitle, { color: theme.text, marginBottom: 4 }]}>
                {format(new Date(selectedCandle.timestamp), "dd.MM.yyyy HH:mm")}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { setSelectedCandle(null); setSelectedIndex(null); }}>
              <Ionicons name="close-circle" size={24} color="red" /> 
            </TouchableOpacity>
          </View>
          
          <View style={styles.dataGrid}>
            <View style={styles.dataGridItem}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>Open</Text>
              <Text style={[styles.dataValue, { color: theme.text }]}>
                {formatCurrency(selectedCandle.open)}
              </Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>High</Text>
              <Text style={[styles.dataValue, { color: bullColor }]}>
                {formatCurrency(selectedCandle.high)}
              </Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>Low</Text>
              <Text style={[styles.dataValue, { color: bearColor }]}>
                {formatCurrency(selectedCandle.low)}
              </Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>Close</Text>
              <Text style={[styles.dataValue, { 
                color: selectedCandle.close >= selectedCandle.open ? bullColor : bearColor,
                fontWeight: "bold"
              }]}>
                {formatCurrency(selectedCandle.close)}
              </Text>
            </View>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.text }]}>Change</Text>
            <Text style={[styles.dataValue, { 
              color: selectedCandle.close >= selectedCandle.open ? bullColor : bearColor
            }]}>
              {(selectedCandle.close - selectedCandle.open).toFixed(2)+ "$"} 
              ({((selectedCandle.close - selectedCandle.open) / selectedCandle.open * 100).toFixed(2)} %)
            </Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.text }]}>Volumen</Text>
            <Text style={[styles.dataValue, { color: theme.text }]}>
              {selectedCandle.volume.toLocaleString()}
            </Text>
          </View>
        </View>
      )}
   </>
  );
}