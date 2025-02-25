import React from "react";
import { View, Text } from "react-native";
import Sparkline from "@/src/components/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface UserInfoProps {
  userName: string;
  cash: number;
  positionsValue: number;
  combinedValue: number;
  history: number[];
  theme: any;
  styles: any;
}

export default function UserInfo({
  userName,
  cash,
  positionsValue,
  combinedValue,
  history,
  theme,
  styles,
}: UserInfoProps) {
  return (
    <View
      style={{
        maxWidth: 1024,
        margin: "auto",
        width: "100%",
        padding: 10,
        backgroundColor: theme.background,
      }}
    >
      <View style={styles.row}>
        <Text style={styles.header}>{userName}</Text>
      </View>
      <View style={styles.hr} />
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.text, fontSize: 16 }}>Cash</Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.text, fontSize: 16, textAlign: "right" }}>
            {formatCurrency(cash)}
          </Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.text, fontSize: 16 }}>Positions</Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.text, fontSize: 16, textAlign: "right" }}>
            {formatCurrency(positionsValue)}
          </Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.accent, fontSize: 16 }}>Total</Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.accent, fontSize: 16, textAlign: "right" }}>
            {formatCurrency(combinedValue)}
          </Text>
        </View>
      </View>
      <View style={styles.hr} />
      <Text style={{ color: theme.text, marginVertical: 4 }}>History</Text>
      <Sparkline
        prices={history}
        width="100%"
        height={80}
        stroke={theme.accent}
        strokeWidth={2}
      />
    </View>
  );
}