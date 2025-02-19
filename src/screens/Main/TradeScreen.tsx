import React from "react";
import { View, Text } from "react-native";
import { createStyles } from "@/src/styles/style";
import { useRoute, RouteProp } from "@react-navigation/native";
import Chart from "@/src/components/Chart";

type TradeScreenRouteParams = {
  Trade: { coin: any };
};

export default function TradeScreen() {
  const styles = createStyles();
  const route = useRoute<RouteProp<TradeScreenRouteParams, "Trade">>();
  const coin = route.params.coin;

  return (
    <View style={styles.container}>
      {/* d3 Chart-Komponente einfügen */}
      <Chart coin={coin || { name: "BTC" }} />
    </View>
  );
}
