import React, { useContext } from "react";
import { TouchableOpacity, View, StyleSheet, ViewStyle } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

interface CardProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ onPress, children, style }: CardProps) {
  const { styles, gradientColors } = createCardStyles();
  
  const content = (
    <LinearGradient
      colors={gradientColors}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress}>
      {content}
    </TouchableOpacity>
  ) : (
    <View>
      {content}
    </View>
  );
}

function createCardStyles() {
  const { theme } = useContext(ThemeContext);
  const gradientStart = theme.accent + "22";
  const gradientEnd = theme.background;

  const gradientColors = [gradientStart, gradientEnd] as const;

  return {
    styles: StyleSheet.create({
      card: {
        padding: 12,
        margin: 4,
        width: "100%",
        borderRadius: 8,       
      },
    }),
    gradientColors,
  };
}
