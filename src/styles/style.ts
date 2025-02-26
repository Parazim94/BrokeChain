import { useContext } from "react";
import { StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";


export function createStyles() {
  const { colorTheme, theme } = useContext(ThemeContext);

  return StyleSheet.create({
    body: {
      flex: 1,
      backgroundColor: theme.background,
    },
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
      borderColor: theme.accent,
      borderRadius: 5,
      color: theme.text,
      backgroundColor: theme.background,      
    },
    Sparkline: {
      width: "100%",
      height: 80,
      backgroundColor: "black",
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
      marginBottom: 10,
      textAlign: "center",
      width: 200,
    },
    accent: {
      color: theme.accent,
      fontSize: 16,
    },
    button: {
      backgroundColor: theme.accent,
      padding: 10,
      borderRadius: 5,
      width: 200,
      alignItems: "center",
    },
    buySellButton: {
      padding: 10,
      borderRadius: 5,
      width: 50,
      height: 40,
      alignItems: "center",
    },
    // Neuer allgemeiner Box-Shadow-Stil für Sparklines
    sparklineShadow: {
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
      backgroundColor: 'transparent',
      borderRadius: 8,
      padding: 4,
    },
    // Variante mit kleinerem Padding und Radius für kompaktere Displays
    sparklineShadowCompact: {
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
      backgroundColor: 'transparent',
      borderRadius: 4,
      padding: 2,
    }
  });
}
