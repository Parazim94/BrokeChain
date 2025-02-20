import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { createStyles } from "../../styles/style";
import { Ionicons } from "@expo/vector-icons"; // Neuer Import

export default function SettingsScreen() {
  const { colorTheme, setColorTheme } = useContext(ThemeContext);
  const styles = createStyles();

  const toggleTheme = () => {
    setColorTheme(colorTheme === "light" ? "dark" : "light");
  };

  return (
    <View style={styles.container}>
      <Text>⚙ Einstellungen</Text>
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          marginTop: 20,
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          backgroundColor: styles.accent.color,
          borderRadius: 5,
        }}
      >
        {colorTheme === "light" ? (
          <Ionicons
            name="moon"
            size={24}
            color={styles.defaultText.color}
          />
        ) : (
          <Ionicons
            name="sunny"
            size={24}
            color={styles.defaultText.color}
          />
        )}
        <Text style={{ color: styles.defaultText.color, marginLeft: 8 }}>
          Thema wechseln
        </Text>
      </TouchableOpacity>
    </View>
  );
}
