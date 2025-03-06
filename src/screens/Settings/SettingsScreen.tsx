import React, { useContext, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { createStyles } from "../../styles/style";
import { AccentColors } from "../../constants/accentColors";
import DropdownAccentPicker from "./SettingsComponents/DropdownAccentPicker";
import Button from "@/src/components/Button";
import { useData } from "@/src/context/DataContext";
import { Ionicons } from "@expo/vector-icons";
import { useAlert } from "@/src/context/AlertContext";

export default function SettingsScreen() {
  const { colorTheme, setColorTheme, accent, setAccent, theme } =
    useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext);
  const { marketData } = useData();
  const { showAlert } = useAlert();
  const styles = createStyles();
  const [isSaving, setIsSaving] = useState(false);

  // States for favorites management
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(user?.favorites || []);

  // States for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // States for email change
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Filtered coins based on search query
  const filteredCoins = useMemo(() => {
    if (!searchQuery) return [];
    return marketData.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.symbol || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, marketData]);

  const toggleTheme = () => {
    setColorTheme(colorTheme === "light" ? "dark" : "light");
  };

  // Add favorite
  const addFavorite = (symbol: string) => {
    if (!favorites.includes(symbol)) {
      setFavorites([...favorites, symbol]);
      setSearchQuery("");
      setIsSearchActive(false);
    }
  };

  // Remove favorite
  const removeFavorite = (symbol: string) => {
    setFavorites(favorites.filter((fav) => fav !== symbol));
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Reset error
    setPasswordError("");

    // Validation
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Implement password change API call here
      const response = await fetch(
        "https://broke-end.vercel.app/user/change-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Password change failed");
      }

      showAlert({
        type: "success",
        title: "Password Updated",
        message: "Your password has been changed successfully",
      });

      // Reset fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle email change
  const handleEmailChange = async () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showAlert({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsChangingEmail(true);

    try {
      // Implement email change API call here
      const response = await fetch(
        "https://broke-end.vercel.app/user/change-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            newEmail,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Email change failed");
      }

      const updatedUser = { ...user, email: newEmail };
      setUser(updatedUser);

      showAlert({
        type: "success",
        title: "Email Updated",
        message: "Your email has been changed successfully",
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Save settings
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const updatedUserData = {
      ...user,
      prefTheme: [colorTheme, accent],
      favorites: favorites,
      email: newEmail,
    };

    try {
      const response = await fetch(
        "https://broke-end.vercel.app/user/settings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUserData),
        }
      );

      if (!response.ok) {
        throw new Error("Saving failed");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);

      showAlert({
        type: "success",
        title: "Settings Saved",
        message: "Your settings have been saved successfully!",
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Custom styles for this screen
  const settingsStyles = StyleSheet.create({
    container: {
      width: "100%",
      maxWidth: 800,
      alignSelf: "center",
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    header: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 30,
      marginTop: 10,
      color: theme.accent,
    },
    sectionContainer: {
      marginBottom: 30,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.accent + "40",
      backgroundColor: theme.background,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionHeader: {
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.accent + "40",
      // Remove background completely
      backgroundColor: "transparent",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 10,
    },
    sectionContent: {
      padding: 15,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    label: {
      width: "40%",
      fontSize: 16,
      fontWeight: "500",
    },
    control: {
      width: "60%",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    input: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.accent + "60",
      borderRadius: 8,
      padding: 10,
      color: theme.text,
      flex: 1,
    },
    error: {
      color: "#ff375f",
      marginTop: 5,
      fontSize: 14,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
    },
    saveButtonContainer: {
      alignItems: "center",
      marginTop: 30,
    },
    searchResultsContainer: {
      maxHeight: 200,
      backgroundColor: theme.background,
      borderRadius: 8,
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.accent,
    },
    favoriteItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.accent + "30",
    },
    emptyText: {
      textAlign: "center",
      padding: 15,
      fontStyle: "italic",
    },
  });

  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        position: "relative",
        backgroundColor: theme.background,
      }}
    >
      <ScrollView
        style={[
          styles.container,
          {
            // Fix for web scrolling - use absolute positioning with explicit height
            position: Platform.OS === "web" ? "absolute" : "relative",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: Platform.OS === "web" ? "100%" : "auto",
            overflow: Platform.OS === "web" ? "scroll" : undefined,
          },
        ]}
        contentContainerStyle={{
          paddingVertical: 20,
          paddingBottom: 60, // Add extra padding at bottom
        }}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <View style={settingsStyles.container}>
          <Text style={[styles.defaultText, settingsStyles.header]}>
            Account Settings
          </Text>

          {/* Theme Settings */}
          <View style={settingsStyles.sectionContainer}>
            <View style={settingsStyles.sectionHeader}>
              <Ionicons name="color-palette" size={22} color={theme.accent} />
              <Text style={[styles.defaultText, settingsStyles.sectionTitle]}>
                Appearance
              </Text>
            </View>
            <View style={settingsStyles.sectionContent}>
              <View style={settingsStyles.row}>
                <Text style={[styles.defaultText, settingsStyles.label]}>
                  Theme Mode
                </Text>
                <View style={settingsStyles.control}>
                  <Button
                    onPress={toggleTheme}
                    title={colorTheme === "light" ? "Dark Mode" : "Light Mode"}
                    icon={colorTheme === "light" ? "moon" : "sunny"}
                    iconPosition="left"
                    type="secondary"
                  />
                </View>
              </View>

              <View style={settingsStyles.row}>
                <Text style={[styles.defaultText, settingsStyles.label]}>
                  Accent Color
                </Text>
                <View style={settingsStyles.control}>
                  <DropdownAccentPicker
                    accent={accent}
                    setAccent={setAccent}
                    accentColors={AccentColors}
                    themeBackground={theme.background}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Email Settings */}
          <View style={settingsStyles.sectionContainer}>
            <View style={settingsStyles.sectionHeader}>
              <Ionicons name="mail" size={22} color={theme.accent} />
              <Text style={[styles.defaultText, settingsStyles.sectionTitle]}>
                Email Address
              </Text>
            </View>
            <View style={settingsStyles.sectionContent}>
              <View style={settingsStyles.row}>
                <Text style={[styles.defaultText, settingsStyles.label]}>
                  Current Email
                </Text>
                <View style={settingsStyles.control}>
                  <TextInput
                    value={newEmail}
                    onChangeText={setNewEmail}
                    style={[styles.defaultText, settingsStyles.input]}
                    placeholder="Your email address"
                    placeholderTextColor={theme.text + "80"}
                  />
                </View>
              </View>

              <View style={settingsStyles.buttonRow}>
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
          </View>

          {/* Password Change */}
          <View style={settingsStyles.sectionContainer}>
            <View style={settingsStyles.sectionHeader}>
              <Ionicons name="lock-closed" size={22} color={theme.accent} />
              <Text style={[styles.defaultText, settingsStyles.sectionTitle]}>
                Password
              </Text>
            </View>
            <View style={settingsStyles.sectionContent}>
              <View style={settingsStyles.row}>
                <Text style={[styles.defaultText, settingsStyles.label]}>
                  Current Password
                </Text>
                <View style={settingsStyles.control}>
                  <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    style={[styles.defaultText, settingsStyles.input]}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={theme.text + "80"}
                  />
                </View>
              </View>

              <View style={settingsStyles.row}>
                <Text style={[styles.defaultText, settingsStyles.label]}>
                  New Password
                </Text>
                <View style={settingsStyles.control}>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={[styles.defaultText, settingsStyles.input]}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={theme.text + "80"}
                  />
                </View>
              </View>

              <View style={settingsStyles.row}>
                <Text style={[styles.defaultText, settingsStyles.label]}>
                  Confirm New Password
                </Text>
                <View style={settingsStyles.control}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={[styles.defaultText, settingsStyles.input]}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={theme.text + "80"}
                  />
                </View>
              </View>

              {passwordError ? (
                <Text style={[settingsStyles.error]}>{passwordError}</Text>
              ) : null}

              <View style={settingsStyles.buttonRow}>
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
          </View>

          {/* Favorites Management */}
          <View style={settingsStyles.sectionContainer}>
            <View style={settingsStyles.sectionHeader}>
              <Ionicons name="star" size={22} color={theme.accent} />
              <Text style={[styles.defaultText, settingsStyles.sectionTitle]}>
                Favorite Coins
              </Text>
            </View>
            <View style={settingsStyles.sectionContent}>
              <View style={settingsStyles.row}>
                <Text style={[styles.defaultText, settingsStyles.label]}>
                  Add Favorites
                </Text>
                <View style={settingsStyles.control}>
                  <Button
                    onPress={() => setIsSearchActive(!isSearchActive)}
                    title={isSearchActive ? "Cancel" : "Search Coins"}
                    icon={isSearchActive ? "close-circle" : "search"}
                    iconPosition="left"
                    type="secondary"
                    size="small"
                  />
                </View>
              </View>

              {isSearchActive && (
                <>
                  <View style={settingsStyles.row}>
                    <Text style={[styles.defaultText, settingsStyles.label]}>
                      Search
                    </Text>
                    <View style={settingsStyles.control}>
                      <TextInput
                        placeholder="Type coin name or symbol..."
                        placeholderTextColor={theme.text + "80"}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.defaultText, settingsStyles.input]}
                        autoFocus
                      />
                    </View>
                  </View>

                  {searchQuery.length > 0 && (
                    <View style={settingsStyles.searchResultsContainer}>
                      <FlatList
                        data={filteredCoins}
                        keyExtractor={(item) => item.id || item.symbol}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={settingsStyles.favoriteItem}
                            onPress={() =>
                              addFavorite(item.symbol.toLowerCase())
                            }
                          >
                            <Text
                              style={[
                                styles.defaultText,
                                { fontWeight: "500" },
                              ]}
                            >
                              {item.name} ({item.symbol?.toUpperCase()})
                            </Text>
                            <Ionicons
                              name="add-circle-outline"
                              size={20}
                              color={theme.accent}
                            />
                          </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                          <Text
                            style={[
                              styles.defaultText,
                              settingsStyles.emptyText,
                            ]}
                          >
                            No matching coins found
                          </Text>
                        }
                      />
                    </View>
                  )}
                </>
              )}

              <View style={{ marginTop: 15 }}>
                <Text
                  style={[
                    styles.defaultText,
                    { fontWeight: "500", marginBottom: 10 },
                  ]}
                >
                  Your Favorites:
                </Text>

                <View
                  style={[
                    settingsStyles.searchResultsContainer,
                    {
                      backgroundColor: theme.background,
                    },
                  ]}
                >
                  {favorites.length > 0 ? (
                    <FlatList
                      data={favorites}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <View style={settingsStyles.favoriteItem}>
                          <Text style={styles.defaultText}>
                            {item.toUpperCase()}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeFavorite(item)}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color="#ff375f"
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      scrollEnabled={false}
                      style={{ maxHeight: 200 }}
                    />
                  ) : (
                    <Text
                      style={[styles.defaultText, settingsStyles.emptyText]}
                    >
                      No favorite coins added yet
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Save All Button */}
          <View style={settingsStyles.saveButtonContainer}>
            <Button
              onPress={handleSave}
              title="Save All Settings"
              loading={isSaving}
              type="success"
              size="large"
              icon="save"
              iconPosition="left"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
