import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
} from "react-native";
import Button from "@/src/components/UiComponents/Button";
import { Ionicons } from "@expo/vector-icons";
// Import default avatars and accent colors
import { AvatarIcons } from "../../constants/avatars";
import { AccentColors } from "../../constants/accentColors";
import { AuthContext } from "../../context/AuthContext";

// Define the avatar type
interface Avatar {
  icon: string;
  color: string;
}

interface DropdownAvatarPickerProps {
  avatar?: Avatar;
  setAvatar: (avatar: Avatar) => void;
  themeBackground: string;
  accentColor: string;
}

export default function DropdownAvatarPicker({
  avatar,
  setAvatar,
  themeBackground,
  accentColor,
}: DropdownAvatarPickerProps) {
  const [visible, setVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Icon-Auswahl, 2: Farb-Auswahl
  const { user } = useContext(AuthContext);

  // Initialisiere Icon und Farbe aus dem aktuellen Avatar oder User
  useEffect(() => {
    if (avatar) {
      setSelectedIcon(avatar.icon);
      setSelectedColor(avatar.color);
    } else if (user && user.icon && user.iconColor) {
      setSelectedIcon(user.icon);
      setSelectedColor(user.iconColor);
    } else {
      // Fallback zu Standardwerten
      setSelectedIcon(AvatarIcons[0]);
      setSelectedColor(AccentColors[0]);
    }
  }, [avatar, user]);

  // Aktualisiere den Avatar, wenn sich Icon oder Farbe ändert
  const updateAvatar = (icon?: string, color?: string) => {
    const newIcon = icon !== undefined ? icon : selectedIcon;
    const newColor = color !== undefined ? color : selectedColor;
    
    setSelectedIcon(newIcon);
    setSelectedColor(newColor);
    
    setAvatar({
      icon: newIcon,
      color: newColor
    });
  };

  // Öffne Modal und setze es auf den ersten Schritt
  const openModal = () => {
    setStep(1);
    setVisible(true);
  };

  // Schließe Modal und setze Avatar
  const completeSelection = () => {
    updateAvatar();
    setVisible(false);
    setStep(1); // Reset für nächstes Öffnen
  };

  // Berechne die ideale Anzahl der Spalten basierend auf der Bildschirmbreite
  const screenWidth = Dimensions.get('window').width;
  const modalWidth = Math.min(500, screenWidth * 0.9);
  const itemSize = 66; // Icon-Option-Größe + Margin
  const numColumns = Math.max(4, Math.floor(modalWidth / itemSize));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={openModal}
        style={styles.avatarButton}
      >
        <View
          style={[
            styles.currentAvatar,
            { backgroundColor: selectedColor || accentColor },
          ]}
        >
          <Ionicons
            name={(selectedIcon || "person-outline") as React.ComponentProps<typeof Ionicons>["name"]}
            size={24}
            color="#FFFFFF"
          />
        </View>
        <Ionicons
          name="chevron-down"
          size={16}
          color="#888"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View
            style={[styles.modalContent, { backgroundColor: themeBackground }]}
          >
            <Text style={[styles.modalTitle, { color: accentColor }]}>
              {step === 1 ? "Wähle ein Symbol" : "Wähle eine Farbe"}
            </Text>
            
            {/* Schritt 1: Icon-Auswahl */}
            {step === 1 && (
              <View style={styles.selectionContainer}>
                <FlatList
                  data={AvatarIcons}
                  keyExtractor={(item, index) => `icon-${index}`}
                  numColumns={numColumns}
                  renderItem={({ item: icon }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedIcon(icon);
                        setStep(2); // Nach Icon-Auswahl zur Farbauswahl wechseln
                      }}
                      style={[
                        styles.iconOption,
                        {
                          borderColor: selectedIcon === icon ? accentColor : "transparent",
                          backgroundColor: selectedColor,
                        },
                      ]}
                    >
                      <Ionicons name={icon as React.ComponentProps<typeof Ionicons>["name"]} size={30} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                  style={styles.itemGrid}
                />
              </View>
            )}
            
            {/* Schritt 2: Farb-Auswahl */}
            {step === 2 && (
              <View style={styles.selectionContainer}>
                <FlatList
                  data={AccentColors}
                  keyExtractor={(item, index) => `color-${index}`}
                  numColumns={numColumns}
                  renderItem={({ item: color }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedColor(color);
                        // Nach der Farbauswahl direkt abschließen
                        updateAvatar(undefined, color);
                        setVisible(false);
                        setStep(1); // Reset für nächstes Öffnen
                      }}
                      style={[
                        styles.colorOption,
                        {
                          backgroundColor: color,
                          borderColor: selectedColor === color ? accentColor : "transparent",
                        },
                      ]}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  )}
                  style={styles.itemGrid}
                />
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {step === 1 ? (
                // Im ersten Schritt: Nur Abbrechen
                <Button
                  onPress={() => setVisible(false)}
                  title="Abbrechen"
                  size="small"
                  type="secondary"
                  icon="close-circle"
                  iconPosition="left"
                />
              ) : (
                // Im zweiten Schritt: Zurück und Abbrechen
                <>
                  <Button
                    onPress={() => setStep(1)}
                    title="Zurück"
                    size="small"
                    type="secondary"
                    icon="arrow-back"
                    iconPosition="left"
                    style={{ marginRight: 10 }}
                  />
                  <Button
                    onPress={() => setVisible(false)}
                    title="Abbrechen"
                    size="small"
                    type="secondary"
                    icon="close-circle"
                    iconPosition="left"
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
  },
  avatarButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  currentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    flexDirection: "column",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: "90%",
    maxWidth: 500,
    maxHeight: 500, // Kleinere maximale Höhe, da wir weniger Elemente anzeigen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  selectionContainer: {
    width: "100%",
    height: 300, // Feste Höhe für die Auswahl
  },
  itemGrid: {
    width: "100%",
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
