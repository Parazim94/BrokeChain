import React, { useContext, useState, useEffect } from "react";
import { View, Text, Dimensions, TouchableWithoutFeedback } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import * as d3 from "d3";
import { ThemeContext } from "../context/ThemeContext";

type ChartD3Props = {
  coin: { name: string; symbol: string };
};

export default function ChartD3({ coin }: ChartD3Props) {
  const { theme } = useContext(ThemeContext);
  const [dataPoints, setDataPoints] = useState<{ timestamp: number; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    value: number;
    timestamp: number;
  } | null>(null);
  const screenWidth = Dimensions.get("window").width - 20;
  const chartHeight = 220;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  useEffect(() => {
    const symbol = `${(coin.symbol || "BTC").toUpperCase()}USDT`;
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d`;
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const lastData = json.slice(-100);
        const points = lastData.map((item: any) => ({
          timestamp: parseInt(item[0], 10),
          value: parseFloat(item[4])
        }));
        setDataPoints(points);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [coin.name]);

  if (loading || dataPoints.length === 0) {
    return <Text style={{ color: theme.text, textAlign: "center" }}>Lade Daten...</Text>;
  }

  // Berechne Skalen
  const xExtent = d3.extent(dataPoints, d => d.timestamp) as [number, number];
  const yExtent = d3.extent(dataPoints, d => d.value) as [number, number];

  const xScale = d3.scaleTime()
    .domain(xExtent)
    .range([margin.left, screenWidth - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(yExtent)
    .range([chartHeight - margin.bottom, margin.top]);

  const lineGenerator = d3.line<{ timestamp: number; value: number }>()
    .x(d => xScale(d.timestamp))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const linePath = lineGenerator(dataPoints);

  return (
    <View>
      <Text style={{ color: theme.text, textAlign: "center", marginBottom: 10 }}>
        Chart (d3) für {coin.name}
      </Text>
      <View style={{ position: "relative" }}>
        <Svg width={screenWidth} height={chartHeight}>
          {linePath && <Path d={linePath} stroke={theme.text} strokeWidth={2} fill="none" />}
          {dataPoints.map((d, i) => (
            <TouchableWithoutFeedback key={i} onPress={() => {
              setSelectedPoint({
                x: xScale(d.timestamp),
                y: yScale(d.value),
                value: d.value,
                timestamp: d.timestamp
              });
            }}>
              <Circle cx={xScale(d.timestamp)} cy={yScale(d.value)} r={3} fill={theme.accent || "tomato"} />
            </TouchableWithoutFeedback>
          ))}
        </Svg>
        {selectedPoint && (
          <View style={{
            position: "absolute",
            left: selectedPoint.x - 40,
            top: selectedPoint.y - 60,
            backgroundColor: theme.background,
            borderColor: theme.text,
            borderWidth: 1,
            borderRadius: 4,
            padding: 4
          }}>
            <Text style={{ color: theme.text, fontSize: 12 }}>
              {selectedPoint.value} $
            </Text>
            <Text style={{ color: theme.text, fontSize: 10 }}>
              {new Date(selectedPoint.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
