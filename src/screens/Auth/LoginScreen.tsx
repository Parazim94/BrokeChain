import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";
import { AuthContext } from "../../context/AuthContext"; // Neuer Import

export default function LoginScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation();

  const { setIsLoggedIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("https://broke-end.vercel.app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Login fehlgeschlagen");

      setIsLoggedIn(true);

      // Verwenden Sie den korrekten Route-Namen "Portfolio" statt eines Dateipfads
      navigation.navigate("Portfolio" as never);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Unbekannter Fehler");
      }
    }
  };

  return (
    <View style={[styles.container, auth.center]}>
      <Text style={auth.headerText}>Login</Text>
      <TextInput
        placeholder="E-Mail"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Passwort"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={handleLogin} style={auth.button}>
        <Text style={auth.buttonText}>Login</Text>
      </TouchableOpacity>
      <View style={auth.linkContainer}>
        <Text style={auth.infoText}>Noch kein Konto? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
          <Text style={auth.linkText}>Registrieren</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
