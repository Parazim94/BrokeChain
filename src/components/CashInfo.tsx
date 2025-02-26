import { Text, View } from "react-native";
import React, { Component, useContext } from "react";
import { createStyles } from "../styles/style";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "@/src/utils/formatCurrency";

export function CashInfo() {
  const { user } = useContext(AuthContext);
  const styles = createStyles();
  console.log(user.positions);
  return (
    <View>
      <Text style={styles.defaultText}>{formatCurrency(user.cash)}</Text>
    </View>
  );
}

export default CashInfo;
