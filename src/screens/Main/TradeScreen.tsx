import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { ThemeContext } from "@/src/context/ThemeContext";
import { AuthContext } from "@/src/context/AuthContext";
import { createStyles } from "@/src/styles/style";
import { formatCurrency } from "@/src/utils/formatCurrency";
import D3LineChart from "@/src/components/TradeComponents/d3-LineChart";
import { useData } from "@/src/context/DataContext";
import D3CandlestickChart from "@/src/components/TradeComponents/d3-Candlestick";
import TradeControls from "@/src/components/TradeComponents/TradeControls";
import Button from "@/src/components/Button";
import { createTradeScreenStyles } from "@/src/components/TradeComponents/sharedstyles";
import Card from "@/src/components/Card";

const timeIntervals = {
  "1s": "1s", 
  "1m": "1m",
  "5m": "5m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
  "3d": "3d",
  "1w": "1w",
  "1M": "1M",
};

const windowHeight = Dimensions.get("window").height;

export default function TradeScreen() {
  const { theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext);
  const localStyles = createStyles();
  const tradeStyles = createTradeScreenStyles(theme);
  const route = useRoute();
  const { marketData, getHistoricalData, getHistoricalCandleData } = useData();

  const { coin: routeCoin } = (route.params || {}) as { coin?: any };
  const [coin, setCoin] = useState<any>(routeCoin);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] =
    useState<keyof typeof timeIntervals>("1h");
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<"line" | "d3-candlestick">("line");
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Zustände für die Suchfunktion
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Filtern der Coins basierend auf der Suchanfrage
  const filteredCoins = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase();
    if (!searchQuery) return marketData;
    // Zunächst alle Coins aus dem Markt, die passen:
    const marketMatches = marketData.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(lowerSearch) ||
        (item.symbol || "").toLowerCase().includes(lowerSearch)
    );
    // Dann Favoriten, die passen:
    const favorites = user?.favorites || [];
    const favoriteMatches = favorites.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(lowerSearch) ||
        (item.symbol || "").toLowerCase().includes(lowerSearch)
    );
    // Füge die Favoriten am Ende hinzu, sofern sie nicht bereits in marketMatches enthalten sind:
    return [
      ...marketMatches,
      ...favoriteMatches.filter(
        (fav) =>
          !marketMatches.some(
            (item) => item.symbol.toLowerCase() === fav.symbol.toLowerCase()
          )
      ),
    ];
  }, [searchQuery, marketData, user]);

  // Coin Initialization
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

  // Market price from marketData
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

  // Load historical chart data
  useEffect(() => {
    const loadHistorical = async () => {
      if (coin?.symbol) {
        setIsLoading(true);
        setChartData([]); // Leeren Sie chartData, wenn sich das Intervall ändert
        const symbol = coin.symbol.toUpperCase() + "USDT";
        const binanceInterval = timeIntervals[selectedRange];
        
        let data;
        if (chartType === "line") {
          data = await getHistoricalData(symbol, binanceInterval);
        } else {
          data = await getHistoricalCandleData(symbol, binanceInterval);
        }
        setChartData(data);
        setIsLoading(false);
      }
    };
    loadHistorical();
  }, [coin, selectedRange, chartType, getHistoricalData, getHistoricalCandleData]);

  // Live price update
  const lastPriceFetch = useRef<number>(0);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchLatestData = async () => {
      if (!coin?.symbol) return;
      const symbol = coin.symbol.toUpperCase() + "USDT";

      if (chartType === "line") {
        try {
          const newData = await getHistoricalData(symbol, timeIntervals[selectedRange], 1);
          // Mergen: Entferne Einträge, die bereits vorhanden sind (basierend auf Datum)
          setChartData(prev => {
            if (prev.length === 0) return newData;
            const lastTimestamp = new Date(prev[prev.length - 1].label).getTime();
            const filtered = newData.filter(item => new Date(item.label).getTime() > lastTimestamp);
            return [...prev, ...filtered];
          });
          if (newData.length > 0) {
            const lastEntry = newData[newData.length - 1];
            setMarketPrice(lastEntry.value);
          }
        } catch (error) {
          console.error("Fehler beim Fetch der historischen Daten (line):", error);
        }
      } else {
        // Candlestick-Modus: fetch candlestick Daten mit limit=5
        try {
          const newCandles = await getHistoricalCandleData(symbol, timeIntervals[selectedRange], 1);
          setChartData(prev => {
            if (prev.length === 0) return newCandles;
            const lastTimestamp = prev[prev.length - 1].timestamp;
            // Filtere Kerzen, deren Timestamp wirklich neu ist
            const filteredNew = newCandles.filter(item => item.timestamp > lastTimestamp);
            // Prüfe, ob es eine neue Kerze gibt, die den gleichen Timestamp hat – falls ja, aktualisiere die letzte
            const incomingSame = newCandles.find(item => item.timestamp === lastTimestamp);
            if (incomingSame) {
              return [...prev.slice(0, -1), incomingSame, ...filteredNew];
            }
            return [...prev, ...filteredNew];
          });
          if (newCandles.length > 0) {
            const lastCandle = newCandles[newCandles.length - 1];
            setMarketPrice(lastCandle.close || 0);
          }
        } catch (error) {
          console.error("Fehler beim Fetch der Candlestick-Daten:", error);
        }
      }
    };
    fetchLatestData();
    intervalId = setInterval(fetchLatestData, 1000);
    return () => clearInterval(intervalId);
  }, [coin, chartType, selectedRange, getHistoricalData, getHistoricalCandleData]);

  // Live price update mit "sliding window"
  const MAX_CANDLES = 100; // Konstante für maximale Kerzenanzahl
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchLatestData = async () => {
      if (!coin?.symbol) return;
      const symbol = coin.symbol.toUpperCase() + "USDT";

      if (chartType === "line") {
        try {
          const newData = await getHistoricalData(symbol, timeIntervals[selectedRange], 1);
          setChartData(prev => {
            if (prev.length === 0) return newData;
            const lastTimestamp = new Date(prev[prev.length - 1].label).getTime();
            const filtered = newData.filter(item => new Date(item.label).getTime() > lastTimestamp);
            const updatedData = [...prev, ...filtered];
            // "Sliding Window" - Nur die letzten MAX_CANDLES anzeigen
            return updatedData.length > MAX_CANDLES 
              ? updatedData.slice(updatedData.length - MAX_CANDLES) 
              : updatedData;
          });
          if (newData.length > 0) {
            const lastEntry = newData[newData.length - 1];
            setMarketPrice(lastEntry.value);
          }
        } catch (error) {
          console.error("Fehler beim Fetch der historischen Daten (line):", error);
        }
      } else {
        // Candlestick-Modus: fetch candlestick Daten mit limit=1
        try {
          const newCandles = await getHistoricalCandleData(symbol, timeIntervals[selectedRange], 1);
          setChartData(prev => {
            if (prev.length === 0) return newCandles;
            const lastTimestamp = prev[prev.length - 1].timestamp;
            // Falls die neue Kerze denselben Timestamp hat, aktualisieren:
            const incomingSame = newCandles.find(item => item.timestamp === lastTimestamp);
            let updatedData;
            if (incomingSame) {
              updatedData = [...prev.slice(0, -1), incomingSame];
            } else {
              // Neue Candle anhängen
              updatedData = [...prev, ...newCandles];
            }
            // Sliding Window: Entferne die älteste Candle, wenn die maximale Anzahl überschritten wird
            return updatedData.length > MAX_CANDLES
              ? updatedData.slice(updatedData.length - MAX_CANDLES)
              : updatedData;
          });
          if (newCandles.length > 0) {
            const lastCandle = newCandles[newCandles.length - 1];
            setMarketPrice(lastCandle.close || 0);
          }
        } catch (error) {
          console.error("Fehler beim Fetch der Candlestick-Daten:", error);
        }
      }
    };
    fetchLatestData();
    intervalId = setInterval(fetchLatestData, 1000);
    return () => clearInterval(intervalId);
  }, [coin, chartType, selectedRange, getHistoricalData, getHistoricalCandleData]);

  // Chart Component - Übergeben Sie chartData und maxCandleCount an die D3CandlestickChart
  const chartComponent = useMemo(() => {
    if (chartType === "line") {
      return (
        <View style={{ padding: 6 }}>
          <D3LineChart
            symbol={
              coin?.symbol ? `${coin.symbol.toUpperCase()}USDT` : "BTCUSDT"
            }
            interval={timeIntervals[selectedRange]}
            width={containerWidth ? containerWidth * 0.9666 : 300}
            height={300}
            livePrice={marketPrice ?? undefined}
          />
        </View>
      );
    } else {
      return (
        <View style={{ padding: 2 }}>
          <D3CandlestickChart
            symbol={
              coin?.symbol ? `${coin.symbol.toUpperCase()}USDT` : "BTCUSDT"
            }
            interval={timeIntervals[selectedRange]}
            width={containerWidth ? containerWidth * 0.91 : 300}
            height={300}
            data={chartData}
            maxCandleCount={MAX_CANDLES}
           />
        </View>
      );
    }
  }, [chartType, coin, selectedRange, containerWidth, marketPrice, chartData]);
  
  // MainContent
  const content = (
    <SafeAreaView style={[
      localStyles.container, 
      Platform.OS === "web" && { 
         minHeight: windowHeight, 
         paddingTop: 50,
        
      }
    ]}>
      <ScrollView >
      
        <View
          style={{
            padding: 8,
            maxWidth: 1248,
            width: "100%",
            marginHorizontal: "auto",
            marginVertical: "auto",
          }}
          onLayout={(event) => {
            setContainerWidth(event.nativeEvent.layout.width);
          }}
        >
          <Card style={{margin:0}}>
          {/* Header mit Coin-Info und Suche */}
          <View style={tradeStyles.headerContainer}>
            <View style={tradeStyles.coinInfoContainer}>
              <Text style={[localStyles.defaultText, tradeStyles.coinTitle]}>
                {coin?.name} ({coin?.symbol ? coin.symbol.toUpperCase() : ""}) <Button 
                onPress={() => setIsSearchActive(!isSearchActive)}
                title=""
                icon="search"
                size="small"
                style={{ backgroundColor: "transparent", padding: 0 }}
                textStyle={{ color: isSearchActive ? theme.accent : theme.text }}
              />
              </Text>
             
              {marketPrice !== null && (
                <Text style={tradeStyles.coinPrice}>
                  Market: {formatCurrency(marketPrice)}
                </Text>
              )}
            </View>
          </View>

          {/* Suchbereich */}
          {isSearchActive && (
            <View style={{ marginVertical: 10}}>
              <TextInput
                placeholder="search coin..."
                placeholderTextColor={localStyles.defaultText.color}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[localStyles.input, { width: "100%" }]}
                autoFocus
              />

              {searchQuery.length > 0 && (
                <View
                  style={{
                    maxHeight: 200,
                    backgroundColor: theme.background,
                    borderRadius: 8,
                    marginTop: 4,
                    borderWidth: 1,
                    borderColor: theme.text,
                  }}
                >
                  <FlatList
                    data={filteredCoins}
                    keyExtractor={(item) => item.id || item.symbol}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.text,
                          flexDirection: "row",
                          justifyContent: "flex-start",
                        }}
                        onPress={() => {
                          setCoin(item);
                          setSearchQuery("");
                          setIsSearchActive(false);
                        }}
                      >
                        <Text style={[localStyles.defaultText, { fontWeight: "500" }]}>
                          {item.name} ({item.symbol?.toUpperCase()})
                        </Text>
                        <Text
                          style={[localStyles.defaultText, { color: theme.accent }]}
                        >
                          {formatCurrency(item.current_price)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text
                        style={[
                          localStyles.defaultText,
                          { padding: 12, textAlign: "center" },
                        ]}
                      >
                        Keine Ergebnisse gefunden
                      </Text>
                    }
                  />
                </View>
              )}
            </View>
          )}

          {/* Zeitintervalle und Chart-Typ */}
          <View style={tradeStyles.timeIntervalContainer}>
            <View style={tradeStyles.timeIntervalButtonsContainer}>
              {Object.keys(timeIntervals).map((range) => (
                <Button
                  key={range}
                  onPress={() =>
                    setSelectedRange(range as keyof typeof timeIntervals)
                  }
                  title={range}
                  type={selectedRange === range ? "primary" : "outline"}
                  size="small"
                  style={{
                    marginRight: 4,
                    marginBottom: 4,
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                  }}
                  textStyle={{ fontSize: 10 }}
                />
              ))}
            </View>

            <Button
              onPress={() =>
                setChartType(chartType === "line" ? "d3-candlestick" : "line")
              }
              title={chartType === "line" ? "Candle" : "Line"}
              size="small"
              style={{ paddingVertical: 4, paddingHorizontal: 8 }}
              textStyle={{ fontSize: 12 }}
            />
          </View>

          {/* Chart-Bereich */}
          <View style={tradeStyles.chartContainer}>
            {chartComponent}
          </View>

          {/* Ausgelagerte Trade-Controls-Komponente */}
          {coin && (
            <TradeControls
              symbol={coin.symbol}
              marketPrice={marketPrice}
              user={user}
              setUser={setUser}
              theme={theme}
            />
          )}
          </Card>
        </View>
      
      
      </ScrollView>
    </SafeAreaView>
  );

  // Nur auf iOS wird mit KeyboardAvoidingView und TouchableWithoutFeedback gearbeitet
  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {content}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  // Auf Android und Web einfach den Inhalt rendern
  return content;
}
