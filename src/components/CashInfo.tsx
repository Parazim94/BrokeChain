import { Text, View, Platform } from "react-native";
import React, { useContext } from "react";
import { createStyles } from "../styles/style";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { DataContext } from "@/src/context/DataContext";

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
      <View
        style={{
          minWidth: 80,
          maxWidth: 120,
          alignSelf: "center",
          paddingHorizontal: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 16,
          }}
        >
          <Text style={[styles.defaultText, { fontSize: 10, lineHeight: 16, marginRight: 4 }]}>
            Cash
          </Text>
          <Text
            style={[
              styles.defaultText,
              {
                fontSize: 10,
                lineHeight: 16,
                fontFamily: Platform.OS === "ios" ? undefined : "monospace",
                fontWeight: Platform.OS === "ios" ? "600" : undefined,
              },
            ]}
          >
            {formatCurrency(user ? user.cash : 0)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 16,
            width: "100%",
          }}
        >
          <Text style={[styles.defaultText, { fontSize: 10, lineHeight: 16, marginRight: 4 }]}>
            Total
          </Text>
          <Text
            style={[
              styles.defaultText,
              {
                fontSize: 10,
                lineHeight: 16,                
                fontFamily: Platform.OS === "ios" ? undefined : "monospace",
                fontWeight: Platform.OS === "ios" ? "600" : undefined,
              },
            ]}
          >
            {formatCurrency(total)}
          </Text>
        </View>
      </View>
    );
  } else return <></>;
}

export default CashInfo;
