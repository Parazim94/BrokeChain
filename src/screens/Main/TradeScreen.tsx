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
import { AuthContext } from "@/src/context/AuthContext";  // setUser hinzugefügt
import { createStyles } from "@/src/styles/style";
import { formatCurrency } from "@/src/utils/formatCurrency";
import D3LineChart from "@/src/components/d3-LineChart";
import { useData } from "@/src/context/DataContext";
import D3CandlestickChart from "@/src/components/d3-Candlestick";
import CashInfo from "@/src/components/CashInfo";

const timeIntervals = {
  "1m": "1m",
  "5m": "5m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
  "3d": "3d",
  "1w": "1w",
  "1M": "1M",
  
};

export default function TradeScreen() {
  const { theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext);  // setUser hinzugefügt
  const styles = createStyles();
  const navigation = useNavigation();
  const route = useRoute();
  const { marketData, executeTrade, getHistoricalData } = useData();

  const { coin: routeCoin } = (route.params || {}) as { coin?: any };
  const [coin, setCoin] = useState<any>(routeCoin);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [selectedRange, setSelectedRange] =
    useState<keyof typeof timeIntervals>("1h");
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<
    "line" | "d3-candlestick"
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
      const result = await executeTrade({ symbol: coin.symbol, value: amount });
      console.log(result);
      
      // Ähnlich wie in Settings: User aktualisieren, falls enthalten
      if(result) {
        setUser(result);
      }
      alert(`${type === "buy" ? "Kaufvorgang" : "Verkaufsvorgang"} erfolgreich!`);
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
              alignItems: "flex-start",
            }}
          >
            <Text
              style={[styles.defaultText, { fontSize: 20, marginBottom: 12}]}
            >
              {coin?.name} ({coin?.symbol ? coin.symbol.toUpperCase() : ""})
            </Text>
            {marketPrice !== null && (
              <Text
                style={[styles.defaultText, { fontSize: 14, color: theme.accent} ]}
              >
                Market: {formatCurrency(marketPrice)}
              </Text>
            )}
          </View>
         
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", flex: 1 }}>
            {Object.keys(timeIntervals).map((range) => (
              <TouchableOpacity
                key={range}
                style={{
                  paddingVertical: 2,
                  paddingHorizontal: 4,
                  marginRight: 4,
                  marginBottom: 4,
                  borderRadius: 4,
                  backgroundColor: selectedRange === range ? theme.accent : theme.background,
                }}
                onPress={() => setSelectedRange(range as keyof typeof timeIntervals)}
              >
                <Text style={{ color: theme.text, fontSize: 10 }}>{range}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setChartType(chartType === "line" ? "d3-candlestick" : "line")}
            style={[styles.baseButton, { paddingVertical: 4, paddingHorizontal: 8 }]}
          >
            <Text style={[styles.baseButtonText, { fontSize: 12 }]}>
              {chartType === "line" ? "Candle" : "Line"}
            </Text>
          </TouchableOpacity>
        </View>

        {chartType === "line" ? (
          <View style={[styles.sparklineShadow, { padding: 16 }]}>
            <D3LineChart
              symbol={coin?.symbol ? `${coin.symbol.toUpperCase()}USDT` : "BTCUSDT"}
              interval={timeIntervals[selectedRange]}
              width={containerWidth ? containerWidth*0.9666 : 300}
              height={300}
            />
          </View>
        ) : (
          <View style={[styles.sparklineShadow, { padding: 8 }]}>
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
