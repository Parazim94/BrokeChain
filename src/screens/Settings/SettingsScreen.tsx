import React, { useContext, useState, useMemo, useEffect } from "react";
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
import Button from "@/src/components/Button";
import { useData } from "@/src/context/DataContext";
import { Ionicons } from "@expo/vector-icons";
import { useAlert } from "@/src/context/AlertContext";
import AppearanceCard from "@/src/components/SettingsComponents/AppearanceCard";
import EmailCard from "@/src/components/SettingsComponents/EmailCard";
import PasswordCard from "@/src/components/SettingsComponents/PasswordCard";
import FavoritesCard from "@/src/components/SettingsComponents/FavoritesCard";
import { useNavigation } from '@react-navigation/native';


export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colorTheme, setColorTheme, accent, setAccent, theme } =
    useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext);
  const { marketData } = useData();
  const { showAlert } = useAlert();
  const styles = createStyles();
  const [isSaving, setIsSaving] = useState(false);

  // Überprüfung, ob Benutzer eingeloggt ist
  useEffect(() => {
    if (!user) {
      navigation.navigate('Login' as never);
    }
  }, [user, navigation]);

  // States for favorites management
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(user?.favorites || []);
  const [isUpdatingAppearance, setIsUpdatingAppearance] = useState(false);
  const [isUpdatingFavorites, setIsUpdatingFavorites] = useState(false);

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

  // Handle appearance update
  const handleAppearanceUpdate = async () => {
    if (!user) return;
    setIsUpdatingAppearance(true);

    // Log das aktuelle Token
    console.log("Appearance Update - aktueller Token:", user?.token);

    try {
      const response = await fetch(
        "https://broke.dev-space.vip/user/settings",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify( 
            {            
            token: user?.token,
            prefTheme:[           
            colorTheme,
            accent]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Appearance update failed");
      }

      // Serverantwort parsen und neues Token extrahieren
      const responseData = await response.json();
      const newToken = responseData.token;
      console.log("Neues Token:", newToken);
      
      
      // Aktualisiere User mit neuem Token und Theme-Einstellungen
      const updatedUser = { 
        ...user, 
        prefTheme: [colorTheme, accent],
        token: newToken // Verwende neues Token oder behalte altes, falls keins zurückkommt
      };
      console.log("Updated User:", updatedUser);
      
      setUser(updatedUser);

      showAlert({
        type: "success",
        title: "Appearance Updated",
        message: "Your appearance settings have been saved!",
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setIsUpdatingAppearance(false);
    }
  };
  
  // Handle favorites update
  const handleFavoritesUpdate = async () => {
    if (!user) return;
    setIsUpdatingFavorites(true);

    try {
      const response = await fetch(
        "https://broke.dev-space.vip/user/settings",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: user?.token,
            favorites: favorites,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Favorites update failed");
      }

      const updatedUser = { ...user, favorites: favorites };
      setUser(updatedUser);

      showAlert({
        type: "success",
        title: "Favorites Updated",
        message: "Your favorite coins have been saved!",
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setIsUpdatingFavorites(false);
    }
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
        "https://broke.dev-space.vip/user/change_password",
        {
          method: "PUT",
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
    // Log das aktuelle Token
    console.log("Email Change - aktueller Token:", user?.token, "New Email:", newEmail);

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
      console.log("User token: ", user?.token , "New Email: ", newEmail);
      
      // Implement email change API call here
      const response = await fetch(
        "https://broke.dev-space.vip/user/change_email",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: user?.token,
            newEmail: newEmail,
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

    // Log das aktuelle Token vor dem Speichern aller Settings
    console.log("Save Settings - aktueller Token:", user?.token);

    const updatedUserData = {
      ...user,
      prefTheme: [colorTheme, accent],
      favorites: favorites,
      email: newEmail,
    };

    try {
      const response = await fetch(
        "https://broke.dev-space.vip/user/settings",
        {
          method: "PUT",
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
      backgroundColor: "transparent", // falls nötig
    },
    sectionContainer: {
      marginBottom: 30,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme.background,
    },
    sectionHeader: {
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.accent + "60",
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
      borderColor: theme.accent+ "60",
    },
    favoriteItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.accent + "60",
    },
    emptyText: {
      textAlign: "center",
      padding: 15,
      fontStyle: "italic",
    },
  });

  // Falls Benutzer nicht eingeloggt ist, zeigen wir nichts an (Navigation wird im useEffect übernommen)
  if (!user) {
    return null;
  }

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
            // overflowVerticaly: Platform.OS === "web" ? "scroll" : undefined,
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

          <AppearanceCard
            colorTheme={colorTheme ?? "light"}
            toggleTheme={toggleTheme}
            accent={accent}
            setAccent={setAccent}
            handleAppearanceUpdate={handleAppearanceUpdate}
            isUpdatingAppearance={isUpdatingAppearance}
            theme={theme}
            AccentColors={AccentColors}
            styles={settingsStyles}
            defaultText={styles.defaultText}
          />

          <EmailCard
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            handleEmailChange={handleEmailChange}
            isChangingEmail={isChangingEmail}
            theme={theme}
            styles={settingsStyles}
            defaultText={styles.defaultText}
          />

          <PasswordCard
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handlePasswordChange={handlePasswordChange}
            isChangingPassword={isChangingPassword}
            passwordError={passwordError}
            theme={theme}
            styles={settingsStyles}
            defaultText={styles.defaultText}
          />

          <FavoritesCard
            favorites={favorites}
            filteredCoins={useMemo(() => {
              if (!searchQuery) return [];
              return marketData.filter(
                (item) =>
                  (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (item.symbol || "").toLowerCase().includes(searchQuery.toLowerCase())
              );
            }, [searchQuery, marketData])}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearchActive={isSearchActive}
            setIsSearchActive={setIsSearchActive}
            addFavorite={addFavorite}
            removeFavorite={removeFavorite}
            handleFavoritesUpdate={handleFavoritesUpdate}
            isUpdatingFavorites={isUpdatingFavorites}
            theme={theme}
            styles={settingsStyles}
            defaultText={styles.defaultText}
          />

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
