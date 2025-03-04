import React, { useContext, useState, useMemo } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { createStyles } from "../../styles/style";
import { AccentColors } from "../../constants/accentColors";
import DropdownAccentPicker from "./SettingsComponents/DropdownAccentPicker";
import Button from "@/src/components/Button";
import { useData } from "@/src/context/DataContext"; // Import für Coin-Daten
import { Ionicons } from "@expo/vector-icons"; // Für Icons

export default function SettingsScreen() {
  const { colorTheme, setColorTheme, accent, setAccent, theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext); 
  const { marketData } = useData(); // Marketdaten für Coin-Suche
  const styles = createStyles();
  const [isSaving, setIsSaving] = useState(false);
  
  // Neue Zustände für Favoritenverwaltung - "favorites" statt "fav" verwenden
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(user?.favorites || []);

  // Gefilterte Coins basierend auf der Suchanfrage
  const filteredCoins = useMemo(() => {
    if (!searchQuery) return [];
    return marketData.filter((item) => 
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.symbol || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, marketData]);

  const toggleTheme = () => {
    setColorTheme(colorTheme === "light" ? "dark" : "light");
  };

  // Favorit hinzufügen
  const addFavorite = (symbol: string) => {
    if (!favorites.includes(symbol)) {
      setFavorites([...favorites, symbol]);
      setSearchQuery("");
      setIsSearchActive(false);
    }
  };

  // Favorit entfernen
  const removeFavorite = (symbol: string) => {
    setFavorites(favorites.filter(fav => fav !== symbol));
  };

  // Speichert die aktuellen Einstellungen (prefTheme: [colorTheme, accent], favorites: [symbols])
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const updatedUserData = {
      ...user,
      prefTheme: [colorTheme, accent],
      favorites: favorites  // Hier "favorites" statt "fav" verwenden
    };
    const payload = updatedUserData;
    
    // Debug-Ausgabe hinzufügen, um den Payload zu überprüfen
    console.log("Payload mit Favoriten:", JSON.stringify(payload, null, 2));
    
    try {
      const response = await fetch("https://broke-end.vercel.app/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Speichern fehlgeschlagen");
      }
      const updatedUser = await response.json();
      setUser(updatedUser);
      alert("Einstellungen gespeichert!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unerwarteter Fehler");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { justifyContent: "flex-start", alignItems: "center", padding: 20 }]}>
      <View style={{ width: "100%", maxWidth: 600 }}>
        <Text style={[styles.defaultText, { fontSize: 24, marginBottom: 20 }]}>Einstellungen</Text>
        
        {/* Themeeinstellungen */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[styles.defaultText, { fontSize: 18, marginBottom: 15 }]}>Thema</Text>
          <Button
            onPress={toggleTheme}
            title={colorTheme === "light" ? "Darkmode" : "Lightmode"}
            icon={colorTheme === "light" ? "moon" : "sunny"}
            iconPosition="left"
            type="primary"
          />
          
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.defaultText, { marginBottom: 10 }]}>
              Akzentfarbe:
            </Text>
            <DropdownAccentPicker
              accent={accent}
              setAccent={setAccent}
              accentColors={AccentColors}
              themeBackground={theme.background}
            />
          </View>
        </View>
        
        {/* Favoritenverwaltung */}
        <View style={{ marginBottom: 30 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            <Text style={[styles.defaultText, { fontSize: 18 }]}>Favoriten</Text>
            <Button
              onPress={() => setIsSearchActive(!isSearchActive)}
              title=""
              icon="search"
              type="secondary"
              size="small"
              style={{
                backgroundColor: isSearchActive ? theme.accent : theme.background,
                padding: 8,
              }}
            />
          </View>
          
          {/* Suchfeld und Ergebnisse */}
          {isSearchActive && (
            <View style={{ marginBottom: 15 }}>
              <TextInput
                placeholder="Coin suchen..."
                placeholderTextColor={styles.defaultText.color}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.input, { width: "100%" }]}
                autoFocus
              />
              
              {searchQuery.length > 0 && (
                <View style={{ 
                  maxHeight: 200, 
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginTop: 4,
                  borderWidth: 1,
                  borderColor: theme.accent // Hier: theme.text → theme.accent
                }}>
                  <FlatList
                    data={filteredCoins}
                    keyExtractor={(item) => item.id || item.symbol}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.accent + "40", // Hier: theme.text → theme.accent + Opacity
                          flexDirection: "row",
                          justifyContent: "space-between"
                        }}
                        onPress={() => addFavorite(item.symbol.toLowerCase())}
                      >
                        <Text style={[styles.defaultText, { fontWeight: "500" }]}>
                          {item.name} ({item.symbol?.toUpperCase()})
                        </Text>
                        <Ionicons name="add-circle-outline" size={20} color={theme.accent} />
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text style={[styles.defaultText, { padding: 12, textAlign: "center" }]}>
                        Keine Ergebnisse gefunden
                      </Text>
                    }
                  />
                </View>
              )}
            </View>
          )}
          
          {/* Liste der aktuellen Favoriten */}
          <View style={{ 
            borderWidth: 1, 
            borderColor: theme.accent, // Hier: theme.text → theme.accent
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}>
            <Text style={[styles.defaultText, { marginBottom: 10 }]}>Deine Favoriten:</Text>
            {favorites.length > 0 ? (
              <FlatList
                data={favorites}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <View style={{ 
                    flexDirection: "row", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.accent + "40" // Hier: theme.text + "40" → theme.accent + "40"
                  }}>
                    <Text style={styles.defaultText}>{item.toUpperCase()}</Text>
                    <TouchableOpacity onPress={() => removeFavorite(item)}>
                      <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={[styles.defaultText, { textAlign: "center", padding: 10 }]}>
                    Keine Favoriten hinzugefügt
                  </Text>
                }
              />
            ) : (
              <Text style={[styles.defaultText, { textAlign: "center", padding: 10 }]}>
                Keine Favoriten hinzugefügt
              </Text>
            )}
          </View>
        </View>
      
        {/* Speichern-Button */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Button
            onPress={handleSave}
            title="Speichern"
            loading={isSaving}
            type="success"
            size="medium"
          />
        </View>
      </View>
    </View>
  );
}
