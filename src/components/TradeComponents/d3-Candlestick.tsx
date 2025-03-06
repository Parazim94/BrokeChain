import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
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
  Platform,
} from "react-native";
import Svg, { Rect, Line, Text as SvgText, G, Circle } from "react-native-svg";
import * as d3Scale from "d3-scale";
import { format } from "date-fns";
import { ThemeContext } from "@/src/context/ThemeContext";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { useData } from "@/src/context/DataContext";
import { createChartStyles } from "@/src/components/TradeComponents/sharedstyles";

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

// Hilfsfunktion zum Umrechnen des Intervalls in Millisekunden
function intervalToMs(interval: string): number {
  const num = parseFloat(interval);
  if (interval.endsWith("s")) return num * 1000;
  if (interval.endsWith("m")) return num * 60 * 1000;
  if (interval.endsWith("h")) return num * 60 * 60 * 1000;
  if (interval.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  if (interval.endsWith("w")) return num * 7 * 24 * 60 * 60 * 1000;
  if (interval.endsWith("M")) return num * 30 * 24 * 60 * 60 * 1000;
  return 60000; // Standard: 1 Minute
}

// Neue Hilfsfunktion: Prüft, ob ein neues Intervall begonnen hat
function shouldStartNewInterval(
  currentTimestamp: number, 
  lastIntervalStart: number, 
  intervalString: string
): boolean {
  const intervalMs = intervalToMs(intervalString);
  // Bei 5s-Intervallen sofort neue Candles erstellen (Demo-Zwecke)
  if (intervalString === "5s") {
    return currentTimestamp - lastIntervalStart >= intervalMs;
  }
  
  // Bei längeren Intervallen auf das tatsächliche Intervall-Ende warten
  const now = new Date();
  const lastIntervalDate = new Date(lastIntervalStart);
  
  if (intervalString.endsWith("m")) {
    const minutes = parseInt(intervalString);
    return now.getMinutes() % minutes === 0 && 
           now.getMinutes() !== lastIntervalDate.getMinutes();
  }
  
  if (intervalString.endsWith("h")) {
    const hours = parseInt(intervalString);
    return now.getHours() % hours === 0 && 
           now.getHours() !== lastIntervalDate.getHours() && 
           now.getMinutes() === 0;
  }
  
  if (intervalString.endsWith("d")) {
    return now.getDate() !== lastIntervalDate.getDate();
  }
  
  // Fallback auf simple Zeitdifferenzprüfung
  return currentTimestamp - lastIntervalStart >= intervalMs;
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
  // Neuer Prop: livePrice zur Simulation der aktuellen Candle
  livePrice?: number;
}

// Binance-ähnliche Candle-Simulation
export default function D3CandlestickChart({
  symbol,
  interval,
  width = Dimensions.get("window").width * 0.95,
  height = 300,
  livePrice, // neuer Parameter
}: CandlestickChartProps) {
  const { theme } = useContext(ThemeContext);
  const chartStyles = createChartStyles(theme);
  const { getHistoricalCandleData } = useData(); // Jetzt nutzt der Chart den DataContext
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

  // Neue Refs für die Candle-Simulation
  const lastUpdateTime = useRef<number>(0);
  const currentCandleStartTime = useRef<number>(0);
  const accumulatedVolume = useRef<number>(0);
  const previousPrice = useRef<number | null>(null);

  // Configuration
  const CHART_HEIGHT = Math.round(height * 0.8);
  const VOLUME_HEIGHT = Math.round(height * 0.15);
  const MARGIN = { top: 10, right: 10, bottom: 10, left: 60 };
  const INNER_WIDTH = width - MARGIN.left - MARGIN.right ;
  const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Moving average period
  const MA_PERIOD = 20;

  // Verwenden Sie ausschließlich getHistoricalCandleData aus dem DataContext:
  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      setSelectedCandle(null);
      setSelectedIndex(null);
      try {
        const data = await getHistoricalCandleData(symbol, interval);
        console.log(`Fetched ${data.length} candles for ${symbol} with interval ${interval}`);
        
        if (data.length > 0) {
          const lastCandle = data[data.length - 1];
          const now = Date.now();
          const intervalMs = intervalToMs(interval);
          
          // Berechne den Start der aktuellen Candle
          let currentCandleTime: number;
          
          if (interval === "1s") {
            currentCandleTime = Math.floor(now / intervalMs) * intervalMs;
            if (now - lastCandle.timestamp > intervalMs * 2) {
              console.log(`Last candle too old (${new Date(lastCandle.timestamp).toISOString()}), creating new one at ${new Date(currentCandleTime).toISOString()}`);
              const newCandle: CandleData = {
                timestamp: currentCandleTime,
                open: lastCandle.close,
                high: lastCandle.close,
                low: lastCandle.close,
                close: lastCandle.close,
                volume: 0,
              };
              data.push(newCandle);
            } else if (lastCandle.timestamp > currentCandleTime - intervalMs) {
              currentCandleTime = lastCandle.timestamp;
              console.log(`Using last candle timestamp: ${new Date(currentCandleTime).toISOString()}`);
            }
          } else {
            // Bei längeren Intervallen: basierend auf der aktuellen Zeit
            const date = new Date();
            if (interval.endsWith("m")) {
              const minutes = parseInt(interval);
              date.setMinutes(Math.floor(date.getMinutes() / minutes) * minutes, 0, 0);
            } else if (interval.endsWith("h")) {
              const hours = parseInt(interval);
              date.setHours(Math.floor(date.getHours() / hours) * hours, 0, 0, 0);
            } else if (interval.endsWith("d")) {
              date.setHours(0, 0, 0, 0);
            }
            currentCandleTime = date.getTime();
            
            // Wenn der Zeitpunkt der letzten Candle älter ist als der Start des aktuellen Intervalls
            // dann eine neue Candle erstellen
            if (lastCandle.timestamp < currentCandleTime) {
              console.log(`Creating new candle at ${new Date(currentCandleTime).toISOString()}`);
              const newCandle: CandleData = {
                timestamp: currentCandleTime,
                open: lastCandle.close,
                high: lastCandle.close,
                low: lastCandle.close,
                close: lastCandle.close,
                volume: 0,
              };
              data.push(newCandle);
            } else {
              // Die letzte Candle ist noch aktuell
              currentCandleTime = lastCandle.timestamp;
              console.log(`Using existing candle from ${new Date(currentCandleTime).toISOString()}`);
            }
          }
          
          // Speichern Sie den Zeitpunkt und den ersten Preis für die aktuelle Candle
          currentCandleStartTime.current = currentCandleTime;
          previousPrice.current = lastCandle.close;
        }
        
        setCandles(data);
      } catch (error) {
        console.error("Error fetching candlestick data:", error);
        setCandles([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandles();
    
    // Timer für die Überprüfung neuer Candles
    const checkCandleInterval = setInterval(() => {
      const now = Date.now();
      
      // Nur weitermachen, wenn wir Candles haben und der currentCandleStartTime gesetzt ist
      if (candles.length === 0 || currentCandleStartTime.current === 0) return;
      
      // Überprüfen, ob eine neue Candle gestartet werden sollte
      if (shouldStartNewInterval(now, currentCandleStartTime.current, interval)) {
        console.log(`Creating new candle at ${new Date().toISOString()} for interval ${interval}`);
        
        setCandles(prev => {
          if (prev.length === 0) return prev;
          
          const lastCandle = prev[prev.length - 1];
          let newStartTime;
          
          if (interval === "5s") {
            newStartTime = currentCandleStartTime.current + intervalToMs(interval);
          } else {
            // Bei längeren Intervallen: nächstes volles Intervall
            const date = new Date();
            if (interval.endsWith("m")) {
              const minutes = parseInt(interval);
              date.setMinutes(Math.ceil(date.getMinutes() / minutes) * minutes, 0, 0);
            } else if (interval.endsWith("h")) {
              const hours = parseInt(interval);
              date.setHours(Math.ceil(date.getHours() / hours) * hours, 0, 0, 0);
            } else if (interval.endsWith("d")) {
              date.setDate(date.getDate() + 1);
              date.setHours(0, 0, 0, 0);
            }
            newStartTime = date.getTime();
          }
          
          // Speichere den neuen Startpunkt
          currentCandleStartTime.current = newStartTime;
          
          // Verwende ausschließlich den Close der letzten Candle
          const newCandle: CandleData = {
            timestamp: newStartTime,
            open: lastCandle.close,
            high: lastCandle.close,
            low: lastCandle.close,
            close: lastCandle.close,
            volume: 0,
          };
          
          accumulatedVolume.current = 0;
          
          return [...prev, newCandle];
        });
      }
    }, 1000);
    
    return () => clearInterval(checkCandleInterval);
  }, [symbol, interval, getHistoricalCandleData]);

  // Vereinfachte LivePrice-Aktualisierung - nur ein useEffect für die Candle-Updates
  useEffect(() => {
    if (livePrice != null && candles.length > 0) {
      // Simuliere Volumen basierend auf Preisveränderungen
      if (previousPrice.current !== null) {
        const priceDiff = Math.abs(livePrice - previousPrice.current);
        accumulatedVolume.current += priceDiff * 100; // Einfache Simulation
      }ges = useMemo(() => {
      
      setCandles(prev => {
        if (prev.length === 0) return prev;
        
        const lastIndex = prev.length - 1;
        const lastCandle = { ...prev[lastIndex] };or (let j = 0; j < MA_PERIOD; j++) {
          sum += candles[i - j].close;
        // Aktualisiere die letzte Candle mit dem neuen Preis
        lastCandle.close = livePrice;
        lastCandle.high = Math.max(lastCandle.high, livePrice);index: i,
        lastCandle.low = Math.min(lastCandle.low, livePrice);
        
        // Erhöhe das Volumen
        lastCandle.volume += accumulatedVolume.current / 1000;
        
        // Erstelle ein neues Array mit der aktualisierten Candle
        const newCandles = [...prev];
        newCandles[lastIndex] = lastCandle;rn (
        es.loadingContainer, { height }]}>
        // Speichere den aktuellen Preis für die nächste Aktualisierung>
        previousPrice.current = livePrice;<Text style={{ color: theme.text, marginTop: 10 }}>
        
        return newCandles;
      });
      
      // Setze das akkumulierte Volumen zurück nach jeder Aktualisierung
      accumulatedVolume.current = 0;
    }ndles.length === 0) {
  }, [livePrice]);
ew style={[chartStyles.loadingContainer, { height }]}>
  // Calculate moving averages  <Text style={{ color: theme.text }}>No data available</Text>
  const movingAverages = useMemo(() => {
    if (candles.length < MA_PERIOD) return [];

    const result = [];
    for (let i = MA_PERIOD - 1; i < candles.length; i++) {  // Bestimme die Farben: Standard oder abhängig vom theme.accent
      let sum = 0;lors ? adjustColor(theme.accent, 80) : "#4CAF50";
      for (let j = 0; j < MA_PERIOD; j++) {ustColor(theme.accent, -40) : "#F44336";
        sum += candles[i - j].close;
      }  // Calculate price range and scales
      result.push({ndles.flatMap((c) => [c.open, c.close, c.high, c.low]);
        index: i,
        value: sum / MA_PERIOD, Math.max(...allPrices);
      }); * 0.1; // Add 10% margin
    }
    return result;lculate volume range
  }, [candles]);andles.map((c) => c.volume);
 = Math.max(...volumes);
  if (loading) {
    return (te scale for Y-axis (price)
      <View style={[chartStyles.loadingContainer, { height }]}>st yScale = d3Scale
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Price - priceMargin, maxPrice + priceMargin])
          Loading chart data...    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]);
        </Text>
      </View>scale for Y-axis (volume)
    );
  }

  if (candles.length === 0) {tom, CHART_HEIGHT]);
    return (
      <View style={[chartStyles.loadingContainer, { height }]}>cale for X-axis
        <Text style={{ color: theme.text }}>No data available</Text>t xScale = d3Scale
      </View> .scaleBand()
    );    .domain(candles.map((_, i) => i.toString()))
  }h - MARGIN.right])
