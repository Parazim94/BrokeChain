import React, { useContext } from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import Card from "@/src/components/Card";

const PrivacyTermsScreen = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Datenschutzerklärung */}
        <Card style={cardStyles.card}>
          <Text style={[styles.title, { color: theme.accent }]}>BrokeChain – Datenschutzerklärung</Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Stand: 19.03.2025{"\n"}
            Standort: Deutschland{"\n\n"}
            Diese Datenschutzerklärung informiert Sie darüber, wie BrokeChain Ihre personenbezogenen Daten verarbeitet, wenn Sie sich über Google anmelden.{"\n"}
            Im Rahmen des Google-Logins erhält BrokeChain folgende Informationen von Google:{"\n"}
            • Name{"\n"}
            • E-Mail-Adresse{"\n"}
            • Spracheinstellung{"\n"}
            • Profilbild{"\n\n"}
            Die Daten dienen ausschließlich der Identifizierung und zur Verbesserung unseres Services. Ihre Daten werden verschlüsselt gespeichert und nicht an Dritte weitergegeben, außer bei gesetzlichen Verpflichtungen. Für weitere Details konsultieren Sie bitte das Impressum.
          </Text>
        </Card>

        {/* Nutzungsbedingungen */}
        <Card style={cardStyles.card}>
          <Text style={[styles.title, { color: theme.accent }]}>BrokeChain – Nutzungsbedingungen</Text>
          <Text style={[styles.text, { color: theme.text }]}>           
            Diese Nutzungsbedingungen regeln Ihr Vertragsverhältnis mit BrokeChain. Durch die Nutzung der App erklären Sie sich mit folgenden Bedingungen einverstanden:{"\n\n"}
            1. Nutzung des Google-Logins: Mit der Anmeldung über Google erklären Sie sich damit einverstanden, dass Google Ihre Profildaten (Name, E-Mail, Sprache, Profilbild) an BrokeChain übermittelt.{"\n\n"}
            2. Verantwortlichkeiten: Sie verpflichten sich, Ihre Zugangsdaten vertraulich zu behandeln. BrokeChain haftet nur für Vorsatz und grobe Fahrlässigkeit.{"\n\n"}
            3. Inhalte und Verhaltensregeln: Es ist untersagt, rechtswidrige Inhalte zu verbreiten. Bei Verstößen behalten wir uns das Recht vor, Nutzungen einzuschränken.{"\n\n"}
            4. Änderungen: BrokeChain behält sich vor, diese Bedingungen anzupassen. Fortgesetzte Nutzung der App gilt als Zustimmung.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor wird dynamisch gesetzt
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
  },
});

export default PrivacyTermsScreen;
