import React from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { StyleSheet, View, Text, Image } from "react-native";
import Card from "@/src/components/Card";
import Sparkline from "@/src/components/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";

export interface Ticker {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  image: string;
  sparkline: { price: number[] };
}

interface MarketListProps {
  tickers: Ticker[];
  onPressItem: (item: Ticker) => void;
  accentColor: string;
  defaultTextColor: string;
  containerBackground: string;
}

export default function MarketList({
  tickers,
  onPressItem,
  accentColor,
  defaultTextColor,
  containerBackground,
}: MarketListProps) {
  const localStyles = StyleSheet.create({
    cardStyle: {
      backgroundColor: containerBackground,
      maxWidth: 600,
      minWidth: 280,
      marginHorizontal: "auto",
      width: "95%",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 4,
    },
    rowCenter: {
      alignItems: "center",
    },
    coinIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    labelText: {
      fontWeight: "bold",
      marginRight: 4,
      color: defaultTextColor,
    },
    flexText: {
      marginLeft: 8,
      flex: 1,
    },
    hr: {
      height: 1,
      backgroundColor: "gray",
      marginVertical: 4,
    },
    monoText: {
      fontFamily: "monospace",
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Animated.FlatList
        data={tickers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
         
          return (
            <Animated.View>
              <Card onPress={() => onPressItem(item)} style={localStyles.cardStyle}>
                {/* Erste Zeile: Icon, Name und Sparkline */}
                <View style={[localStyles.row, localStyles.rowCenter]}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={localStyles.coinIcon} 
                    resizeMode="cover" 
                  />
                  <Text style={[localStyles.labelText, localStyles.flexText]}>
                    {item.name}
                  </Text>
                  <Sparkline prices={item.sparkline.price} width={100} height={30} stroke={accentColor} />
                </View>
                <View style={localStyles.hr} />
                {/* Zweite Zeile: Preis und prozentuale Veränderung */}
                <View style={localStyles.row}>
                  <Text style={[localStyles.labelText, localStyles.monoText]}>
                    {item.current_price.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} $
                  </Text>
                  <Text style={[{ color: item.price_change_percentage_24h < 0 ? "red" : "green" }, localStyles.monoText]}>
                    {item.price_change_percentage_24h.toFixed(2)}%
                  </Text>
                </View>
                {/* Dritte Zeile: High und Low */}
                <View style={localStyles.row}>
                  <Text style={{ color: defaultTextColor }}>
                    <Text style={localStyles.labelText}>High:</Text>
                    <Text style={[localStyles.monoText, { color: defaultTextColor }]}>
                      {" "}{item.high_24h.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} $
                    </Text>
                  </Text>
                  <Text style={{ color: defaultTextColor }}>
                    <Text style={localStyles.labelText}>Low:</Text>
                    <Text style={[localStyles.monoText, { color: defaultTextColor }]}>
                      {" "}{item.low_24h.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} $
                    </Text>
                  </Text>
                </View>
                {/* Vierte Zeile: Volumen und Marketcap */}
                <View style={localStyles.row}>
                  <Text style={{ color: defaultTextColor }}>
                    <Text style={localStyles.labelText}>Vol:</Text>
                    <Text style={[localStyles.monoText, { color: defaultTextColor }]}>
                      {" "}{formatCurrency(item.total_volume)}
                    </Text>
                  </Text>
                  <Text style={{ color: defaultTextColor }}>
                    <Text style={localStyles.labelText}>Cap:</Text>
                    <Text style={[localStyles.monoText, { color: defaultTextColor }]}>
                      {" "}{formatCurrency(item.market_cap)}
                    </Text>
                  </Text>
                </View>
              </Card>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}
