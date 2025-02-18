import React from "react";
import { View, Text } from "react-native";
import { createStyles } from "@/src/styles/style";
import { useRoute, RouteProp } from "@react-navigation/native";

type TradeScreenRouteParams = {
  Trade: { coin: any }; // Alternativ: coin: Ticker (importieren Sie den Ticker-Typ)
};

export default function TradeScreen() {
  const styles = createStyles();
  const route = useRoute<RouteProp<TradeScreenRouteParams, "Trade">>();
  const coin = route.params?.coin;

  return (
    <View style={styles.container}>
      <Text style={styles.defaultText}>
        💹 Trading-Bereich {coin ? `– ${coin.name}` : ""}
      </Text>
  
    </View>
  );
}
