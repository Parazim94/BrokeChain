import React, { useContext, useState, useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ThemeContext } from "../context/ThemeContext";

type ChartProps = {
  coin: { name: string; symbol?: string };
};

export default function Chart({ coin }: ChartProps) {
  const { theme } = useContext(ThemeContext);
  const screenWidth = Dimensions.get("window").width - 20;

  const [chartData, setChartData] = useState<any>(null);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{
    value: number;
    index: number;
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const symbol = `${(coin.symbol || "BTC").toUpperCase()}USDT`;
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d`;
    console.log("Fetching Daten von: ", url); // Debug-Log
    setLoading(true);
    fetch(url)
      .then((res) => {
        console.log("Response erhalten", res);
        return res.json();
      })
      .then((data) => {
        console.log("API Antwort:", data); // Debug-Log
        const lastData = data.slice(-100);
        if (lastData.length === 0) {
          console.log("Keine Daten erhalten");
        }
        const labels = lastData.map(
          (_: any, index: number) => `Tag ${index + 1}`
        );
        const prices = lastData.map((item: any) => parseFloat(item[4]));
        const ts = lastData.map((item: any) => parseInt(item[0], 10));
        setChartData({ labels, datasets: [{ data: prices }] });
        setTimestamps(ts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Abrufen der Daten:", err);
        setLoading(false);
      });
  }, [coin.name]);

  const chartConfig = {
    backgroundColor: theme.background,
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    color: (opacity = 1) => theme.text,
    labelColor: (opacity = 1) => theme.text,
    strokeWidth: 1,
    decimalPlaces: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: true,
    propsForDots: {
      r: "3",
      strokeWidth: "1",
      stroke: theme.text,
    },
  };

  return (
    <View>
      <Text
        style={{ color: theme.text, textAlign: "center", marginBottom: 10 }}
      >
        Chart für {coin.name}
      </Text>
      {loading || !chartData ? (
        <Text style={{ color: theme.text, textAlign: "center" }}>
          Lade Daten...
        </Text>
      ) : (
        // Wrapper mit relativer Position für den Tooltip
        <View style={{ position: "relative" }}>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            yAxisLabel="$"
            yAxisSuffix="k"
            chartConfig={chartConfig}
            bezier
            style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            onDataPointClick={(data) => {
              const ts = timestamps[data.index];
              setSelectedPoint({
                value: data.value,
                index: data.index,
                x: data.x,
                y: data.y,
                timestamp: ts,
              });
            }}
          />
          {selectedPoint && (
            <View
              style={{
                position: "absolute",
                left: selectedPoint.x - 25,
                top: selectedPoint.y - 60,
                backgroundColor: theme.background,
                padding: 4,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: theme.text,
              }}
            >
              <Text style={{ color: theme.text, fontSize: 12 }}>
                {selectedPoint.value} $
              </Text>
              <Text style={{ color: theme.text, fontSize: 10 }}>
                {new Date(selectedPoint.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
