import React, { useState } from "react";
import { Modal, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Button from "@/src/components/UiComponents/Button";
import { Ionicons } from "@expo/vector-icons";

interface DropdownAccentPickerProps {
  accent: string;
  setAccent: (color: string) => void;
  accentColors: string[];
  themeBackground: string;
}

export default function DropdownAccentPicker({
  accent,
  setAccent,
  accentColors,
  themeBackground,
}: DropdownAccentPickerProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.colorButton}
      >
        <View style={[styles.currentAccent, { backgroundColor: accent }]} />
        <Ionicons
          name="chevron-down"
          size={16}
          color="#888"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
          activeOpacity={0.9}
        >
          <View
            style={[styles.modalContent, { backgroundColor: themeBackground }]}
          >
            <Text style={[styles.modalTitle, { color: accent }]}>
              Select Accent Color
            </Text>

            {/* Color grid */}
            <View style={styles.colorContainer}>
              {accentColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    setAccent(color);
                    setVisible(false);
                  }}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderColor: color === accent ? "#fff" : "transparent",
                    },
                  ]}
                >
                  {color === accent && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#fff"
                      style={styles.checkmark}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Close button */}
            <View style={styles.buttonContainer}>
              <Button
                onPress={() => setVisible(false)}
                title="Close"
                size="small"
                type="secondary"
                icon="close-circle"
                iconPosition="left"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
  },
  colorButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  currentAccent: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
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
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  checkmark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
});
