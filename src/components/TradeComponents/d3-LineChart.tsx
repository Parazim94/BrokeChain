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
  Platform,
} from "react-native";
import Svg, {
  Polyline,
  Path,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
  Circle,
  Line,
} from "react-native-svg";
import * as d3Scale from "d3-scale";
import { format } from "date-fns";
import { ThemeContext } from "@/src/context/ThemeContext";
import { useData } from "@/src/context/DataContext";
import { formatCurrency } from "@/src/utils/formatCurrency";

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
  width = Dimensions.get("window").width,
  height = 300,
}: D3LineChartProps) {
  const { theme } = useContext(ThemeContext);
  const { getHistoricalData } = useData();
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<{
    index: number;
    x: number;
    y: number;
    isVisible: boolean;
  } | null>(null);

  // Neuer State für den ausgewählten Datenpunkt
  const [selectedPoint, setSelectedPoint] = useState<LineData | null>(null);

  // Margins für Achsen
  const margin = { top: 10, right: 10, bottom: 30, left: 60 };

  // Daten von Binance laden (analog zum d3-Candlestick)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Bei Änderung des Symbols oder Intervalls den ausgewählten Punkt zurücksetzen
      setSelectedPoint(null);
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
        <Text style={{ color: theme.text, marginTop: 10 }}>
          Loading chart data...
        </Text>
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
  const effectiveWidth = window.innerWidth > 768 ? width * 0.98 : width * 0.92;
  const minValue = Math.min(...lineData.map((d) => d.value));
  const maxValue = Math.max(...lineData.map((d) => d.value));
  const yScale = d3Scale
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([height - margin.bottom, margin.top]);

  // Neue Tick-Werte für die Y-Achse
  const yTicks = d3Scale.scaleLinear().domain([minValue, maxValue]).ticks(10);

  const xScale = d3Scale
    .scaleLinear()
    .domain([0, lineData.length - 1])
    .range([margin.left, effectiveWidth - margin.right]);

  // Punkte für Linie generieren
  const points = lineData
    .map((d, i) => `${xScale(i)},${yScale(d.value)}`)
    .join(" ");
  // Pfad für Füllbereich unter der Linie
  const fillPath =
    `M ${margin.left} ${height - margin.bottom} ` +
    lineData.map((d, i) => `${xScale(i)} ${yScale(d.value)}`).join(" ") +
    ` L ${effectiveWidth - margin.right} ${height - margin.bottom} Z`;

  // Geänderte handleTouch-Funktion, um zwischen Touch und Klick zu unterscheiden
  function handleTouch(event: GestureResponderEvent, isPersistent = false) {
    const { locationX } = event.nativeEvent;
    // Bestimme den Index anhand der x-Koordinate
    const idx = Math.round(
      ((locationX - margin.left) /
        (effectiveWidth - margin.left - margin.right)) *
        (lineData.length - 1)
    );
    if (idx >= 0 && idx < lineData.length) {
      const x = xScale(idx);
      const y = yScale(lineData[idx].value);
      setTooltip({ index: idx, x, y, isVisible: true });

      // Beim Klicken (isPersistent=true) den ausgewählten Punkt setzen
      if (isPersistent) {
        setSelectedPoint(lineData[idx]);
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
      // Bei Release als Klick behandeln und ausgewählten Punkt setzen
      handleTouch(evt, true);
      // Tooltip temporär ausblenden
      if (tooltip) {
        setTooltip({ ...tooltip, isVisible: false });
        setTimeout(() => setTooltip(null), 500);
      }
    },
  });

  // Format dates for X-axis labels, abhängig vom interval-Prop
  const getDateLabel = (index: number): string => {
    if (index < 0 || index >= lineData.length) return "";
    const date = new Date(lineData[index].timestamp);
    let formatString = "HH:mm";
    if (interval.endsWith("m")) {
      const val = parseInt(interval.slice(0, -1));
      formatString = val <= 5 ? "HH:mm" : "MMM d, HH:mm";
    } else if (interval.endsWith("h")) {
      formatString = "MMM d";
    } else {
      formatString = "MMM yyyy";
    }
    return format(date, formatString);
  };

  // X-Achsen-Beschriftungen in regelmäßigen Abständen
  const labelInterval = Math.max(1, Math.floor(lineData.length / 6));

  return (
    <View style={{ width: "100%" }}>
      <View style={styles.container} {...panResponder.panHandlers}>
        <Svg width={"100%"} height={height}>
          {/* Grid-Linien */}
          {yTicks.map((tick) => (
            <Line
              key={`grid-${tick}`}
              x1={margin.left}
              y1={yScale(tick)}
              x2={effectiveWidth - margin.right}
              y2={yScale(tick)}
              stroke={`${theme.text}20`}
              strokeWidth={0.5}
              strokeDasharray="3,3"
            />
          ))}

          <Defs>
            <LinearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.accent} stopOpacity="0.5" />
              <Stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {/* Füllbereich */}
          <Path d={fillPath} fill="url(#lineGradient)" />
          {/* Linie */}
          <Polyline
            points={points}
            fill="none"
            stroke={theme.accent}
            strokeWidth={2}
          />
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
                  {getDateLabel(i)}
                </SvgText>
              );
            }
            return null;
          })}
          {/* Y-Achsen-Beschriftungen */}
          {yTicks.map((tick) => (
            <SvgText
              key={`ytick-${tick}`}
              x={5}
              y={yScale(tick)}
              fontSize="10"
              fill={theme.text}
            >
              {tick.toFixed(2)}
            </SvgText>
          ))}

          {/* Markierung für ausgewählten Datenpunkt */}
          {selectedPoint && (
            <Circle
              cx={xScale(
                lineData.findIndex(
                  (d) => d.timestamp === selectedPoint.timestamp
                )
              )}
              cy={yScale(selectedPoint.value)}
              r={5}
              fill={theme.accent}
              stroke="white"
              strokeWidth={2}
            />
          )}
        </Svg>

        {/* Temporärer Tooltip */}
        {tooltip && tooltip.isVisible && (
          <View
            style={[
              styles.tooltip,
              { left: tooltip.x - 50, top: tooltip.y - 60 },
            ]}
          >
            <Text style={styles.tooltipText}>
              {`Date: ${format(
                new Date(lineData[tooltip.index].timestamp),
                "MMM d, yyyy HH:mm"
              )}\n`}
              {`Value: ${lineData[tooltip.index].value.toFixed(2)}`}
            </Text>
          </View>
        )}
      </View>

      {/* Persistente Datenanzeige unter dem Chart */}
      {selectedPoint && (
        <View
          style={[
            styles.dataDisplay,
            {
              backgroundColor: `${theme.accent}15`,
              borderColor: `${theme.accent}40`,
            },
          ]}
        >
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.text }]}>Date:</Text>
            <Text style={[styles.dataValue, { color: theme.text }]}>
              {format(new Date(selectedPoint.timestamp), "dd.MM.yyyy HH:mm")}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.text }]}>
              Price:
            </Text>
            <Text
              style={[
                styles.dataValue,
                { color: theme.accent, fontWeight: "bold" },
              ]}
            >
              {formatCurrency(selectedPoint.value)}
            </Text>
          </View>
          {selectedPoint.volume > 0 && (
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>
                Volumen:
              </Text>
              <Text style={[styles.dataValue, { color: theme.text }]}>
                {selectedPoint.volume.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "transparent",
    overflow: "visible",
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
  // Neue Stile für die Datenanzeige
  dataDisplay: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  dataValue: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? undefined : "monospace",
  },
});
