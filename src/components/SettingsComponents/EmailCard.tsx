import React from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/Button";
import Card from "../../components/Card";

interface EmailCardProps {
  newEmail: string;
  setNewEmail: (email: string) => void;
  handleEmailChange: () => Promise<void>;
  isChangingEmail: boolean;
  theme: any;
  styles: any;
  defaultText: any;
}

export default function EmailCard({
  newEmail,
  setNewEmail,
  handleEmailChange,
  isChangingEmail,
  theme,
  styles,
  defaultText
}: EmailCardProps) {
  return (
    <Card style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="mail" size={22} color={theme.accent} />
        <Text style={[defaultText, { backgroundColor: "transparent" }, styles.sectionTitle]}>Email Address</Text>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>Current Email</Text>
          <View style={styles.control}>
            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              style={[defaultText, styles.input, { width: "100%" }]}
              placeholder="Your email address"
              placeholderTextColor={theme.text + "80"}
            />
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button
            onPress={handleEmailChange}
            title="Update Email"
            loading={isChangingEmail}
            type="primary"
            size="small"
            icon="checkmark-circle"
            iconPosition="left"
          />
        </View>
      </View>
    </Card>
  );
}
