import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../context/ThemeContext";

const Footer = () => {
  // Nur auf Web anzeigen
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web" || width < 480) return null;
  
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  return (
    <View style={[styles.footer, { backgroundColor: theme.background, boxShadow: "0 -2px 14px #0000001a"  }]}>
      <TouchableOpacity onPress={() => navigation.navigate("Impressum" as never)}>
        <Text style={[styles.linkText, { color: theme.accent }]}>Impressum</Text>
      </TouchableOpacity>
    
      <Text style={styles.copyrightText}>
        © {new Date().getFullYear()} BrokeChain
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 5, // reduced height by lowering padding
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { backdropFilter: "blur(10px)" } }),
  },
  linkText: {
    textDecorationLine: "underline",
  },
  copyrightText: {
    marginLeft: 10,
    fontSize: 12,
    color: "#777",
  },
});

export default Footer;
