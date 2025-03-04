import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";
import Button from "@/src/components/Button"; // Neue Button-Komponente importieren

export default function RegisterScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation();

  const [userName, setuserName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading-State für Button

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://broke-end.vercel.app/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, email, age, password }),
      });
      if (!response.ok) throw new Error("Registrierung fehlgeschlagen");
      alert("✅ Registriert!");
      navigation.navigate("Login" as never);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, auth.center]}>
      <Text style={auth.headerText}>Register</Text>
      <TextInput
        placeholder="Name"
        placeholderTextColor={styles.defaultText.color}
        style={styles.input}
        value={userName}
        onChangeText={setuserName}
      />
      <TextInput
        placeholder="E-Mail"
        placeholderTextColor={styles.defaultText.color}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="age"
        placeholderTextColor={styles.defaultText.color}
        style={styles.input}
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        placeholder="Passwort"
        placeholderTextColor={styles.defaultText.color}
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Button
        onPress={handleRegister}
        title="Registrieren"
        loading={isLoading}
        fullWidth
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
    </View>
  );
}
