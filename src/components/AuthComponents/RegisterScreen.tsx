import React, { useState } from "react";
import { View, Text, TextInput, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "@/src/components/AuthComponents/authStyles";
import Button from "@/src/components/Button"; 
import { useAlert } from "@/src/context/AlertContext"; 
import Card from "@/src/components/Card";

export default function RegisterScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation();
  const { showAlert } = useAlert(); 

  const [userName, setuserName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0); // Score als Anzahl erfüllter Kriterien (0-4)
  const [isLoading, setIsLoading] = useState(false);
  const cardPadding = Platform.OS === "web" ? 32 : 16;

  // Neue Funktion, die den Score als Anzahl der erfüllten 4 Kriterien zurückgibt
  const calculatePasswordScore = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  // Handler, der Passwort und Score aktualisiert
  const handlePasswordChange = (pass: string) => {
    setPassword(pass);
    setPasswordScore(calculatePasswordScore(pass));
  };

  // Bestimmt die Farbe der gefüllten Segmente
  const getFillColor = () => {
    if (passwordScore <= 1) return "red";
    if (passwordScore === 2) return "yellow";
    return "green";
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
          onChangeText={handlePasswordChange} // Update: setze den Handler ein
        />
        {/* Anzeige der Passwort-Sicherheitsbar */}
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
          onPress={handleRegister}
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
      </Card>
    </View>
  );
}
