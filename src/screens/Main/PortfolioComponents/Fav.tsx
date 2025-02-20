import React from "react";
import { FlatList, Image, Text, View, StyleSheet } from "react-native";
import Card from "@/src/components/Card";
import Sparkline from "@/src/components/Sparkline";
import { createStyles } from "@/src/styles/style";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface FavProps {
  data: any[]; // favoriteMarketData
  theme: any;
}

export default function Fav({ data, theme }: FavProps) {
const styles = createStyles();
  const localStyles = StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 4,
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
      color: theme.text,
    },
    hr: {
      height: 1,
      backgroundColor: "gray",
      marginVertical: 4,
    },
    card: {
        backgroundColor: theme.background,
        padding: 12,
        margin: 8,
        borderRadius: 8,
        shadowColor: styles.accent.color,
        shadowOpacity: .5,
        shadowRadius: 8,
        elevation: 3,
        width: "95%",
        minWidth:"95%",
      },
  });

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card onPress={() => {}} style={localStyles.card}>
          {/* Erste Zeile: Icon, Name und Sparkline – exakt wie in MarketsPage */}
          <View style={[localStyles.row, { alignItems: "center" }]}>
            <Image
              source={{ uri: item.image }}
              style={localStyles.coinIcon}
            />
            <Text
              style={[
                localStyles.labelText,
                { marginLeft: 8, flex: 1, color: theme.text },
              ]}
            >
              {item.name}
            </Text>
            <Sparkline
              prices={item.sparkline.price}
              width={100}
              height={30}
              stroke={theme.accent}
              strokeWidth={2}
            />
          </View>
          {/* Separator (hr) */}
          <View style={localStyles.hr} />
          {/* Zweite Zeile: Preis und 24h-Änderung */}
          <View style={localStyles.row}>
            <Text style={{ fontFamily: "monospace", color: theme.text }}>
              {formatCurrency(item.current_price)}
            </Text>
            <Text
              style={{
                color:
                  item.price_change_percentage_24h < 0 ? "red" : "green",
              }}
            >
              {item.price_change_percentage_24h?.toFixed(2)}%
            </Text>
          </View>
          {/* Dritte Zeile: High und Low */}
          <View style={localStyles.row}>
            <Text style={{ color: theme.text }}>
              <Text style={localStyles.labelText}>High:</Text>{" "}
              {formatCurrency(item.high_24h)}
            </Text>
            <Text style={{ color: theme.text }}>
              <Text style={localStyles.labelText}>Low:</Text>{" "}
              {formatCurrency(item.low_24h)}
            </Text>
          </View>
          {/* Vierte Zeile: Volumen und Marketcap */}
          <View style={localStyles.row}>
            <Text style={{ color: theme.text }}>
              <Text style={localStyles.labelText}>Vol:</Text> {formatCurrency(item.total_volume)}
            </Text>
            <Text style={{ color: theme.text }}>
              <Text style={localStyles.labelText}>Cap:</Text> {formatCurrency(item.market_cap)}
            </Text>
          </View>
        </Card>
      )}
    />
  );
}
