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
      <View style={styles.container}>
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Cash: {formatCurrency(cash)}
        </Text>
        <Text style={{ color: theme.text, fontSize: 16, marginHorizontal: 8 }}>
          Positions: {formatCurrency(positionsValue)}
        </Text>
        <Text style={{ color: theme.accent, fontSize: 16 }}>
          Total: {formatCurrency(combinedValue)}
        </Text>
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