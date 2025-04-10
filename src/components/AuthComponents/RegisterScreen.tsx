import React, { useState } from "react";
import { View, Text, TextInput, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "@/src/components/AuthComponents/authStyles";
import Button from "@/src/components/UiComponents/Button"; 
import { useAlert } from "@/src/context/AlertContext"; 
import Card from "@/src/components/UiComponents/Card";
import DisclaimerModal from "./DisclaimerModal";

export default function RegisterScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation();
  const { showAlert } = useAlert(); 

  const [userName, setuserName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [disclaimerModalVisible, setDisclaimerModalVisible] = useState(false);
  const [isPendingRegistration, setIsPendingRegistration] = useState(false);
  const cardPadding = Platform.OS === "web" ? 32 : 16;

  const calculatePasswordScore = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const handlePasswordChange = (pass: string) => {
    setPassword(pass);
    setPasswordScore(calculatePasswordScore(pass));
  };

  const getFillColor = () => {
    if (passwordScore <= 1) return "red";
    if (passwordScore === 2) return "yellow";
    return "green";
  };

  const handleRegisterClick = () => {
    if (!userName || !email || !age || !password) {
      showAlert({
        type: "warning",
        title: "Unvollständige Daten",
        message: "Bitte füllen Sie alle Felder aus."
      });
      return;
    }
    
    setIsPendingRegistration(true);
    setDisclaimerModalVisible(true);
  };

  const handleDisclaimerInfoClick = () => {
    setIsPendingRegistration(false);
    setDisclaimerModalVisible(true);
  };

  const handleDisclaimerAccept = () => {
    setDisclaimerModalVisible(false);
    if (isPendingRegistration) {
      setIsPendingRegistration(false);
      handleRegister();
    }
  };

  const handleDisclaimerDecline = () => {
    setDisclaimerModalVisible(false);
    setIsPendingRegistration(false);
    showAlert({
      type: "info",
      title: "Registration Cancelled",
      message: "You must accept the Terms of Use and Disclaimer to register."
    });
  };
  
  const handleRegister = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://broke.dev-space.vip/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, email, age, password }),
      });
      if (!response.ok) throw new Error("Registration failed");

      showAlert({
        type: "success",
        title: "Success",
        message: "Please Check your mails! Registration successful!",
        onConfirm: () => navigation.navigate("Login" as never)
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Registration Error",
        message: error instanceof Error ? error.message : "Unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, auth.center]}>
      <Card onPress={() => {}} style={{ padding: cardPadding, margin: 20 }}>
        <ScrollView style={{ maxHeight: Platform.OS === "web" ? 600 : 500 }}>
          <Text style={auth.headerText}>Register</Text>
          <TextInput
            placeholder="Name"
            placeholderTextColor={styles.defaultText.color}
            style={[styles.input, { width: "100%", textAlign: "left" }]}  
            value={userName}
            onChangeText={setuserName}
          />
          <TextInput
            placeholder="E-Mail"
            placeholderTextColor={styles.defaultText.color}
            style={[styles.input, { width: "100%", textAlign: "left" }]}  
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="age"
            placeholderTextColor={styles.defaultText.color}
            style={[styles.input, { width: "100%", textAlign: "left" }]}  
            value={age}
            onChangeText={setAge}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={styles.defaultText.color}
            secureTextEntry
            style={[styles.input, { width: "100%", textAlign: "left" }]}  
            value={password}
            onChangeText={handlePasswordChange}
          />
          <View style={{ flexDirection: "row", marginVertical: 4 }}>
            {[0, 1, 2, 3].map((idx) => (
              <View 
                key={idx}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  marginBottom: 8,
                  marginTop: -4,
                  marginRight: idx < 3 ? 4 : 0,
                  backgroundColor: idx < passwordScore ? getFillColor() : "#ccc",
                  opacity: password.length === 0 ? 0 : 0.8,
                }}
              />
            ))}
          </View>
          
          <Button
            onPress={handleRegisterClick}
            title="Registrieren"
            loading={isLoading}
            fullWidth
            textStyle={{ textAlign: "center" }}  
          />
          <View style={auth.linkContainer}>
            <Text style={auth.infoText}>Already got an account? </Text>
            <Text 
              style={auth.linkText}
              onPress={() => navigation.navigate("Login" as never)}
            >
              Login
            </Text>
          </View>
          
          <View style={[auth.linkContainer, { marginTop: 10 }]}>
            <Text 
              style={[auth.linkText, { fontSize: 12 }]}
              onPress={handleDisclaimerInfoClick}
            >
              View Terms of Use & Disclaimer
            </Text>
          </View>
        </ScrollView>
      </Card>
      
      <DisclaimerModal 
        visible={disclaimerModalVisible}
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
      />
    </View>
  );
}
