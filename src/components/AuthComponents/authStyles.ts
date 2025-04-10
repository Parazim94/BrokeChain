import { StyleSheet } from "react-native";
import { createStyles } from "../../styles/style";

export const authStyles = () => {
  const styles = createStyles();
  return StyleSheet.create({
    // Allgemeine Layout-Stile
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 20,
    },
    
    // Text-Stile
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: styles.defaultText.color,
    },
    infoText: {
      color: styles.defaultText.color,
      fontSize: 12,
    },
    
    // Button-Stile
    button: {
      backgroundColor: styles.accent.color,
      paddingVertical: 12,
      borderRadius: 5,
      marginTop: 12,
      width: "100%",
      maxWidth: 300,
      alignItems: "center",
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
    },
    
    // Link-Stile
    linkContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    linkText: {
      color: styles.accent.color,
      fontWeight: "bold",
      fontSize: 14,
    },
    
    // Input-Stile
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 4,
      padding: 8,
      marginBottom: 12,
      color: styles.defaultText.color,
    },
    
    // Disclaimer-Stile
    disclaimerContainer: {
      maxWidth: 300,
      marginVertical: 16,
      padding: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#ccc5",
    },
    disclaimerHeader: {
      color: styles.defaultText.color,
      fontWeight: "600",
      marginBottom: 8,
    },
    disclaimerText: {
      color: styles.defaultText.color,
      fontSize: 12,
      marginBottom: 6,
      lineHeight: 18,
    },
    
    // Checkbox-Stile
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: styles.defaultText.color,
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    checkboxLabel: {
      color: styles.defaultText.color,
      fontSize: 13,
      flex: 1,
    },
  });
};
