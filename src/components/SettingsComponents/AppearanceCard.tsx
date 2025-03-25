import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/UiComponents/Button";
import DropdownAccentPicker from "../../components/SettingsComponents/DropdownAccentPicker";
import DropdownAvatarPicker from "../../components/SettingsComponents/DropdownAvatarPicker";
import Card from "../../components/UiComponents/Card";
// Import Avatars directly to ensure they're available
import { Avatars as DefaultAvatars } from "../../constants/avatars";

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
  // Use DefaultAvatars if Avatars prop is empty
  const [localAvatars, setLocalAvatars] = useState<Avatar[]>([]);
  const [localAvatar, setLocalAvatar] = useState<Avatar | undefined>(avatar);

  // Initialize avatars from imported constant if prop is empty
  useEffect(() => {
    const avatarsToUse =
      Avatars && Avatars.length > 0 ? Avatars : DefaultAvatars;
    console.log(
      "Using avatars:",
      avatarsToUse.length > 0 ? "From import" : "Empty array"
    );
    setLocalAvatars(avatarsToUse);

    // Initialize avatar if not set
    if (!localAvatar && avatarsToUse.length > 0) {
      console.log("Initializing avatar with:", avatarsToUse[0]);
      setLocalAvatar(avatarsToUse[0]);
      if (setAvatar && typeof setAvatar === "function") {
        setAvatar(avatarsToUse[0]);
      }
    }
  }, [Avatars, localAvatar]); // Remove setAvatar from dependency array to avoid infinite loops

  // Handle when avatar prop changes
  useEffect(() => {
    if (avatar && JSON.stringify(avatar) !== JSON.stringify(localAvatar)) {
      setLocalAvatar(avatar);
    }
  }, [avatar, localAvatar]); // Add localAvatar to the dependency array

  // Handle avatar change
  const handleAvatarChange = (newAvatar: Avatar) => {
    console.log("Avatar changed to:", newAvatar);
    setLocalAvatar(newAvatar);
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
              avatar={localAvatar || localAvatars[0]}
              setAvatar={handleAvatarChange}
              avatars={localAvatars}
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
