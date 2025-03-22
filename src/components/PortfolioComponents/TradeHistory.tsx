import React from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Text, View, Platform, useWindowDimensions } from "react-native";
import Card from "@/src/components/UiComponents/Card";
import { createStyles } from "@/src/components/PortfolioComponents/portfolioStyles";
import { formatCurrency } from "@/src/utils/formatCurrency";

// Trade History Schema Interface
interface TradeHistoryItem {
  _id?: string; // MongoDB ID
  symbol: string;
  price: number;
  amount: number;
  order: boolean;
  date: string;
  updatedAt: string;
}

interface TradeHistoryProps {
  theme: any;
  tradeHistory?: TradeHistoryItem[];
  isLoggedIn?: boolean;
}

export default function TradeHistory({ theme, tradeHistory = [], isLoggedIn = false }: TradeHistoryProps) {
  const styles = createStyles(theme);
  const { width: screenWidth } = useWindowDimensions();
  
  // Entferne etwaige Duplikate basierend auf _id
  const uniqueTrades = React.useMemo(() => {
    const seen = new Set();
    return tradeHistory.filter(item => {
      // Wenn keine _id vorhanden ist, verwende einen zusammengesetzten Schlüssel
      const key = item._id || `${item.symbol}-${item.price}-${item.amount}-${item.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [tradeHistory]);
  
  // Sortiere nach Datum (neueste zuerst) und begrenze auf 10 Einträge
  const sortedTrades = React.useMemo(() => {
    return [...uniqueTrades]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [uniqueTrades]);

  if (!isLoggedIn) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: theme.text }}>Bitte melden Sie sich an, um Ihre Handelsgeschichte zu sehen.</Text>
      </View>
    );
  }

  if (sortedTrades.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: theme.text }}>Keine Handelsaktivitäten vorhanden</Text>
      </View>
    );
  }

  return (
    <Animated.FlatList
      data={sortedTrades}
      style={[styles.list, { width: '100%' }]}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      keyExtractor={(item) => item._id || `${item.symbol}-${item.price}-${item.amount}-${item.date}`}
      renderItem={({ item, index }) => (
        <Animated.View 
          entering={FadeInUp.delay(index * 50)}
          style={{ width: '100%' }}
        >
          <Card
            onPress={() => {}}
            style={{ 
              ...styles.card, 
              width: screenWidth < 1024 ? "95%" : (Platform.OS === "web" ? "100%" : "95%"),
              marginHorizontal: screenWidth < 1024 ? "auto" : (Platform.OS === "web" ? 0 : "auto")
            }}
          >
            {Platform.OS === "web" && window.innerWidth >= 768 ? (
              <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                {/* Linkes Segment: Symbol und Preis (hervorgehoben) */}
                <View style={{ flex: 3, alignItems: "flex-start" }}>
                  <Text style={{ fontWeight: "bold", fontSize: 16, color: theme.accent, marginBottom: 4 }}>
                    {item.symbol.toUpperCase()}
                  </Text>
                  <Text style={{ fontWeight: "bold", fontSize: 14, color: theme.accent }}>
                    @ {formatCurrency(item.price)}
                  </Text>
                </View>
                {/* Mittleres Segment: Labeltexte + Amount, Order-Info und Total in einer Zeile */}
                <View style={{ flexGrow: 1, flexShrink: 1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                    <Text style={{ fontWeight: "bold", color: theme.text }}>Amount: </Text>
                    <Text style={{ fontFamily: "monospace", fontSize: 16, color: theme.text }}>
                      {item.amount > 0 ? "+" : ""}{item.amount}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                    <Text style={{ fontWeight: "bold", color: theme.text }}>Order: </Text>
                    <Text style={{ fontSize: 12, color: theme.text }}>
                      {item.order ? "Order ausgeführt" : "Direkter Handel"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                    <Text style={{ fontWeight: "bold", color: theme.text }}>Total: </Text>
                    <Text style={{ fontFamily: "monospace", fontWeight: "bold", fontSize: 14, color: theme.text }}>
                      {formatCurrency(item.price * Math.abs(item.amount))}
                    </Text>
                  </View>
                </View>
                {/* Rechtes Segment: Datum, rechtsbündig */}
                <View style={{ flex: 3, alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 12, color: theme.text }}>
                    {new Date(item.date).toLocaleString()}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={[styles.marketName, { color: theme.text }]}>
                      {item.symbol.toUpperCase()}
                    </Text>
                    <Text style={{ 
                      color: theme.text, 
                      fontSize: 12,
                      marginTop: 4
                    }}>
                      {item.order ? "Order ausgeführt" : "Direkter Handel"}
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ 
                      color: item.amount > 0 ? 'green' : 'red',
                      fontWeight: 'bold',
                      fontFamily: "monospace",
                      fontSize: 16
                    }}>
                      {item.amount > 0 ? '+' : ''}{item.amount}
                    </Text>
                    <Text style={{ 
                      color: theme.text, 
                      fontFamily: "monospace"
                    }}>
                      @ {formatCurrency(item.price)}
                    </Text>
                  </View>
                </View>
                
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                  paddingTop: 8
                }}>
                  <Text style={{ color: theme.text, fontSize: 12 }}>
                    {new Date(item.date).toLocaleString()}
                  </Text>
                  <Text style={{ 
                    fontFamily: "monospace", 
                    color: theme.text,
                    fontWeight: 'bold'
                  }}>
                    {formatCurrency(item.price * Math.abs(item.amount))}
                  </Text>
                </View>
              </>
            )}
          </Card>
        </Animated.View>
      )}
    />
  );
}
