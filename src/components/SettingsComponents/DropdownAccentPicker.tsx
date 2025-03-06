import React, { useState } from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import Button from "@/src/components/Button"; // Button-Komponente importieren

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
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[styles.currentAccent, { backgroundColor: accent }]}
      />
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: themeBackground }]}
          >
            {/* Farbauswahl in einem eigenen Container */}
            <View style={styles.colorContainer}>
              {accentColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    setAccent(color);
                    setVisible(false);
                  }}
                  style={[
                    styles.switch,
                    {
                      backgroundColor: color,
                      borderColor: color === accent ? "white" : "transparent",
                    },
                  ]}
                />
              ))}
            </View>
            
            {/* Schließen-Button in separater Zeile */}
            <View style={styles.buttonContainer}>
              <Button
                onPress={() => setVisible(false)}
                title="Schließen"
                size="small"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  currentAccent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "gray",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flexDirection: "column",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 280,  
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 15,  
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  switch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
  },
});
