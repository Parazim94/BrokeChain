import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/Button";
import DropdownAccentPicker from "../../components/SettingsComponents/DropdownAccentPicker";
import Card from "../../components/Card";

interface AppearanceCardProps {
  colorTheme: string;
  toggleTheme: () => void;
  accent: string;
  setAccent: (color: string) => void;
  handleAppearanceUpdate: () => void;
  isUpdatingAppearance: boolean;
  theme: any;
  AccentColors: string[];
  styles: any;
  defaultText: any;
}

export default function AppearanceCard({
  colorTheme,
  toggleTheme,
  accent,
  setAccent,
  handleAppearanceUpdate,
  isUpdatingAppearance,
  theme,
  AccentColors,
  styles,
  defaultText,
}: AppearanceCardProps) {
  return (
    <Card style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="color-palette" size={22} color={theme.accent} />
        <Text style={[defaultText, { backgroundColor: "transparent" }, styles.sectionTitle]}>
          Appearance
        </Text>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
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
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
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
