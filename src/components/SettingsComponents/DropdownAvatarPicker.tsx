import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import Button from "@/src/components/UiComponents/Button";
import { Ionicons } from "@expo/vector-icons";
// Import default avatars as fallback
import { Avatars as DefaultAvatars } from "../../constants/avatars";

// Define the avatar type
interface Avatar {
  icon: string;
  color: string;
}

interface DropdownAvatarPickerProps {
  avatar?: Avatar;
  setAvatar: (avatar: Avatar) => void;
  avatars?: Avatar[];
  themeBackground: string;
  accentColor: string;
}

export default function DropdownAvatarPicker({
  avatar,
  setAvatar,
  avatars = [],
  themeBackground,
  accentColor,
}: DropdownAvatarPickerProps) {
  const [visible, setVisible] = useState(false);
  const [availableAvatars, setAvailableAvatars] = useState<Avatar[]>([]);

  // Initialize available avatars
  useEffect(() => {
    // Use provided avatars or fallback to default ones
    const avatarsToUse =
      avatars && avatars.length > 0 ? avatars : DefaultAvatars;
    console.log("DropdownAvatarPicker - Using avatars:", avatarsToUse.length);
    setAvailableAvatars(avatarsToUse);
  }, [avatars]);

  // Find default avatar if none is set
  const currentAvatar = avatar || availableAvatars[0] || DefaultAvatars[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.avatarButton}
      >
        <View
          style={[
            styles.currentAvatar,
            { backgroundColor: currentAvatar?.color || accentColor },
          ]}
        >
          <Ionicons
            name={currentAvatar?.icon || "person-outline"}
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
              Select Profile Avatar
            </Text>

            {/* Show avatar count for debugging */}
            <Text style={styles.debugText}>
              {availableAvatars.length} avatars available
            </Text>

            {/* Use ScrollView for many avatars */}
            <ScrollView style={styles.scrollView}>
              <View style={styles.avatarContainer}>
                {availableAvatars.map((avatarItem, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      console.log("Selected avatar at index:", index);
                      setAvatar(avatarItem);
                      setVisible(false);
                    }}
                    style={[
                      styles.avatarOption,
                      {
                        borderColor:
                          currentAvatar &&
                          currentAvatar.icon === avatarItem.icon &&
                          currentAvatar.color === avatarItem.color
                            ? accentColor
                            : "transparent",
                        backgroundColor: avatarItem.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={avatarItem.icon}
                      size={30}
                      color="#FFFFFF"
                    />

                    {/* Show checkmark only for selected avatar */}
                    {currentAvatar &&
                      currentAvatar.icon === avatarItem.icon &&
                      currentAvatar.color === avatarItem.color && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

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
    maxHeight: "80%",
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
  scrollView: {
    width: "100%",
    maxHeight: 400,
  },
  avatarContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingBottom: 10,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 8,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    position: "relative",
  },
  selectedIndicator: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: "#00aa00",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  buttonContainer: {
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  debugText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
  },
});