(0.2);
  // Bestimme die Farben: Standard oder abhängig vom theme.accent
  const bullColor = useThemeColors ? adjustColor(theme.accent, 80) : "#4CAF50";
  const bearColor = useThemeColors ? adjustColor(theme.accent, -40) : "#F44336";s = d3Scale
caleLinear()
  // Calculate price range and scales .domain([minPrice - priceMargin, maxPrice + priceMargin])
  const allPrices = candles.flatMap((c) => [c.open, c.close, c.high, c.low]);    .ticks(5);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceMargin = (maxPrice - minPrice) * 0.1; // Add 10% margin
    if (index < 0 || index >= candles.length) return "";
  // Calculate volume rangeex].timestamp);
  const volumes = candles.map((c) => c.volume);
  const maxVolume = Math.max(...volumes);

  // Create scale for Y-axis (price)
  const yScale = d3Scale    return format(date, formatString);
    .scaleLinear()
    .domain([minPrice - priceMargin, maxPrice + priceMargin])
    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]); to avoid crowding)
  const xLabels = candles
  // Create scale for Y-axis (volume)
  const yVolumeScale = d3Scaleath.ceil(candles.length / 6) === 0);
    .scaleLinear()
    .domain([0, maxVolume])ick zu unterscheiden
    .range([height - MARGIN.bottom, CHART_HEIGHT]);Persistent = false) {
    const { locationX } = event.nativeEvent;
  // Create scale for X-axis
  const xScale = d3Scaletouch position
    .scaleBand() locationX - MARGIN.left;
    .domain(candles.map((_, i) => i.toString()))ER_WIDTH / candles.length;
    .range([MARGIN.left, width - MARGIN.right])idth);
    .padding(0.2);
