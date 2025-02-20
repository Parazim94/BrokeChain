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
    padding: 12,
    margin: 8,
    borderRadius: 8,
    shadowColor: styles.accent.color, 
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: "85%",
  },
})};
