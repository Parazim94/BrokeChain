import { Text, View } from "react-native";
import React, { Component, useContext } from "react";
import { createStyles } from "../styles/style";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { DataContext } from "@/src/context/DataContext";
export function CashInfo() {
  const context = useContext(DataContext);
  console.log(context);
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