approxIndex < candles.length) {
  // Calculate tick values for Y-axisdles[approxIndex];
  const yTicks = d3ScalexScale(approxIndex.toString())! + xScale.bandwidth() / 2;
    .scaleLinear()
    .domain([minPrice - priceMargin, maxPrice + priceMargin])Visible: true });
    .ticks(5);
      // Beim Klicken (isPersistent=true) die ausgewählte Candle setzen
  // Format dates for X-axis labels anpassen:
  const getDateLabel = (index: number): string => {e(candle);
    if (index < 0 || index >= candles.length) return "";dIndex(approxIndex);
    const date = new Date(candles[index].timestamp);
    let formatString = "MMM d"; // Standardformat
    if (interval === "5s") {  }
      formatString = "HH:mm";
    }l bei Klick
    return format(date, formatString);
  };

  // Get X-axis labels (show fewer labels to avoid crowding)t) => handleTouch(evt),
  const xLabels = candles => handleTouch(evt),
    .map((_, i) => i)nPanResponderRelease: (evt) => {
    .filter((i) => i % Math.ceil(candles.length / 6) === 0);ln und ausgewählte Candle setzen
  handleTouch(evt, true);
  // Geänderte handleTouch-Funktion, um zwischen Touch und Klick zu unterscheiden      // Tooltip temporär ausblenden
  function handleTouch(event: GestureResponderEvent, isPersistent = false) {
    const { locationX } = event.nativeEvent;ooltip, isVisible: false });
 => setTooltip(null), 500);
    // Find nearest candle to touch position
    const chartX = locationX - MARGIN.left;    },
    const candleWidth = INNER_WIDTH / candles.length;
    const approxIndex = Math.floor(chartX / candleWidth);

    if (approxIndex >= 0 && approxIndex < candles.length) {    <View style={{  margin: "auto", marginTop: 10 }}>
      const candle = candles[approxIndex];ontainerStyle={{ minWidth: width }}>
      const x = xScale(approxIndex.toString())! + xScale.bandwidth() / 2; {...panResponder.panHandlers}>
      const y = yScale(candle.close);
      setTooltip({ index: approxIndex, x, y, isVisible: true });
                  {yTicks.map((tick) => (
      // Beim Klicken (isPersistent=true) die ausgewählte Candle setzen
      if (isPersistent) {
        setSelectedCandle(candle);
        setSelectedIndex(approxIndex);
      }
    }          y2={yScale(tick)}
  }
th={0.5}
  // PanResponder für temporären Tooltip und Auswahl bei Klick,3"
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,     ))}
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handleTouch(evt),         {/* Y-axis labels */}
    onPanResponderMove: (evt) => handleTouch(evt),            {yTicks.map((tick) => (
    onPanResponderRelease: (evt) => {
      // Bei Release als Klick behandeln und ausgewählte Candle setzen
      handleTouch(evt, true);
      // Tooltip temporär ausblenden
      if (tooltip) {
        setTooltip({ ...tooltip, isVisible: false });
        setTimeout(() => setTooltip(null), 500);ddle"
      }
    },
  });)}
