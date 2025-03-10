import React, { useContext } from "react";
import { TouchableOpacity, View, StyleSheet, ViewStyle } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

interface CardProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  noGradient?: boolean;
}

export default function Card({
  onPress,
  children,
  style,
  noGradient = false,
}: CardProps) {
  const { styles, gradientColors } = createCardStyles();

  const content = noGradient ? (
    <View style={[styles.card, style]}>{children}</View>
  ) : (
    <LinearGradient colors={gradientColors} style={[styles.card, style]}>
      {children}
    </LinearGradient>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
  ) : (
    <View>{content}</View>
  );
}

function createCardStyles() {
  const { theme } = useContext(ThemeContext);
  const gradientStart = theme.accent + "22";
  const gradientEnd = theme.accent + "03";

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
