import React, { useContext } from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import Card from "@/src/components/UiComponents/Card";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";

const ImpressumScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Added navigation hook

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={[styles.title, { color: theme.accent }]}>Impressum</Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Colin Blome{"\n"}
            Buten Porten 4{"\n"}
            49584 Fürstenau{"\n\n"}
            Kontakt{"\n"}
            E-Mail:{" "}
            <Text style={{ color: theme.accent }}>
              info@colinblome.dev
            </Text>
          </Text>
          {/* Zusätzlicher Abschnitt für Datenschutz & Google Login */}
          <Text style={[styles.subtitle, { color: theme.accent, marginTop: 20 }]}>
            Google Login & Datenschutz
          </Text>
          <Text style={[styles.text, { color: theme.text }]}>
            By loggin in with Google, Google will share your name, email address, language preference,
            and profile picture with us. See our{" "}
            <Text
              style={{ color: theme.accent, textDecorationLine: "underline" }}
              onPress={() => navigation.navigate("PrivacyTermsScreen")}
            >
              Privacy Policy
            </Text>{" "}
            and{" "}
            <Text
              style={{ color: theme.accent, textDecorationLine: "underline" }}
              onPress={() => navigation.navigate("PrivacyTermsScreen")}
            >
              Terms of Service
            </Text>.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor is set dynamically
  },
  content: {
    padding: 20,
    maxWidth: 1024,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default ImpressumScreen;
