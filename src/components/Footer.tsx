import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";

const Footer = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  return (
    <View style={[styles.footer, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.navigate("Impressum" as never)}>
        <Text style={[styles.linkText, { color: theme.accent }]}>Impressum</Text>
      </TouchableOpacity>
      {/* Neuer Link zu PrivacyTermsScreen */}
      <TouchableOpacity onPress={() => navigation.navigate("PrivacyTermsScreen" as never)}>
        <Text style={[styles.linkText, { color: theme.accent, marginHorizontal: 10 }]}>
          Privacy & Terms
        </Text>
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
