import React, { useContext, useState } from "react";
import { View, Text } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { createStyles } from "../../styles/style";
import { AccentColors } from "../../constants/accentColors";
import DropdownAccentPicker from "./SettingsComponents/DropdownAccentPicker";
import Button from "@/src/components/Button"; // Neue Button-Komponente importieren

export default function SettingsScreen() {
  const { colorTheme, setColorTheme, accent, setAccent, theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext); 
  const styles = createStyles();
  const [isSaving, setIsSaving] = useState(false);

  const toggleTheme = () => {
    setColorTheme(colorTheme === "light" ? "dark" : "light");
  };

  // Speichert die aktuellen Einstellungen (prefTheme: [colorTheme, accent])
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const updatedUserData = {
      ...user,
      prefTheme: [colorTheme, accent]
    };
    const payload = updatedUserData;
    console.log(payload);
    try {
      const response = await fetch("https://broke-end.vercel.app/user/settings", {
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
      <Button
        onPress={toggleTheme}
        title={colorTheme === "light" ? "Darkmode" : "Lightmode"}
        icon={colorTheme === "light" ? "moon" : "sunny"}
        iconPosition="left"
        type="primary"
      />
      
      {/* Neue Dropdown-Auswahl für Akzentfarbe */}
      <View style={{ marginTop: 20, alignItems: "center" }}>
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
      
      {/* Speichern-Button mit der neuen Button-Komponente */}
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Button
          onPress={handleSave}
          title="Speichern"
          loading={isSaving}
          type="success"
          size="medium"
        />
      </View>
    </View>
  );
}
