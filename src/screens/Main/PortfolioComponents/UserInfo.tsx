import React from "react";
import { View, Text } from "react-native";
import Sparkline from "@/src/components/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface UserInfoProps {
  userName: string;
  cash: number;
  history: number[];
  theme: any;
  styles: any;
}

export default function UserInfo({ userName, cash, history, theme, styles }: UserInfoProps) {
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
        <Text style={styles.header}>{userName} </Text>
        <Text style={styles.header}>{formatCurrency(cash)}</Text>
      </View>
      <View style={styles.hr} />
      <Text style={{ color: theme.text }}>History</Text>
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