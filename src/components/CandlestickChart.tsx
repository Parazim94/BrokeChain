import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent, Dimensions } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
import { ThemeContext } from "@/src/context/ThemeContext"; // Neu: ThemeContext importieren

export interface CandleData {
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

// Verwende 95% der Fensterbreite als Default
const defaultWidth = Dimensions.get("window").width * 0.95;

interface CandlestickChartProps {
  symbol: string;
  interval: string;
  width?: any;
  height?: number;
}

// Helper: Passe einen Hex-Farbcode an (positive Werte hellen, negative dunkeln)
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
  return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export default function CandlestickChart({
  symbol,
  interval,
  width = "90%",
  height = 200,
}: CandlestickChartProps) {
  const { theme } = useContext(ThemeContext);  // Theme abrufen
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<{ index: number; x: number; y: number } | null>(null);



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

  const allValues = candles.flatMap((c) => [c.open, c.close, c.high, c.low]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;
  const candleWidth = (width / candles.length) * 0.8;
  const gap = (width / candles.length) * 0.2;
  const priceToY = (price: number) =>
    height - ((price - minValue) / range) * height;
    const offsetX = (width - candles.length * (candleWidth + gap)) / 2;
  // 📌 PanResponder für Touch-Events (mit nativeEvent.locationX)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      const { locationX } = event.nativeEvent; // ✅ Fix für locationX
      const index = Math.floor(locationX / (candleWidth + gap));
      if (index >= 0 && index < candles.length) {
        setTooltip({
          index,
          x: index * (candleWidth + gap) + gap / 2 + candleWidth / 2,
          y: priceToY(candles[index].close),
        });
      }
    },
    onPanResponderRelease: () => {
      setTimeout(() => setTooltip(null), 2000); // Tooltip nach 2 Sekunden ausblenden
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Svg width={width} height={height}>
        {candles.map((candle, index) => {
          const x = index * (candleWidth + gap) + gap / 2;
          const yHigh = priceToY(candle.high);
          const yLow = priceToY(candle.low);
          const yOpen = priceToY(candle.open);
          const yClose = priceToY(candle.close);
          // Verwende die angepasste Farbe: Heller (bullish) bzw. Dunkler (bearish)
          const candleColor = candle.close >= candle.open 
            ? adjustColor(theme.accent, 80) 
            : adjustColor(theme.accent, -40);
          return (
            <React.Fragment key={index}>
              <Line
                x1={x + candleWidth / 2}
                y1={yHigh}
                x2={x + candleWidth / 2}
                y2={yLow}
                stroke={candleColor}
                strokeWidth={1}
              />
              <Rect
                x={x}
                y={Math.min(yOpen, yClose)}
                width={candleWidth}
                height={Math.abs(yOpen - yClose)}
                fill={candleColor}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {tooltip && (
        <View style={[styles.tooltip, { left: tooltip.x - 50, top: tooltip.y - 40 }]}>
          <Text style={styles.tooltipText}>
            {`O: ${candles[tooltip.index].open}\nC: ${candles[tooltip.index].close}\nH: ${candles[tooltip.index].high}\nL: ${candles[tooltip.index].low}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative",
    backgroundColor: "transparent",
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 6,
    borderRadius: 4,
    zIndex: 9999,
    gap: 4,
  },
  tooltipText: { color: "white", fontSize: 10 },
});
