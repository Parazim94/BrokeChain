import { useContext } from "react";
import { StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export function createStyles() {
  const { colorTheme, theme } = useContext(ThemeContext);

  return StyleSheet.create({
    body: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1, width: "100%", backgroundColor: theme.background, padding: 10 },
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
    Sparkline: { width: "100%", height: 80, backgroundColor: "black" },
    mainContainer: { backgroundColor: theme.background },
    defaultText: { color: theme.text, backgroundColor: theme.background },
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
    accent: { color: theme.accent, fontSize: 16 },
    button: { backgroundColor: theme.accent, padding: 10, borderRadius: 5, width: 200, alignItems: "center" },
    buySellButton: { padding: 10, borderRadius: 5, width: 50, height: 40, alignItems: "center" },
    // Aktualisierte Schattenstile: Verwende "boxShadow" (primär für Web) statt "shadow*" Props  
    sparklineShadow: {
      // Beispiel für Web: Box-Shadow; für Mobile wird evtl. elevation benötigt.
      boxShadow: `0px 0px 2px ${theme.accent}`,
      backgroundColor: "transparent",
      borderRadius: 8,
      padding: 4,
    },
    sparklineShadowCompact: {
      boxShadow: `0px 2px 2px ${theme.accent}`,
      backgroundColor: "transparent",
      borderRadius: 0,
      padding: 2,
    },
    // Hinweis: Für pointerEvents in Views – statt <View pointerEvents="none" /> verwende:
    // <View style={{ pointerEvents: "none", ...weitereStile }} />
  });
}
