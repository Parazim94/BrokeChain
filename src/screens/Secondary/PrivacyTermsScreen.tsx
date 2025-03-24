import React, { useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import Card from "@/src/components/UiComponents/Card";

const PrivacyTermsScreen = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <View
      style={[styles.outerContainer, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Privacy Policy */}
        <Card style={cardStyles.card}>
          <Text style={[styles.title, { color: theme.accent }]}>
            BrokeChain – Privacy Policy
          </Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Updated: 19.03.2025{"\n"}
            Location: Germany{"\n\n"}
            This Privacy Policy explains how BrokeChain processes your personal
            data when you sign in with Google.{"\n"}
            When signing in with Google, BrokeChain receives the following
            information from Google:{"\n"}• Name{"\n"}• Email address{"\n"}•
            Language setting{"\n"}• Profile picture{"\n\n"}
            The data is used solely for identification and to improve our
            service. Your data is stored securely and is not shared with third
            parties, except as required by law. For further details, please
            refer to the legal notice.
          </Text>
        </Card>

        {/* Terms of Service */}
        <Card style={cardStyles.card}>
          <Text style={[styles.title, { color: theme.accent }]}>
            BrokeChain – Terms of Service
          </Text>
          <Text style={[styles.text, { color: theme.text }]}>
            These terms govern your contract with BrokeChain. By using the app,
            you agree to the following conditions:{"\n\n"}
            1. Use of Google Sign-In: By signing in with Google, you consent to
            the transmission of your profile data (name, email, language,
            profile picture) to BrokeChain.{"\n\n"}
            2. Responsibilities: You agree to keep your login details
            confidential. BrokeChain is only liable for intentional wrongdoing
            and gross negligence.{"\n\n"}
            3. Content and Code of Conduct: It is prohibited to distribute
            illegal content. In case of violations, we reserve the right to
            restrict usage.{"\n\n"}
            4. Changes: BrokeChain reserves the right to modify these terms.
            Continued use of the app constitutes acceptance.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: Dimensions.get("window").height,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "scroll",
  },
  content: {
    padding: 20,
    maxWidth: 1024,
    marginHorizontal: "auto",
    flexGrow: 1,
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