ext>
  return (
    <View style={{  margin: "auto", marginTop: 10 }}>
      <ScrollView horizontal={true} contentContainerStyle={{ minWidth: width }}>     {/* X-axis labels */}
        <View style={chartStyles.container} {...panResponder.panHandlers}>      {xLabels.map((i) => (
          <Svg width={width} height={height}>         <SvgText
            {/* Grid lines */}                key={`date-${i}`}
            {yTicks.map((tick) => (      x={xScale(i.toString())! + xScale.bandwidth() / 2}
              <Line
                key={`grid-${tick}`}
                x1={MARGIN.left}
                y1={yScale(tick)}
                x2={width - MARGIN.right}xt}
                y2={yScale(tick)}
                stroke={`${theme.text}20`}tDateLabel(i)}
                strokeWidth={0.5}
                strokeDasharray="3,3"
              />
            ))}
 i) => {
            {/* Y-axis labels */}))!;
            {yTicks.map((tick) => (andle.close >= candle.open;
              <SvgTextullish
                key={`label-${tick}`}? `${bullColor}40` // Semi-transparent green for bullish
                x={MARGIN.left - 5} : `${bearColor}40`; // Semi-transparent red for bearish
                y={yScale(tick)}
                fontSize="10"
                textAnchor="end"
                alignmentBaseline="middle"{`vol-${i}`}
                fill={theme.text}
              >andle.volume)}
                {formatCurrency(tick)}bandwidth()}
              </SvgText>lumeScale(0) - yVolumeScale(candle.volume)}
            ))}lor}

            {/* X-axis labels */}
            {xLabels.map((i) => (
              <SvgText
                key={`date-${i}`}icks */}
                x={xScale(i.toString())! + xScale.bandwidth() / 2}ndles.map((candle, i) => {
                y={CHART_HEIGHT - MARGIN.bottom + 20}              const x = xScale(i.toString())!;
                fontSize="9"andle.close >= candle.open;
                textAnchor="middle" isBullish ? bullColor : bearColor;
                alignmentBaseline="middle"
                fill={theme.text}erung für ausgewählte Candle und aktuelle Candle
              >
                {getDateLabel(i)}ength - 1;
              </SvgText>
            ))}elle und ausgewählte Candle
ed ? 2 : isCurrentCandle ? 1.5 : 1;
            {/* Volume bars */}isSelected 
            {candles.map((candle, i) => { ? { strokeWidth: 2, stroke: "black" } 
              const x = xScale(i.toString())!; 
              const isBullish = candle.close >= candle.open;rokeWidth: 1.5, strokeDasharray: "2,1" } 
              const volumeColor = isBullish   : {};
                ? `${bullColor}40` // Semi-transparent green for bullish
                : `${bearColor}40`; // Semi-transparent red for bearishfür die aktuelle Candle

              return (
                <Rectopen}, High: ${candle.high}, Low: ${candle.low}, Close: ${candle.close}`
                  key={`vol-${i}`}
                  x={x}
                  y={yVolumeScale(candle.volume)}
                  width={xScale.bandwidth()}              return (
                  height={yVolumeScale(0) - yVolumeScale(candle.volume)}={`candle-${i}`}>
                  fill={volumeColor} Wick */}
                />
              );{x + xScale.bandwidth() / 2}
            })}2}

            {/* Candlesticks */}
            {candles.map((candle, i) => {lor}
              const x = xScale(i.toString())!;  strokeWidth={strokeWidth}
              const isBullish = candle.close >= candle.open;    {...extraProps}
              const candleColor = isBullish ? bullColor : bearColor;   />
              
              // Verstärkte Markierung für ausgewählte Candle und aktuelle Candle
              const isSelected = selectedIndex === i;
              const isCurrentCandle = i === candles.length - 1;
              lose))}
              // Stile für die aktuelle und ausgewählte Candle
              const strokeWidth = isSelected ? 2 : isCurrentCandle ? 1.5 : 1;      height={Math.max(
              const extraProps = isSelected 
                ? { strokeWidth: 2, stroke: "black" } yScale(candle.close))
                : isCurrentCandle 
                  ? { strokeWidth: 1.5, strokeDasharray: "2,1" }       fill={isCurrentCandle ? `${candleColor}99` : candleColor} // Transparenter für aktive Candle
                  : {};

              // Debug-Ausgabe für die aktuelle Candle}
              if (isCurrentCandle) {
                console.log(
                  `Rendering current candle: Open: ${candle.open}, High: ${candle.high}, Low: ${candle.low}, Close: ${candle.close}`
                );usätzliche visuelle Markierungen */}
              }                  {isCurrentCandle && (

              return (.bandwidth() / 2}
                <G key={`candle-${i}`}>cale(candle.close)}
                  {/* Wick */}
                  <Line    fill={theme.accent}
                    x1={x + xScale.bandwidth() / 2}       stroke="white"
                    x2={x + xScale.bandwidth() / 2}                      strokeWidth={1}
                    y1={yScale(candle.high)}
                    y2={yScale(candle.low)}
                    stroke={candleColor}
                    strokeWidth={strokeWidth}lected && (
                    {...extraProps}
                  />2}
e)}
                  {/* Body */}
                  <Rect}
                    x={x}
                    y={yScale(Math.max(candle.open, candle.close))}1}
                    width={xScale.bandwidth()}/>
                    height={Math.max(                  )}
                      1,
                      Math.abs(yScale(candle.open) - yScale(candle.close))
                    )}
                    fill={isCurrentCandle ? `${candleColor}99` : candleColor} // Transparenter für aktive Candle
                    stroke={candleColor}
                    strokeDasharray={isCurrentCandle ? "2,1" : undefined}.length > 0 && (
                    strokeWidth={strokeWidth}
                    {...extraProps}
                  />i === 0) return null;
                  
                  {/* Zusätzliche visuelle Markierungen */}
                  {isCurrentCandle && (
                    <Circle
                      cx={x + xScale.bandwidth() / 2}
                      cy={yScale(candle.close)}    xScale(prevPoint.index.toString())! +
                      r={3}      xScale.bandwidth() / 2
                      fill={theme.accent}
                      stroke="white"int.value)}
                      strokeWidth={1}
                    />)! + xScale.bandwidth() / 2
                  )}
                  Scale(point.value)}
                  {isSelected && (t} // Orange color for MA line
                    <Circle}
                      cx={x + xScale.bandwidth() / 2}
                      cy={yScale(candle.close)}
                      r={4}
                      fill={theme.accent}
                      stroke="white"
                      strokeWidth={1}
                    />art and volume chart */}
                  )}
                </G>ft}
              );
            })}ht}

            {/* Moving Average Line */}`${theme.text}40`}
            {showMA && movingAverages.length > 0 && (Width={0.5}
              <G>
                {movingAverages.map((point, i) => {
                  if (i === 0) return null; Volume label */}
                  const prevPoint = movingAverages[i - 1];            <SvgText
                  return (
                    <LineT) / 2}
                      key={`ma-${i}`}tSize="8"
                      x1={
                        xScale(prevPoint.index.toString())! +
                        xScale.bandwidth() / 2
                      }
                      y1={yScale(prevPoint.value)}
                      x2={
                        xScale(point.index.toString())! + xScale.bandwidth() / 2
                      }
                      y2={yScale(point.value)}
                      stroke={theme.accent} // Orange color for MA lineooltip.isVisible && (
                      strokeWidth={2}
                    />
                  );
                })}
              </G>5, width - 150),
            )}

            {/* Horizontal separator between price chart and volume chart */}
            <Line
              x1={MARGIN.left} style={chartStyles.tooltipHeader}>
              y1={CHART_HEIGHT}ext style={chartStyles.tooltipTitle}>
              x2={width - MARGIN.right}    {format(
              y2={CHART_HEIGHT}                    new Date(candles[tooltip.index].timestamp),
              stroke={`${theme.text}40`}
              strokeWidth={0.5} )}
            />

            {/* Volume label */}tooltipRow}>
            <SvgTextartStyles.tooltipLabel}>Open:</Text>
              x={MARGIN.left - 5}.tooltipValue}>
              y={CHART_HEIGHT + (height - CHART_HEIGHT) / 2}cy(candles[tooltip.index].open)}
              fontSize="8"  </Text>
              textAnchor="end"              </View>
              alignmentBaseline="middle"Styles.tooltipRow}>
              fill={theme.text}t style={chartStyles.tooltipLabel}>High:</Text>
            >tStyles.tooltipValue}>
              VOLUMEh)}
            </SvgText>
          </Svg>
ooltipRow}>
          {/* Enhanced Tooltip */}artStyles.tooltipLabel}>Low:</Text>
          {tooltip && tooltip.isVisible && (   <Text style={chartStyles.tooltipValue}>
            <ViewormatCurrency(candles[tooltip.index].low)}
              style={[>
                chartStyles.enhancedTooltip,View>
                {              <View style={chartStyles.tooltipRow}>
                  left: Math.min(tooltip.x - 75, width - 150),Styles.tooltipLabel}>Close:</Text>
                  top: Math.min(tooltip.y - 70, CHART_HEIGHT - 140),
                }, style={[
              ]}artStyles.tooltipValue,
            >
              <View style={chartStyles.tooltipHeader}>     color:
                <Text style={chartStyles.tooltipTitle}>
                  {format(
                    new Date(candles[tooltip.index].timestamp),        ? bullColor
                    "MMM d, yyyy HH:mm"          : bearColor,
                  )}       },
                </Text>
              </View>
              <View style={chartStyles.tooltipRow}>urrency(candles[tooltip.index].close)}
                <Text style={chartStyles.tooltipLabel}>Open:</Text>
                <Text style={chartStyles.tooltipValue}>
                  {formatCurrency(candles[tooltip.index].open)}style={chartStyles.tooltipRow}>
                </Text>tyle={chartStyles.tooltipLabel}>Volume:</Text>
              </View> style={chartStyles.tooltipValue}>
              <View style={chartStyles.tooltipRow}>lume).toLocaleString()}
                <Text style={chartStyles.tooltipLabel}>High:</Text>
                <Text style={chartStyles.tooltipValue}>
                  {formatCurrency(candles[tooltip.index].high)}
                </Text>
              </View>
              <View style={chartStyles.tooltipRow}>
                <Text style={chartStyles.tooltipLabel}>Low:</Text>
                <Text style={chartStyles.tooltipValue}>
                  {formatCurrency(candles[tooltip.index].low)}les.legendItemActive : {}]}
                </Text>() => setShowMA(!showMA)}
              </View>
              <View style={chartStyles.tooltipRow}>
                <Text style={chartStyles.tooltipLabel}>Close:</Text>: theme.accent }]}
                <Text
                  style={[}>
                    chartStyles.tooltipValue,PERIOD})
                    {
                      color:
                        candles[tooltip.index].close >=
                        candles[tooltip.index].openeOpacity
                          ? bullColortStyles.legendItem, useThemeColors ? chartStyles.legendItemActive : {}]}
                          : bearColor,s(!useThemeColors)}
                    },
                  ]}chartStyles.legendColor, { backgroundColor: theme.accent }]} />
                >e: 10 }}>Theme Colors</Text>
                  {formatCurrency(candles[tooltip.index].close)}
                </Text>
              </View>
              <View style={chartStyles.tooltipRow}>
                <Text style={chartStyles.tooltipLabel}>Volume:</Text>
                <Text style={chartStyles.tooltipValue}>ente Datenanzeige unter dem Chart */}
                  {Number(candles[tooltip.index].volume).toLocaleString()}
                </Text>hartStyles.dataDisplay, { 
              </View>olor: `${theme.accent}15`, 
            </View>
          )}

          {/* Legend/Controls */}
          <View style={chartStyles.legend}>chartStyles.dataHeader}>
            <TouchableOpacityle={[chartStyles.dataTitle, { color: theme.accent }]}>
              style={[chartStyles.legendItem, showMA ? chartStyles.legendItemActive : {}]}wählte Candle
              onPress={() => setShowMA(!showMA)}</Text>
            >            <Text style={[chartStyles.dataSubtitle, { color: theme.text }]}>
              <ViewlectedCandle?.timestamp || 0), "dd.MM.yyyy HH:mm")}
                style={[chartStyles.legendColor, { backgroundColor: theme.accent }]}
              />
              <Text style={{ color: theme.text, fontSize: 10 }}>
                MA({MA_PERIOD})
              </Text>View style={chartStyles.dataGridItem}>
            </TouchableOpacity> style={[chartStyles.dataLabel, { color: theme.text }]}>Open</Text>
            {/* Neuer Button: Toggle für Theme-Farben */}
            <TouchableOpacity{formatCurrency(selectedCandle?.open || 0)}
              style={[chartStyles.legendItem, useThemeColors ? chartStyles.legendItemActive : {}]}
              onPress={() => setUseThemeColors(!useThemeColors)}
            >
              <View style={[chartStyles.legendColor, { backgroundColor: theme.accent }]} />tyles.dataGridItem}>
              <Text style={{ color: theme.text, fontSize: 10 }}>Theme Colors</Text>r: theme.text }]}>High</Text>
            </TouchableOpacity>hartStyles.dataValue, { color: bullColor }]}>
          </View>
        </View>
      </ScrollView>/View>
      
      {/* Persistente Datenanzeige unter dem Chart */}
      {selectedCandle && (rtStyles.dataLabel, { color: theme.text }]}>Low</Text>
        <View style={[chartStyles.dataDisplay, { xt style={[chartStyles.dataValue, { color: bearColor }]}>
          backgroundColor: `${theme.accent}15`,  {formatCurrency(selectedCandle?.low || 0)}
          borderColor: `${theme.accent}40`,t>
          marginHorizontal: 10,      </View>
          marginTop: 8
        }]}>hartStyles.dataGridItem}>
          <View style={chartStyles.dataHeader}>, { color: theme.text }]}>Close</Text>
            <Text style={[chartStyles.dataTitle, { color: theme.accent }]}>e, { 
              Ausgewählte Candlese || 0) >= (selectedCandle?.open || 0) ? bullColor : bearColor,
            </Text>ld"
            <Text style={[chartStyles.dataSubtitle, { color: theme.text }]}>
              {format(new Date(selectedCandle?.timestamp || 0), "dd.MM.yyyy HH:mm")}    {formatCurrency(selectedCandle?.close || 0)}
            </Text>
          </View>
          
          <View style={chartStyles.dataGrid}>
            <View style={chartStyles.dataGridItem}>
              <Text style={[chartStyles.dataLabel, { color: theme.text }]}>Open</Text>t>
              <Text style={[chartStyles.dataValue, { color: theme.text }]}>tyle={[chartStyles.dataValue, { 
                {formatCurrency(selectedCandle?.open || 0)}or: (selectedCandle?.close || 0) >= (selectedCandle?.open || 0) ? bullColor : bearColor
              </Text>  }]}>
            </View> - (selectedCandle?.open || 0)).toFixed(2))} $
            electedCandle?.open || 0)) / (selectedCandle?.open || 1) * 100).toFixed(2)}%)
            <View style={chartStyles.dataGridItem}>
              <Text style={[chartStyles.dataLabel, { color: theme.text }]}>High</Text>
              <Text style={[chartStyles.dataValue, { color: bullColor }]}>
                {formatCurrency(selectedCandle?.high || 0)}={chartStyles.dataRow}>
              </Text>tyle={[chartStyles.dataLabel, { color: theme.text }]}>Volumen</Text>
            </View><Text style={[chartStyles.dataValue, { color: theme.text }]}>
            leString()}
            <View style={chartStyles.dataGridItem}>
              <Text style={[chartStyles.dataLabel, { color: theme.text }]}>Low</Text>
              <Text style={[chartStyles.dataValue, { color: bearColor }]}>
                {formatCurrency(selectedCandle?.low || 0)}
              </Text>
            </View>
            
            <View style={chartStyles.dataGridItem}>
              <Text style={[chartStyles.dataLabel, { color: theme.text }]}>Close</Text>
              <Text style={[chartStyles.dataValue, {                 color: (selectedCandle?.close || 0) >= (selectedCandle?.open || 0) ? bullColor : bearColor,                fontWeight: "bold"              }]}>                {formatCurrency(selectedCandle?.close || 0)}              </Text>            </View>          </View>                    <View style={chartStyles.dataRow}>            <Text style={[chartStyles.dataLabel, { color: theme.text }]}>Change</Text>            <Text style={[chartStyles.dataValue, {               color: (selectedCandle?.close || 0) >= (selectedCandle?.open || 0) ? bullColor : bearColor            }]}>              {(((selectedCandle?.close || 0) - (selectedCandle?.open || 0)).toFixed(2))} $              ({(((selectedCandle?.close || 0) - (selectedCandle?.open || 0)) / (selectedCandle?.open || 1) * 100).toFixed(2)}%)            </Text>          </View>                    <View style={chartStyles.dataRow}>            <Text style={[chartStyles.dataLabel, { color: theme.text }]}>Volumen</Text>            <Text style={[chartStyles.dataValue, { color: theme.text }]}>              {(selectedCandle?.volume || 0).toLocaleString()}            </Text>          </View>        </View>      )}    </View>  );}