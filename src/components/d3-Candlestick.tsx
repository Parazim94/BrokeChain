import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  Dimensions,
} from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
import * as d3Scale from "d3-scale";
import { ThemeContext } from "@/src/context/ThemeContext";

export interface CandleData {
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface CandlestickChartProps {
  symbol: string;
  interval: string;
  width?: number;
  height?: number;
}

export default function CandlestickChart({
  symbol,
  interval,
  width = Dimensions.get("window").width * 0.95,
  height = 300,
}: CandlestickChartProps) {
  const { theme } = useContext(ThemeContext);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fehler: ${response.status}`);
        const data = await response.json();
        const mapped: CandleData[] = data.map((item: any[]) => ({
          timestamp: item[0],
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));
        setCandles(mapped);
      } catch (error) {
        console.error("Fehler beim Abruf der Candlestick-Daten:", error);
        setCandles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandles();
  }, [symbol, interval]);

  if (loading || candles.length === 0) return null;

  // Errechne minimalen und maximalen Preis aus allen Kerzen
  const allPrices = candles.flatMap((c) => [c.open, c.close, c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  // d3‑Skala für die Y-Achse: Preis → Pixel
  const yScale = d3Scale
    .scaleLinear()
    .domain([minPrice, maxPrice])
    .range([height, 0]);

  // d3‑Skala für die X-Achse als scaleBand; hier nutzen wir eine gleichmäßige Verteilung
  const xScale = d3Scale
    .scaleBand()
    .domain(candles.map((_, i) => i.toString()))
    .range([0, width])
    .padding(0.2);

  // PanResponder zur Anzeige eines Tooltips beim Berühren
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      const { locationX } = event.nativeEvent;
      // Da scaleBand keine Invert-Funktion hat, approximieren wir den Index:
      const approxIndex = Math.floor((locationX * candles.length) / width);
      if (approxIndex >= 0 && approxIndex < candles.length) {
        const x = xScale(approxIndex.toString())! + xScale.bandwidth() / 2;
        const y = yScale(candles[approxIndex].close);
        setTooltip({ index: approxIndex, x, y });
      }
    },
    onPanResponderRelease: () => {
      setTimeout(() => setTooltip(null), 2000);
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Svg width={width} height={height}>
        {candles.map((candle, i) => {
          const x = xScale(i.toString())!;
          // Verwende für bullishe bzw. bearishe Kerzen eine angepasste Farbe
          const candleColor =
            candle.close >= candle.open
              ? adjustColor(theme.accent, 80)
              : adjustColor(theme.accent, -40);
          return (
            <React.Fragment key={i}>
              {/* Docht */}
              <Line
                x1={x + xScale.bandwidth() / 2}
                x2={x + xScale.bandwidth() / 2}
                y1={yScale(candle.high)}
                y2={yScale(candle.low)}
                stroke={candleColor}
                strokeWidth={1}
              />
              {/* Kerzenkörper */}
              <Rect
                x={x}
                y={yScale(Math.max(candle.open, candle.close))}
                width={xScale.bandwidth()}
                height={Math.abs(yScale(candle.open) - yScale(candle.close))}
                fill={candleColor}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      {tooltip && (
        <View
          style={[
            styles.tooltip,
            { left: tooltip.x - 50, top: tooltip.y - 40 },
          ]}
        >
          <Text style={styles.tooltipText}>
            {`O: ${candles[tooltip.index].open}\nC: ${
              candles[tooltip.index].close
            }\nH: ${candles[tooltip.index].high}\nL: ${
              candles[tooltip.index].low
            }`}
          </Text>
        </View>
      )}
    </View>
  );
}

// Hilfsfunktion zum Anpassen eines Hex-Farbwerts
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

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "transparent",
  },
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
});
