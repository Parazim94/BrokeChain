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
    shadowColor: theme.accent,    
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,       
    // borderTopColor: theme.accent,
    // borderTopWidth: 1,
    // borderLeftColor: theme.accent,
    // borderLeftWidth: 1, 
  },
})};
