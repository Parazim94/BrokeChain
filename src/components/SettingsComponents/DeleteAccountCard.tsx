import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/UiComponents/Button";
import Card from "@/src/components/UiComponents/Card";

interface DeleteAccountCardProps {
  handleDeleteAccount: () => Promise<void>;
  isDeleting: boolean;
  theme: any;
  styles: any;
  defaultText: any;
}

export default function DeleteAccountCard({
  handleDeleteAccount,
  isDeleting,
  theme,
  styles,
  defaultText,
}: DeleteAccountCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <Card style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="trash" size={22} color="#ff375f" />
        <Text style={[defaultText, { backgroundColor: "transparent", color: "#ff375f" }, styles.sectionTitle]}>
          Delete Account
        </Text>
      </View>
      <View style={styles.sectionContent}>
        <Text style={[defaultText, { marginBottom: 15, backgroundColor: "transparent" }]}>
          By deleting your account, you will lose all your settings and favorite coins. This action cannot be undone.
        </Text>
        <View style={styles.buttonRow}>
          <Button
            onPress={() => setShowConfirmation(true)}
            title="Delete Account"
            loading={isDeleting}
            type="danger"
            size="small"
            icon="trash"
            iconPosition="left"
          />
        </View>

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmation}
          transparent
          animationType="fade"
        >
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}>
            <View style={{
              width: "80%",
              backgroundColor: theme.background,
              borderRadius: 10,
              padding: 20,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Ionicons name="warning" size={50} color="#ff375f" style={{ marginBottom: 15 }} />
              <Text style={[defaultText, { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" }]}>
                Are you sure you want to delete your account?
              </Text>
              <Text style={[defaultText, { marginBottom: 20, textAlign: "center" }]}>
                This action cannot be undone. All your data will be permanently removed.
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                <Button
                  onPress={() => setShowConfirmation(false)}
                  title="Cancel"
                  type="secondary"
                  size="small"
                  icon="close-circle"
                  iconPosition="left"
                  style={{ marginRight: 10 }}
                />
                <Button
                  onPress={() => {
                    setShowConfirmation(false);
                    handleDeleteAccount();
                  }}
                  title="Yes, Delete"
                  type="danger"
                  size="small"
                  icon="trash"
                  iconPosition="left"
                  loading={isDeleting}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Card>
  );
}
