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
    input: {
      width: "100%",
      padding: 10,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: theme.text,
      borderRadius: 5,
      color: theme.text,
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
 
  });
}
