import React, { useContext } from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

interface ButtonProps {
  onPress: () => void;
  title: string;
  type?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "small" | "medium" | "large";
  icon?: string; // Ionicons name
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  onPress,
  title,
  type = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useContext(ThemeContext);
  
  const buttonStyles = StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      paddingVertical: size === "small" ? 6 : size === "large" ? 12 : 10,
      paddingHorizontal: size === "small" ? 10 : size === "large" ? 24 : 16,
      backgroundColor: 
        type === "primary" ? theme.accent :
        type === "secondary" ? theme.background :
        type === "danger" ? "#ff5252" :
        type === "success" ? "#4caf50" :
        type === "outline" ? "transparent" : theme.accent,
      borderWidth: type === "outline" || type === "secondary" ? 1 : 0,
      borderColor: type === "outline" || type === "secondary" ? theme.accent : undefined,
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? "100%" : undefined,
      maxWidth: fullWidth ? 300 : undefined,
    },
    text: {
      color: 
        type === "outline" || type === "secondary" ? theme.text : "#ffffff",
      fontWeight: "500",
      fontSize: size === "small" ? 12 : size === "large" ? 16 : 14,
      textAlign: "center",
    },
    icon: {
      marginRight: iconPosition === "left" && title ? 8 : 0,
      marginLeft: iconPosition === "right" && title ? 8 : 0,
    }
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[buttonStyles.button, style]}
    >
      {loading ? (
        <ActivityIndicator color={buttonStyles.text.color} size="small" />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons 
              name={icon as any} 
              size={size === "small" ? 14 : size === "large" ? 20 : 16} 
              color={buttonStyles.text.color} 
              style={buttonStyles.icon} 
            />
          )}
          <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons 
              name={icon as any} 
              size={size === "small" ? 14 : size === "large" ? 20 : 16} 
              color={buttonStyles.text.color} 
              style={buttonStyles.icon} 
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
