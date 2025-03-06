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

// Hilfsfunktion zum Umrechnen des Intervalls in Millisekunden
function intervalToMs(interval: string): number {
  const num = parseFloat(interval);
  if (interval.endsWith("s")) return num * 1000;  // neu: Unterstützung für Sekunden
  if (interval.endsWith("m")) return num * 60 * 1000;
  if (interval.endsWith("h")) return num * 60 * 60 * 1000;
  if (interval.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  if (interval.endsWith("w")) return num * 7 * 24 * 60 * 60 * 1000;
  if (interval.endsWith("M")) return num * 30 * 24 * 60 * 60 * 1000;
  // Standard: falls nichts erkannt wird
  return 60000;
}

// Neue Hilfsfunktion: Prüft, ob ein neuer Datenpunkt erstellt werden soll
function shouldCreateNewDataPoint(
  currentTime: number,
  lastPointTime: number,
  intervalString: string
): boolean {
  // Für 5s-Intervall: Immer neue Datenpunkte alle 5 Sekunden
  if (intervalString === "5s") {
    return currentTime - lastPointTime >= 5000;
  }
  
  // Für andere Intervalle: Nur an Intervallgrenzen neue Datenpunkte
  const date = new Date();
  const lastDate = new Date(lastPointTime);
  
  if (intervalString.endsWith("m")) {
    const minutes = parseInt(intervalString);
    return date.getMinutes() % minutes === 0 && 
           date.getMinutes() !== lastDate.getMinutes();
  }
  
  if (intervalString.endsWith("h")) {
    const hours = parseInt(intervalString);
    return date.getHours() % hours === 0 && 
           date.getHours() !== lastDate.getHours() && 
           date.getMinutes() === 0;
  }
  
  if (intervalString.endsWith("d")) {
    return date.getDate() !== lastDate.getDate();
  }
  
  return false;
}

interface D3LineChartProps {
  symbol: string;
  interval: string;
  width?: number;
  height?: number;
  livePrice?: number;
}

export default function D3LineChart({
  symbol,
  interval,
  width = Dimensions.get("window").width,
  height = 300,
  livePrice, // neuer Parameter
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

  // Neuer State: Toggle für MA(20)
  const [showMA, setShowMA] = useState<boolean>(true);

  // Neuer State für die Zeit des letzten Datenpunkts
  const [lastDataPointTime, setLastDataPointTime] = useState<number>(0);

  // Margins für Achsen
  const margin = { top: 10, right: 10, bottom: 30, left: 60 };

  // Verbesserte intervalToMs-Funktion 
  function getMaxDataPoints(interval: string): number {
    if (interval.endsWith("s")) return 180; // 15 Minuten bei 5s = 180 Punkte
    if (interval.endsWith("m")) {
      const mins = parseFloat(interval);
      if (mins <= 5) return 60; // 5h bei 5m
      return 48;  // 2 Tage bei 1h
    }
    if (interval.endsWith("h")) return 72; // 3 Tage bei 1h
    if (interval.endsWith("d")) return 60; // 60 Tage
    if (interval.endsWith("w")) return 52; // 52 Wochen
    return 100; // Standard
  }

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
        
        // Setze lastDataPointTime für die weitere Aktualisierung
        if (mapped.length > 0) {
          setLastDataPointTime(mapped[mapped.length - 1].timestamp);
        }
      } catch (error) {
        console.error("Fehler beim Abruf der LineChart-Daten:", error);
        setLineData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol, interval, getHistoricalData]);

  // Dynamisches Anhängen bzw. Aktualisieren eines Datenpunkts basierend auf dem Intervall
  useEffect(() => {
    if (livePrice == null || lineData.length === 0) return;
    
    const now = Date.now();
    
    setLineData(prev => {
      if (prev.length === 0) {
        setLastDataPointTime(now);
        return [{ timestamp: now, value: livePrice, volume: 0 }];
      }
      
      const newData = [...prev];
      const lastPoint = prev[prev.length - 1];
      
      // Bei 5s neue Datenpunkte alle 5 Sekunden hinzufügen
      if (interval === "5s" && now - lastPoint.timestamp >= 5000) {
        newData.push({ timestamp: now, value: livePrice, volume: 0 });
        setLastDataPointTime(now);
      } 
      // Bei anderen Intervallen prüfen, ob ein neuer Datenpunkt erstellt werden sollte
      else if (shouldCreateNewDataPoint(now, lastDataPointTime, interval)) {
        newData.push({ timestamp: now, value: livePrice, volume: 0 });
        setLastDataPointTime(now);
      } 
      // Sonst nur den letzten Datenpunkt aktualisieren
      else {
        // Update des letzten Punktes
        newData[newData.length - 1] = { 
          timestamp: lastPoint.timestamp, 
          value: livePrice, 
          volume: lastPoint.volume 
        };
      }
      
      // Begrenze die Datenpunkte auf eine sinnvolle Anzahl
      const maxPoints = getMaxDataPoints(interval);
      while (newData.length > maxPoints) newData.shift();
      
      return newData;
    });
  }, [livePrice, interval, lastDataPointTime]);

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

  // Berechnung des MA(20)-Indikators
  const maPeriod = 20;
  let maPoints = "";
  if (lineData.length >= maPeriod) {
    const maData = [];
    for (let i = maPeriod - 1; i < lineData.length; i++) {
      let sum = 0;
      for (let j = i - maPeriod + 1; j <= i; j++) {
        sum += lineData[j].value;
      }
      const avg = sum / maPeriod;
      maData.push({ index: i, avg });
    }
    maPoints = maData.map(d => `${xScale(d.index)},${yScale(d.avg)}`).join(" ");
  }

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

  // Format dates for X-axis labels anpassen:
  const getDateLabel = (index: number): string => {
    if (index < 0 || index >= lineData.length) return "";
    const date = new Date(lineData[index].timestamp);
    let formatString = "MMM d, HH:mm"; // Default
    // Falls das Intervall "5s" ist, setze Format auf "HH:mm"
    if (interval === "5s") {
      formatString = "HH:mm";
    } else if (interval.endsWith("m")) {
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
          {/* MA(20) Indikator (nur bei showMA=true) */}
          {showMA && maPoints && (
            <Polyline
              points={maPoints}
              fill="none"
              stroke={`${theme.accent}AA`}
              strokeWidth={2}
              strokeDasharray="4,4"
            />
          )}
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
        {/* Legend/Controls, analog zum Candlestick-Chart */}
        <View style={styles.legend}>
          <TouchableOpacity
            style={[styles.legendItem, showMA ? styles.legendItemActive : {}]}
            onPress={() => setShowMA(!showMA)}
          >
            <View style={[styles.legendColor, { backgroundColor: theme.accent }]} />
            <Text style={{ color: theme.text, fontSize: 10 }}>MA(20)</Text>
          </TouchableOpacity>
        </View>
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
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
            },
          ]}
        >
          <View style={styles.dataItem}>
            <Text style={[styles.dataLabel, { color: theme.text }]}>Date:</Text>
            <Text style={[styles.dataValue, { color: theme.text }]}>
              {format(new Date(selectedPoint.timestamp), "dd.MM.yyyy HH:mm")}
            </Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={[styles.dataLabel, { color: theme.text }]}>Price:</Text>
            <Text style={[styles.dataValue, { color: theme.accent, fontWeight: "bold" }]}>
              {formatCurrency(selectedPoint.value)}
            </Text>
          </View>
          {selectedPoint.volume > 0 && (
            <View style={styles.dataItem}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>Volume:</Text>
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
  legend: {
    position: "absolute",
    top: 10,
    right: 15,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
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
  // Neuer Style für einzelne Daten-Elemente in einer Zeile
  dataItem: {
    flex: 1,
    alignItems: "center",
  },
});
