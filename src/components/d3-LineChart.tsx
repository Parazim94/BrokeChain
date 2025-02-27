import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Svg, { Polyline, Path, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import * as d3Scale from "d3-scale";
import { format } from "date-fns";
import { ThemeContext } from "@/src/context/ThemeContext";
import { useData } from "@/src/context/DataContext";

interface LineData {
  timestamp: number;
  value: number;
  volume: number;
}

interface D3LineChartProps {
  symbol: string;
  interval: string;
  width?: number;
  height?: number;
}

export default function D3LineChart({
  symbol,
  interval,
  width = Dimensions.get("window").width * 0.95,
  height = 300,
}: D3LineChartProps) {
  const { theme } = useContext(ThemeContext);
  const { getHistoricalData } = useData(); // Neu: Daten aus dem DataContext beziehen
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<{ index: number; x: number; y: number; isVisible: boolean } | null>(null);

  // Margins für Achsen
  const margin = { top: 10, right: 10, bottom: 30, left: 50 };

  // Daten von Binance laden (analog zum d3-Candlestick)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getHistoricalData(symbol, interval);
        // Umwandlung: label als Timestamp, und zusätzlich Volume extrahieren – 
        // setze voraus, dass getHistoricalData jetzt auch item.volume liefert.
        const mapped: LineData[] = data.map((item: any) => ({
          timestamp: new Date(item.label).getTime(),
          value: item.value,
          volume: item.volume ? Number(item.volume) : 0,
        }));
        setLineData(mapped);
      } catch (error) {
        console.error("Fehler beim Abruf der LineChart-Daten:", error);
        setLineData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol, interval, getHistoricalData]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { height }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading chart data...</Text>
      </View>
    );
  }
  if (lineData.length === 0) {
    return (
      <View style={[styles.loadingContainer, { height }]}>
        <Text style={{ color: theme.text }}>No data available</Text>
      </View>
    );
  }

  // Skalierung berechnen
  const effectiveWidth = width * 0.96;
  const minValue = Math.min(...lineData.map(d => d.value));
  const maxValue = Math.max(...lineData.map(d => d.value));
  const yScale = d3Scale.scaleLinear().domain([minValue, maxValue]).range([height - margin.bottom, margin.top]);
  const xScale = d3Scale.scaleLinear().domain([0, lineData.length - 1]).range([margin.left, effectiveWidth - margin.right]);

  // Punkte für Linie generieren
  const points = lineData.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(" ");
  // Pfad für Füllbereich unter der Linie
  const fillPath =
    `M ${margin.left} ${height - margin.bottom} ` +
    lineData
      .map((d, i) => `${xScale(i)} ${yScale(d.value)}`)
      .join(" ") +
    ` L ${effectiveWidth - margin.right} ${height - margin.bottom} Z`;

  // PanResponder für Tooltip
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleTouch,
    onPanResponderMove: handleTouch,
    onPanResponderRelease: () => {
      if (tooltip) {
        setTooltip({ ...tooltip, isVisible: false });
        setTimeout(() => setTooltip(null), 2000);
      }
    },
  });

  function handleTouch(event: GestureResponderEvent) {
    const { locationX } = event.nativeEvent;
    // Bestimme den Index anhand der x-Koordinate
    const idx = Math.round(
      ((locationX - margin.left) / (effectiveWidth - margin.left - margin.right)) * (lineData.length - 1)
    );
    if (idx >= 0 && idx < lineData.length) {
      const x = xScale(idx);
      const y = yScale(lineData[idx].value);
      setTooltip({ index: idx, x, y, isVisible: true });
    }
  }

  // X-Achsen-Beschriftungen in regelmäßigen Abständen
  const labelInterval = Math.max(1, Math.floor(lineData.length / 6));

  return (
    <View style={[styles.container, { width: effectiveWidth }]} {...panResponder.panHandlers}>
      <Svg width={effectiveWidth} height={height}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.accent} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* Füllbereich */}
        <Path d={fillPath} fill="url(#lineGradient)" />
        {/* Linie */}
        <Polyline points={points} fill="none" stroke={theme.accent} strokeWidth={2} />
        {/* X-Achsen-Beschriftungen */}
        {lineData.map((d, i) => {
          if (i % labelInterval === 0) {
            return (
              <SvgText
                key={i}
                x={xScale(i)}
                y={height - margin.bottom + 15}
                fontSize="10"
                fill={theme.text}
                textAnchor="middle"
              >
                {format(new Date(d.timestamp), "MMM d")}
              </SvgText>
            );
          }
          return null;
        })}
        {/* Y-Achsen-Beschriftungen für max und min */}
        <SvgText x={5} y={yScale(maxValue)} fontSize="10" fill={theme.text}>
          {maxValue.toFixed(2)}
        </SvgText>
        <SvgText x={5} y={yScale(minValue)} fontSize="10" fill={theme.text}>
          {minValue.toFixed(2)}
        </SvgText>
      </Svg>
      {tooltip && tooltip.isVisible && (
        <View style={[styles.tooltip, { left: tooltip.x - 50, top: tooltip.y - 60 }]}>
          <Text style={styles.tooltipText}>
            {`Date: ${format(new Date(lineData[tooltip.index].timestamp), "MMM d, yyyy")}\n`}
            {`Value: ${lineData[tooltip.index].value.toFixed(2)}\n`}
            {`Volume: ${Number(lineData[tooltip.index].volume).toLocaleString()}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "transparent",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
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
