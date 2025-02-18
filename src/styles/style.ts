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
      padding: 10,
    },
    input: {
      width: "100%",
      padding: 10,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: theme.text,
      borderRadius: 5,
      color: theme.text,
      backgroundColor: colorTheme === "dark" ? "#333" : "#fff",
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
      color: colorTheme === "dark" ? "#00c6ff" : "cadetblue",
    },
    newsCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorTheme === "dark" ? "#222" : "#f8f8f8",
      padding: 12,
      marginVertical: 5,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: colorTheme === "dark" ? 0.4 : 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    },
    newsImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 10,
    },
    newsTextContainer: {
      flex: 1,
    },
    newsTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 5,
    },
    newsDate: {
      fontSize: 12,
      color: colorTheme === "dark" ? "#bbb" : "gray",
    },
    newsDescription: {
      fontSize: 14,
      color: theme.text,
    },
  });
}
