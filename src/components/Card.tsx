import React, { useContext } from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { createStyles } from "../styles/style";

interface CardProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ onPress, children, style }: CardProps) {
const styles = createCardStyles();
  
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.card, style]}>
        {children}
      </View>
    </TouchableOpacity>
  );
}


function createCardStyles() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles();
return StyleSheet.create({
  card: {
    backgroundColor: theme.background,
    padding: 12,
    margin: 4,
    width: "96%",    
    borderRadius: 8,
    // Ersetze die veralteten "shadow*" Props mit "boxShadow":
    boxShadow: `0px 0px 6px 0px ${theme.accent}`,
  },
})};
