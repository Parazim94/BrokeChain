import React, { useState } from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";

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
        style={[
          styles.currentAccent,
          { backgroundColor: accent },
        ]}
      />
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: themeBackground }]}>
            {accentColors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  setAccent(color);
                  setVisible(false);
                }}
                style={[
                  styles.switch,
                  { backgroundColor: color, borderColor: color === accent ? "white" : "transparent" },
                ]}
              />
            ))}
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
  },
  modalContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    borderRadius: 10,
  },
  switch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
  },
});
