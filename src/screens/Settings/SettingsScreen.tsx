import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { createStyles } from "../../styles/style";
import { Ionicons } from "@expo/vector-icons";
import { AccentColors } from "../../constants/accentColors";
import DropdownAccentPicker from "./SettingsComponents/DropdownAccentPicker";

export default function SettingsScreen() {
  const { colorTheme, setColorTheme, accent, setAccent, theme } = useContext(ThemeContext);
  const styles = createStyles();

  const toggleTheme = () => {
    setColorTheme(colorTheme === "light" ? "dark" : "light");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          marginTop: 20,
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderRadius: 5,
          backgroundColor: styles.accent.color,
        }}
      >
        {colorTheme === "light" ? (
          <Ionicons name="moon" size={24} color={"white"} />
        ) : (
          <Ionicons name="sunny" size={24} color={styles.defaultText.color} />
        )}
        <Text style={{ color: "white", marginLeft: 8 }}>{colorTheme==="light"? "Darkmode":"Lightmode"}</Text>
      </TouchableOpacity>
      {/* Neue Dropdown-Auswahl für Akzentfarbe (Farben statt Text) */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ color: theme.text, marginBottom: 10 }}>Wähle Akzentfarbe:</Text>
        <DropdownAccentPicker
          accent={accent}
          setAccent={setAccent}
          accentColors={AccentColors}
          themeBackground={theme.background}
        />
      </View>
    </View>
  );
}
