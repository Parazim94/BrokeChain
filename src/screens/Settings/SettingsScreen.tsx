import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { createStyles } from "../../styles/style";
import { Ionicons } from "@expo/vector-icons";
import { AccentColors } from "../../constants/accentColors";
import DropdownAccentPicker from "./SettingsComponents/DropdownAccentPicker";

export default function SettingsScreen() {
  const { colorTheme, setColorTheme, accent, setAccent, theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext); 
  const styles = createStyles();

  const toggleTheme = () => {
    setColorTheme(colorTheme === "light" ? "dark" : "light");
  };

  // Speichert die aktuellen Einstellungen (prefTheme: [colorTheme, accent])
  const handleSave = async () => {
    if (!user) return;
      
    const updatedUserData = {
      ...user,
      prefTheme: [colorTheme, accent]
    };
    const payload = updatedUserData;
    console.log(payload);
    try {
      const response = await fetch("https://broke-end.vercel.app/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Speichern fehlgeschlagen");
      }
      const updatedUser = await response.json();
      setUser(updatedUser);
      alert("Einstellungen gespeichert!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unerwarteter Fehler");
    }
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
        <Text style={{ color: "white", marginLeft: 8 }}>
          {colorTheme === "light" ? "Darkmode" : "Lightmode"}
        </Text>
      </TouchableOpacity>
      
      {/* Neue Dropdown-Auswahl für Akzentfarbe */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ color: theme.text, marginBottom: 10 }}>
          Wähle Akzentfarbe:
        </Text>
        <DropdownAccentPicker
          accent={accent}
          setAccent={setAccent}
          accentColors={AccentColors}
          themeBackground={theme.background}
        />
      </View>
      
      {/* Neuer Speichern-Button */}
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <TouchableOpacity
          onPress={handleSave}
          style={{
            padding: 10,
            backgroundColor: theme.accent,
            borderRadius: 5,
            width: "80%",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Speichern</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
