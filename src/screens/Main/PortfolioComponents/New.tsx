import React from "react";
import { FlatList, Image, Text, View, StyleSheet } from "react-native";
import Card from "@/src/components/Card";
import Sparkline from "@/src/components/Sparkline";
import { createStyles } from "@/src/styles/style";

interface NewProps {
  data: any[];
  theme: any;
}

export default function New({ data, theme }: NewProps) {
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
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 3,
      width: "95%",
      minWidth: "95%",
    },
    name: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "bold",
    },
    amount: {
      color: theme.text,
      fontSize: 16,
    },
  });

  return (
    <FlatList
      data={data}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <Card onPress={() => {}} style={localStyles.card}>
          {/* Zeile 1: Bild, Name und Sparkline */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            {item.marketInfo && (
              <Image
                source={{ uri: item.marketInfo.image }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 8,
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={localStyles.name}>
                {item.coinId}{" "}
                {item.marketInfo?.symbol ? `(${item.marketInfo.symbol})` : ""}
              </Text>
              {item.marketInfo && (
                <Sparkline
                  prices={item.marketInfo.sparkline.price}
                  width="100%"
                  height={40}
                  stroke={theme.accent}
                  strokeWidth={2}
                />
              )}
            </View>
          </View>
          {/* Zeile 2: Amount, 24h-Änderung und Value */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={localStyles.amount}>
              {item.amount} {item.marketInfo?.symbol || ""}
            </Text>
            {item.marketInfo && (
              <>
                <Text
                  style={{
                    color:
                      item.marketInfo.price_change_percentage_24h < 0
                        ? "red"
                        : "green",
                    marginHorizontal: 8,
                  }}
                >
                  {item.marketInfo.price_change_percentage_24h?.toFixed(2)}%
                </Text>
                <Text style={{ color: theme.text }}>
                  {(
                    item.amount * item.marketInfo.current_price
                  ).toLocaleString()}{" "}
                  $
                </Text>
              </>
            )}
          </View>
        </Card>
      )}
    />
  );
}
