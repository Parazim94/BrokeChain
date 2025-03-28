import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../context/ThemeContext";
import { AntDesign } from '@expo/vector-icons';

const Footer = () => {
  // Nur auf Web anzeigen
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web" || width < 480) return null;
  
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const handleDownload = () => {
    if (Platform.OS === 'web') {
      // Download direkt im aktuellen Fenster starten
      window.location.href = '/BrokeChain.apk';
    } else {
      // Für mobile Geräte öffnen wir einen externen Link
      Linking.openURL('https://broke.dev-space.vip/BrokeChain.apk');
    }
  };
  
  return (
    <View style={[styles.footer, { backgroundColor: theme.background, boxShadow: "0 -2px 14px #0000001a"  }]}>
      <TouchableOpacity onPress={() => navigation.navigate("Impressum" as never)}>
        <Text style={[styles.linkText, { color: theme.accent }]}>Impressum</Text>
      </TouchableOpacity>
    
      <Text style={styles.copyrightText}>
        © {new Date().getFullYear()} BrokeChain
      </Text>
      
      <TouchableOpacity style={styles.downloadLink} onPress={handleDownload}>
        <AntDesign name="android1" size={16} color={theme.accent} style={styles.downloadIcon} />
        <Text style={[styles.linkText, { color: theme.accent }]}>App</Text>
      </TouchableOpacity>
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
  downloadLink: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  downloadIcon: {
    marginRight: 4,
  }
});

export default Footer;
