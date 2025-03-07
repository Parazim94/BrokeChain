import React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/Button";
import Card from "../../components/Card";

interface FavoritesCardProps {
  favorites: string[];
  filteredCoins: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
  addFavorite: (symbol: string) => void;
  removeFavorite: (symbol: string) => void;
  handleFavoritesUpdate: () => Promise<void>;
  isUpdatingFavorites: boolean;
  theme: any;
  styles: any;
  defaultText: any;
}

export default function FavoritesCard({
  favorites,
  filteredCoins,
  searchQuery,
  setSearchQuery,
  isSearchActive,
  setIsSearchActive,
  addFavorite,
  removeFavorite,
  handleFavoritesUpdate,
  isUpdatingFavorites,
  theme,
  styles,
  defaultText,
}: FavoritesCardProps) {
  return (
    <Card style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="star" size={22} color={theme.accent} />
        <Text style={[defaultText, { backgroundColor: "transparent" }, styles.sectionTitle]}>
          Favorite Coins
        </Text>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
            Add Favorites
          </Text>
          <View style={styles.control}>
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
            <View style={styles.row}>
              <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
                Search
              </Text>
              <View style={styles.control}>
                <TextInput
                  placeholder="Type coin name or symbol..."
                  placeholderTextColor={theme.text + "80"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[defaultText, styles.input]}
                  autoFocus
                />
              </View>
            </View>
            {searchQuery.length > 0 && (
              <View style={styles.searchResultsContainer}>
                <FlatList
                  data={filteredCoins}
                  keyExtractor={(item) => item.id || item.symbol}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.favoriteItem}
                      onPress={() => addFavorite(item.symbol.toLowerCase())}
                    >
                      <Text style={[defaultText, { fontWeight: "500" }]}>
                        {item.name} ({item.symbol?.toUpperCase()})
                      </Text>
                      <Ionicons name="add-circle-outline" size={20} color={theme.accent} />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={[defaultText, styles.emptyText]}>
                      No matching coins found
                    </Text>
                  }
                />
              </View>
            )}
          </>
        )}
        <View style={{ marginTop: 15 }}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, { fontWeight: "500", marginBottom: 10 }]}>
            Your Favorites:
          </Text>
          <View style={[styles.searchResultsContainer, { backgroundColor: theme.background }]}>
            {favorites.length > 0 ? (
              <FlatList
                data={favorites}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <View style={styles.favoriteItem}>
                    <Text style={defaultText}>{item.toUpperCase()}</Text>
                    <TouchableOpacity onPress={() => removeFavorite(item)}>
                      <Ionicons name="trash-outline" size={20} color="#ff375f" />
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
                style={{ maxHeight: 200 }}
              />
            ) : (
              <Text style={[defaultText, styles.emptyText]}>
                No favorite coins added yet
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.buttonRow, { marginTop: 15 }]}>
          <Button
            onPress={handleFavoritesUpdate}
            title="Update Favorites"
            loading={isUpdatingFavorites}
            type="primary"
            size="small"
            icon="star"
            iconPosition="left"
          />
        </View>
      </View>
    </Card>
  );
}
