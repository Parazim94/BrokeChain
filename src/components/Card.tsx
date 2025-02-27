import React, { useContext } from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { createStyles } from "../styles/style";
import { LinearGradient } from "expo-linear-gradient";

interface CardProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ onPress, children, style }: CardProps) {
  const { styles, gradientColors } = createCardStyles();
  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={gradientColors}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function createCardStyles() {
  const { theme } = useContext(ThemeContext);
  const gradientStart = theme.accent + "11";
  const gradientEnd = theme.background ;

  const gradientColors = [gradientStart, gradientEnd] as const;

  return {
    styles: StyleSheet.create({
      card: {
        padding: 12,
        margin: 4,
        width: "96%",
        borderRadius: 8,
        // boxShadow: `0px 1px 2px ${theme.accent + "11"}`,
       
      },
    }),
    gradientColors,
  };
}
