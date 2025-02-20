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
      maxWidth: 300,
      padding: 10,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: theme.text,
      borderRadius: 5,
      color: theme.text,
      backgroundColor: theme.background,
    },
    mainContainer: {
      backgroundColor: theme.background,
    },
    defaultText: {
      color: theme.text,
      backgroundColor: theme.background,
    },
    // navButton styling removed – lokale Definition in den Komponenten, wo benötigt.
    accent: {
      color: "#00a9d7",
    },
  });
}
