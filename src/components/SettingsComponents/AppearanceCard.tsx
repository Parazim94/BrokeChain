import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/UiComponents/Button";
import DropdownAccentPicker from "../../components/SettingsComponents/DropdownAccentPicker";
import DropdownAvatarPicker from "../../components/SettingsComponents/DropdownAvatarPicker";
import Card from "../../components/UiComponents/Card";

// Update the interface to reflect the new Avatar type
interface Avatar {
  icon: string;
  color: string;
}


interface AppearanceCardProps {
  colorTheme: string;
  toggleTheme: () => void;
  accent: string;
  setAccent: (color: string) => void;
  avatar?: Avatar;
  setAvatar: (avatar: Avatar) => void;
  handleAppearanceUpdate: () => void;
  isUpdatingAppearance: boolean;
  theme: any;
  AccentColors: string[];
  Avatars?: Avatar[];
  styles: any;
  defaultText: any;
}

export default function AppearanceCard({
  colorTheme,
  toggleTheme,
  accent,
  setAccent,
  avatar,
  setAvatar,
  handleAppearanceUpdate,
  isUpdatingAppearance,
  theme,
  AccentColors,
  Avatars = [], // Default to empty array
  styles,
  defaultText,
}: AppearanceCardProps) {
  // Entferne die nicht mehr benötigten Avatar-Hilfsvariablen
  // da die Komponente jetzt direkt mit Icon und Farbe arbeitet

  // Handle avatar change
  const handleAvatarChange = (newAvatar: Avatar) => {
    console.log("Avatar changed to:", newAvatar);
    if (setAvatar && typeof setAvatar === "function") {
      setAvatar(newAvatar);
    }
  };

  return (
    <Card style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="color-palette" size={22} color={theme.accent} />
        <Text
          style={[
            defaultText,
            { backgroundColor: "transparent" },
            styles.sectionTitle,
          ]}
        >
          Appearance
        </Text>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <Text
            style={[
              defaultText,
              { backgroundColor: "transparent" },
              styles.label,
            ]}
          >
            Theme Mode
          </Text>
          <View style={styles.control}>
            <Button
              onPress={toggleTheme}
              title={colorTheme === "light" ? "Dark Mode" : "Light Mode"}
              icon={colorTheme === "light" ? "moon" : "sunny"}
              iconPosition="left"
              type="secondary"
            />
          </View>
        </View>
        <View style={styles.row}>
          <Text
            style={[
              defaultText,
              { backgroundColor: "transparent" },
              styles.label,
            ]}
          >
            Accent Color
          </Text>
          <View style={styles.control}>
            <DropdownAccentPicker
              accent={accent}
              setAccent={setAccent}
              accentColors={AccentColors}
              themeBackground={theme.background}
            />
          </View>
        </View>
        <View style={styles.row}>
          <Text
            style={[
              defaultText,
              { backgroundColor: "transparent" },
              styles.label,
            ]}
          >
            Profile Avatar
          </Text>
          <View style={styles.control}>
            <DropdownAvatarPicker
              avatar={avatar}
              setAvatar={handleAvatarChange}
              themeBackground={theme.background}
              accentColor={accent}
            />
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button
            onPress={handleAppearanceUpdate}
            title="Update Appearance"
            loading={isUpdatingAppearance}
            type="primary"
            size="small"
            icon="color-palette"
            iconPosition="left"
          />
        </View>
      </View>
    </Card>
  );
}
