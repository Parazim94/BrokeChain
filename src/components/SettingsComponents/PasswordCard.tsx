import React from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/Button";
import Card from "../../components/Card";

interface PasswordCardProps {
  currentPassword: string;
  setCurrentPassword: (p: string) => void;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  handlePasswordChange: () => Promise<void>;
  isChangingPassword: boolean;
  passwordError: string;
  theme: any;
  styles: any;
  defaultText: any;
}

export default function PasswordCard({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handlePasswordChange,
  isChangingPassword,
  passwordError,
  theme,
  styles,
  defaultText,
}: PasswordCardProps) {
  return (
    <Card style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="lock-closed" size={22} color={theme.accent} />
        <Text style={[defaultText, { backgroundColor: "transparent" }, styles.sectionTitle]}>
          Password
        </Text>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
            Current Password
          </Text>
          <View style={styles.control}>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={[defaultText, styles.input]}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.text + "80"}
            />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
            New Password
          </Text>
          <View style={styles.control}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              style={[defaultText, styles.input]}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.text + "80"}
            />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
            Confirm New Password
          </Text>
          <View style={styles.control}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={[defaultText, styles.input]}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.text + "80"}
            />
          </View>
        </View>
        {passwordError ? (
          <Text style={[styles.error, { backgroundColor: "transparent" }]}>{passwordError}</Text>
        ) : null}
        <View style={styles.buttonRow}>
          <Button
            onPress={handlePasswordChange}
            title="Change Password"
            loading={isChangingPassword}
            type="primary"
            size="small"
            icon="shield-checkmark"
            iconPosition="left"
          />
        </View>
      </View>
    </Card>
  );
}
