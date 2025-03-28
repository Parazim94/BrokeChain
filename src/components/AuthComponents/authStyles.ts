import { StyleSheet } from "react-native";
import { createStyles } from "../../styles/style";

export const authStyles = () => {
  const styles = createStyles();
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: styles.defaultText.color,
    },
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
    linkContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    linkText: {
      color: styles.accent.color,
      fontWeight: "bold",
      fontSize:14,
    },
    infoText: {
      color: styles.defaultText.color,
      fontSize:12,
    },
  });
};
