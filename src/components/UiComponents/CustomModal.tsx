import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import Card from "./Card";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  showCloseButton?: boolean;
  modalStyle?: object;
  backdropStyle?: object;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  children,
  width,
  height,
  showCloseButton = true,
  modalStyle = {},
  backdropStyle = {},
}) => {
  const { theme } = useContext(ThemeContext);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Angepasste Modal-Größenberechnung
  const defaultWidth =
    Platform.OS === "web"
      ? Math.min(650, screenWidth * 0.9)
      : screenWidth * 0.85; // Leicht verkleinert für mobile Geräte

  const defaultHeight =
    Platform.OS === "web"
      ? "auto"
      : Math.min(screenHeight * 0.6, 600); // Beschränkte Höhe für mobile Geräte

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade" // Geändert zu "fade" für sanftere Übergänge
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={[styles.modalOverlay, backdropStyle]}>
          <Card
          style={StyleSheet.flatten([
            styles.modalContainer,
            {
              width: width || defaultWidth,
              height: height || defaultHeight,
              maxHeight: screenHeight * 0.8,
              maxWidth: screenWidth * 0.95, // Maximale Breite hinzugefügt
            },
            modalStyle,
          ])}
        >
          {showCloseButton && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={36} color={"red"} />
            </TouchableOpacity>
          )}

          {children}
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    ...(Platform.OS === "web" ? { backdropFilter: "blur(5px)" } : {}),
  },
  modalContainer: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 4,
  },
});

export default CustomModal;
