import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ThemeContext } from "@/src/context/ThemeContext";
import { AuthContext } from "@/src/context/AuthContext";
import { createStyles } from "@/src/styles/style";
import { formatCurrency } from "@/src/utils/formatCurrency";
import Sparkline from "@/src/components/Sparkline";
import { useData } from "@/src/context/DataContext";
import CandlestickChart from "@/src/components/CandlestickChart";
import D3CandlestickChart from "@/src/components/d3-Candlestick";
import CashInfo from "@/src/components/CashInfo";

const timeIntervals = {
  "1D": "1h",
  "1W": "4h",
  "1M": "1d",
  "3M": "3d",
  "1Y": "1w",
};

export default function TradeScreen() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const styles = createStyles();
  const navigation = useNavigation();
  const route = useRoute();
  const { marketData, executeTrade, getHistoricalData } = useData();

  const { coin: routeCoin } = (route.params || {}) as { coin?: any };
  const [coin, setCoin] = useState<any>(routeCoin);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [selectedRange, setSelectedRange] =
    useState<keyof typeof timeIntervals>("1D");
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<
    "line" | "candlestick" | "d3-candlestick"
  >("line");
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (routeCoin && routeCoin !== coin) setCoin(routeCoin);
  }, [routeCoin]);

  useEffect(() => {
    if (!coin && marketData.length > 0) {
      const btcCoin = marketData.find(
        (item) => item.symbol.toLowerCase() === "btc"
      );
      btcCoin && setCoin(btcCoin);
    }
  }, [coin, marketData]);

  useEffect(() => {
    if (coin?.symbol && marketData.length > 0) {
      const ticker = marketData.find(
        (item) => item.symbol.toLowerCase() === coin.symbol.toLowerCase()
      );
      if (ticker?.current_price) {
        setMarketPrice(
          typeof ticker.current_price === "string"
            ? parseFloat(ticker.current_price)
            : ticker.current_price
        );
      }
    }
  }, [coin, marketData]);

  useEffect(() => {
    const loadHistorical = async () => {
      if (coin?.symbol) {
        setIsLoading(true);
        const symbol = coin.symbol.toUpperCase() + "USDT";
        const binanceInterval = timeIntervals[selectedRange];
        const data = await getHistoricalData(symbol, binanceInterval);
        setChartData(data);
        setIsLoading(false);
      }
    };
    loadHistorical();
  }, [coin, selectedRange, getHistoricalData]);

  const handleTrade = async (type: "buy" | "sell") => {
    if (!coin || !user?.token) {
      alert("Münze oder User-Token fehlt");
      return;
    }
    const quantityInput = parseFloat(quantity);
    if (isNaN(quantityInput) || quantityInput <= 0) {
      alert("Ungültige Menge");
      return;
    }
    const amount = type === "sell" ? -Math.abs(quantityInput) : quantityInput;
    try {
      setIsLoading(true);
      await executeTrade({ symbol: coin.symbol, value: amount });
      alert(
        `${type === "buy" ? "Kaufvorgang" : "Verkaufsvorgang"} erfolgreich!`
      );
      setQuantity("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unerwarteter Fehler");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMax = () => {
    if (user && coin && user.positions) {
      const coinNormalized = coin.symbol
        ? coin.symbol.toLowerCase().replace(/usdt$/, "")
        : "";
      let maxAmount = 0;
      let found = false;
      Object.keys(user.positions).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/usdt$/, "");
        if (normalizedKey === coinNormalized) {
          maxAmount = user.positions[key];
          found = true;
        }
      });
      if (!found && marketPrice && user.cash) {
        maxAmount = (user.cash - 10) / marketPrice;
      }
      setQuantity(String(maxAmount));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          padding: 16,
          maxWidth: 1024,
          width: "100%",
          marginHorizontal: "auto",
        }}
        onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text
              style={[styles.defaultText, { fontSize: 20, marginBottom: 12 }]}
            >
              {coin?.name} ({coin?.symbol ? coin.symbol.toUpperCase() : ""})
            </Text>
            {marketPrice !== null && (
              <Text
                style={[styles.defaultText, { fontSize: 14, color: "gray" }]}
              >
                Market: {formatCurrency(marketPrice)}
              </Text>
            )}
          </View>
          <CashInfo />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginVertical: 12,
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {Object.keys(timeIntervals).map((range) => (
              <TouchableOpacity
                key={range}
                style={{
                  padding: 6,
                  paddingHorizontal: 10,
                  marginRight: 8,
                  marginBottom: 8,
                  borderRadius: 6,
                  backgroundColor:
                    selectedRange === range ? theme.accent : theme.background,
                }}
                onPress={() =>
                  setSelectedRange(range as keyof typeof timeIntervals)
                }
              >
                <Text style={{ color: theme.text }}>{range}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <TouchableOpacity
              style={{
                padding: 6,
                marginRight: 8,
                marginBottom: 8,
                borderRadius: 6,
                backgroundColor:
                  chartType === "line" ? theme.accent : theme.background,
              }}
              onPress={() => setChartType("line")}
            >
              <Text style={{ color: theme.text }}>Line</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 6,
                marginRight: 8,
                marginBottom: 8,
                borderRadius: 6,
                backgroundColor:
                  chartType === "candlestick" ? theme.accent : theme.background,
              }}
              onPress={() => setChartType("candlestick")}
            >
              <Text style={{ color: theme.text }}>Candlestick</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 6,
                marginRight: 8,
                marginBottom: 8,
                borderRadius: 6,
                backgroundColor:
                  chartType === "d3-candlestick"
                    ? theme.accent
                    : theme.background,
              }}
              onPress={() => setChartType("d3-candlestick")}
            >
              <Text style={{ color: theme.text }}>D3 Candle</Text>
            </TouchableOpacity>
          </View>
        </View>
        {chartType === "line" ? (
          <View style={styles.sparklineShadow}>
            <Sparkline
              prices={chartData.map((data) => data.value)}
              stroke={theme.accent}
              strokeWidth={2}
              width="100%"
              height={300}
              staticFlag={true}
            />
          </View>
        ) : chartType === "candlestick" ? (
          <View style={styles.sparklineShadow}>
            <CandlestickChart
              symbol={
                coin?.symbol ? `${coin.symbol.toUpperCase()}USDT` : "BTCUSDT"
              }
              interval={timeIntervals[selectedRange]}
              width={containerWidth ? containerWidth * 0.91 : 300}
              height={300}
            />
          </View>
        ) : (
          <View style={styles.sparklineShadow}>
            <D3CandlestickChart
              symbol={
                coin?.symbol ? `${coin.symbol.toUpperCase()}USDT` : "BTCUSDT"
              }
              interval={timeIntervals[selectedRange]}
              width={containerWidth ? containerWidth * 0.91 : 300}
              height={300}
            />
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: 16,
            gap: 8,
          }}
        >
          <TextInput
            style={[styles.input, { width: "35%" }]}
            placeholder="Amount..."
            placeholderTextColor={styles.defaultText.color}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={handleMax} style={styles.baseButton}>
            <Text style={styles.baseButtonText}>Max</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTrade("buy")}
            style={styles.baseButton}
          >
            <Text style={styles.baseButtonText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTrade("sell")}
            style={styles.baseButton}
          >
            <Text style={styles.baseButtonText}>Sell</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
