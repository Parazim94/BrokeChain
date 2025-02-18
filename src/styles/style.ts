import { useContext } from "react";
import { StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export function createStyles() {
  const { colorTheme, theme } = useContext(ThemeContext);
  return StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      backgroundColor: theme.background,
    },
    mainContainer: {
      backgroundColor: theme.background,
    },
    defaultText: {
      color: theme.text,
      backgroundColor: theme.background,
    },
    navButton: {
      backgroundColor: theme.background,
      borderColor: theme.text,
      borderRadius: 5,
      borderWidth: 1,
      paddingHorizontal: 24,
      paddingVertical: 8,
    },
    accent: {
      color: "cadetblue",
    },
    // Neuer Style für die Coin-Card
    card: {
      backgroundColor: theme.background,
      padding: 8,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    },
    coinIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginBottom: 8,
    },
  });
}
