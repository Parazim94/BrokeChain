import { Text, View } from "react-native";
import React, { Component, useContext } from "react";
import { createStyles } from "../styles/style";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { DataContext } from "@/src/context/DataContext";
import { SafeAreaView } from "react-native-safe-area-context";
export function CashInfo() {
  const styles = createStyles();
  const context = useContext(DataContext);
  const { user } = useContext(AuthContext);
  if (user) {
    let total = user.cash;
    const positions = user && user.positions ? Object.keys(user.positions) : [];
    positions.forEach((key) => {
      const coin = context?.marketData.find((item) => item.symbol === key);

      if (coin?.current_price) {
        total += coin.current_price * user.positions[key];
      }
    });

    return (
      <SafeAreaView
        style={{
          width: "15%",
          minWidth: 120,
          alignSelf: "flex-end",
          margin: 10,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.defaultText}>Cash</Text>
          <Text style={styles.defaultText}>
            {formatCurrency(user ? user.cash : 0)}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.defaultText}>Total</Text>
          <Text style={styles.defaultText}>{formatCurrency(total)}</Text>
        </View>
      </SafeAreaView>
    );
  } else return <></>;
}

export default CashInfo;
