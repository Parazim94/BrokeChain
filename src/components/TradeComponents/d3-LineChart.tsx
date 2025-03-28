import React, { useState, useEffect, useContext, useRef } from "react";
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
import { Ionicons } from "@expo/vector-icons";
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
import Card from "@/src/components/UiComponents/Card";

interface LineData {
  timestamp: number;
  value: number;
  volume: number;
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
  return 60000;
}

// Neue Konstanten für die stabilere Preisdarstellung
const MIN_UPDATE_INTERVAL = 2000; // Mindestens 2 Sekunden zwischen Preisupdate-Versuchen
const PRICE_CHANGE_THRESHOLD = 0.0005; // 0.05% Mindestpreisänderung für neuen Datenpunkt

// Verbesserte Hilfsfunktion: Prüft, ob ein neuer Datenpunkt erstellt werden soll
function shouldCreateNewDataPoint(
  currentTime: number,
  lastPointTime: number,
  intervalString: string,
  newPrice: number | null,
  lastPrice: number | null
): boolean {
  if (currentTime - lastPointTime < MIN_UPDATE_INTERVAL) {
    return false;
  }

  if (newPrice === null || lastPrice === null) {
    return false;
  }

  const priceChangePercent = Math.abs((newPrice - lastPrice) / lastPrice);
  const isSignificantChange = priceChangePercent > PRICE_CHANGE_THRESHOLD;

  if (intervalString === "1s") {
    return isSignificantChange || (currentTime - lastPointTime >= 5000);
  }

  const date = new Date();
  const lastDate = new Date(lastPointTime);

  if (intervalString.endsWith("m")) {
    const minutes = parseInt(intervalString);
    return (
      (date.getMinutes() % minutes === 0 &&
        date.getMinutes() !== lastDate.getMinutes()) ||
      isSignificantChange
    );
  }

  if (intervalString.endsWith("h")) {
    const hours = parseInt(intervalString);
    return (
      (date.getHours() % hours === 0 &&
        date.getHours() !== lastDate.getHours() &&
        date.getMinutes() === 0) ||
      isSignificantChange
    );
  }

  if (intervalString.endsWith("d")) {
    return date.getDate() !== lastDate.getDate() || isSignificantChange;
  }

  return isSignificantChange;
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
  livePrice,
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

  const [selectedPoint, setSelectedPoint] = useState<LineData | null>(null);
  const [showMA, setShowMA] = useState<boolean>(true);
  const [lastDataPointTime, setLastDataPointTime] = useState<number>(0);
  const [binancePrice, setBinancePrice] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const margin = { top: 10, right: 10, bottom: 30, left: 60 };

  function getMaxDataPoints(interval: string): number {
    if (interval.endsWith("s")) return 50;
    if (interval.endsWith("m")) {
      const mins = parseFloat(interval);
      if (mins <= 5) return 60;
      return 48;
    }
    if (interval.endsWith("h")) return 72;
    if (interval.endsWith("d")) return 60;
    if (interval.endsWith("w")) return 52;
    return 100;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setSelectedPoint(null);
      try {
        const data = await getHistoricalData(symbol, interval);
        const mapped: LineData[] = data.map((item: any) => ({
          timestamp: new Date(item.label).getTime(),
          value: item.value,
          volume: item.volume ? Number(item.volume) : 0,
        }));
        setLineData(mapped);

        if (mapped.length > 0) {
          setLastDataPointTime(mapped[mapped.length - 1].timestamp);
          setBinancePrice(mapped[mapped.length - 1].value);
        }
      } catch (error) {
        console.error("Fehler beim Abruf der LineChart-Daten:", error);
        setLineData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const setupPriceFetch = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(async () => {
        try {
          const newData = await getHistoricalData(symbol, interval, 1);
          if (newData && newData.length > 0) {
            const latestPrice = newData[0].value;
            setBinancePrice(latestPrice);
          }
        } catch (error) {
          console.error("Fehler bei Binance-Preisabfrage:", error);
        }
      }, 2000);
    };

    setupPriceFetch();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [symbol, interval, getHistoricalData]);

  useEffect(() => {
    if (binancePrice === null || lineData.length === 0) return;

    const now = Date.now();

    setLineData((prev) => {
      if (prev.length === 0) {
        setLastDataPointTime(now);
        return [{ timestamp: now, value: binancePrice, volume: 0 }];
      }

      const newData = [...prev];
      const lastPoint = prev[prev.length - 1];
      const lastPrice = lastPoint.value;

      if (
        shouldCreateNewDataPoint(
          now,
          lastDataPointTime,
          interval,
          binancePrice,
          lastPrice
        )
      ) {
        newData.push({ timestamp: now, value: binancePrice, volume: 0 });
        setLastDataPointTime(now);
      } else {
        const smoothedValue = lastPrice + (binancePrice - lastPrice) * 0.2;
        newData[newData.length - 1] = {
          timestamp: lastPoint.timestamp,
          value: smoothedValue,
          volume: lastPoint.volume,
        };
      }

      const maxPoints = getMaxDataPoints(interval);
      while (newData.length > maxPoints) newData.shift();

      return newData;
    });
  }, [binancePrice, interval, lastDataPointTime]);

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

  const effectiveWidth = window.innerWidth > 768 ? width * 0.98 : width * 0.92;
  const minValue = Math.min(...lineData.map((d) => d.value));
  const maxValue = Math.max(...lineData.map((d) => d.value));
  const yScale = d3Scale
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([height - margin.bottom, margin.top]);

  const yTicks = d3Scale.scaleLinear().domain([minValue, maxValue]).ticks(10);

  const xScale = d3Scale
    .scaleLinear()
    .domain([0, lineData.length - 1])
    .range([margin.left, effectiveWidth - margin.right]);

  const points = lineData
    .map((d, i) => `${xScale(i)},${yScale(d.value)}`)
    .join(" ");

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
    maPoints = maData.map((d) => `${xScale(d.index)},${yScale(d.avg)}`).join(" ");
  }

  const fillPath =
    `M ${margin.left} ${height - margin.bottom} ` +
    lineData.map((d, i) => `${xScale(i)} ${yScale(d.value)}`).join(" ") +
    ` L ${effectiveWidth - margin.right} ${height - margin.bottom} Z`;

  function handleTouch(event: GestureResponderEvent, isPersistent = false) {
    const { locationX } = event.nativeEvent;
    const idx = Math.round(
      ((locationX - margin.left) /
        (effectiveWidth - margin.left - margin.right)) *
        (lineData.length - 1)
    );
    if (idx >= 0 && idx < lineData.length) {
      const x = xScale(idx);
      const y = yScale(lineData[idx].value);
      setTooltip({ index: idx, x, y, isVisible: true });

      if (isPersistent) {
        setSelectedPoint(lineData[idx]);
      }
    }
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handleTouch(evt),
    onPanResponderMove: (evt) => handleTouch(evt),
    onPanResponderRelease: (evt) => {
      handleTouch(evt, true);
      if (tooltip) {
        setTooltip({ ...tooltip, isVisible: false });
        setTimeout(() => setTooltip(null), 500);
      }
    },
  });

  const getDateLabel = (index: number): string => {
    if (index < 0 || index >= lineData.length) return "";
    const date = new Date(lineData[index].timestamp);
    let formatString = "MMM d, HH:mm";
    if (interval === "1s") {
      formatString = "HH:mm";
    } else if (interval.endsWith("m")) {
      formatString = "HH:mm";
    } else if (interval.endsWith("h")) {
      formatString = "HH:mm";
    } else {
      formatString = "MMM yyyy";
    }
    return format(date, formatString);
  };

  const labelInterval = Math.max(1, Math.floor(lineData.length / 6));

  const persistentDisplayStyle =
    Platform.OS === "web"
      ? {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }
      : { flexDirection: "column" };

  return (
    <View>
      <View style={styles.container} {...panResponder.panHandlers}>
        <Svg width={"100%"} height={height}>
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
          <Path d={fillPath} fill="url(#lineGradient)" />
          <Polyline
            points={points}
            fill="none"
            stroke={theme.accent}
            strokeWidth={2}
          />
          {showMA && maPoints && (
            <Polyline
              points={maPoints}
              fill="none"
              stroke={`${theme.accent}AA`}
              strokeWidth={2}
              strokeDasharray="4,4"
            />
          )}
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
        <View style={styles.legend}>
          <TouchableOpacity
            style={[styles.legendItem, showMA ? styles.legendItemActive : {}]}
            onPress={() => setShowMA(!showMA)}
          >
            <View
              style={[styles.legendColor, { backgroundColor: theme.accent }]}
            />
            <Text style={{ color: theme.text, fontSize: 10 }}>MA(20)</Text>
          </TouchableOpacity>
        </View>
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

      {selectedPoint && (
        <View
          style={[
            styles.dataDisplay,
            {
              backgroundColor: `${theme.accent}15`,
              borderColor: `${theme.accent}40`,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              ...(Platform.OS === "web"
                ? {}
                : { maxWidth: 768, alignSelf: "flex-start" }),
            },
          ]}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={[
                styles.dataLabel,
                { color: theme.text, width: "10%" },
              ]}
            >
              Date:
            </Text>
            <Text
              style={[
                styles.dataValue,
                { color: theme.text, width: "40%" },
              ]}
            >
              {format(
                new Date(selectedPoint.timestamp),
                "dd.MM.yyyy HH:mm"
              )}
            </Text>
            <Text
              style={[
                styles.dataLabel,
                { color: theme.text, width: "10%" },
              ]}
            >
              Price:
            </Text>
            <Text
              style={[
                styles.dataValue,
                {
                  color: theme.accent,
                  fontWeight: "bold",
                  width: "40%",
                },
              ]}
            >
              {formatCurrency(selectedPoint.value)}
            </Text>
          </View>
          {selectedPoint.volume > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>
                Volume:
              </Text>
              <Text style={[styles.dataValue, { color: theme.text }]}>
                {selectedPoint.volume.toLocaleString()}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => setSelectedPoint(null)}
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="close-circle" size={24} color="red" />
          </TouchableOpacity>
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
  dataItem: {
    flex: 1,
    alignItems: "center",
  },
});
