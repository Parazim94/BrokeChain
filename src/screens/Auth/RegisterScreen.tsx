import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";

export default function RegisterScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation();


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const response = await fetch("https://broke-end.vercel.app/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, age, password }),
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
    }
  };

  return (
    <View style={[styles.container, auth.center]}>
      <Text style={auth.headerText}>Register</Text>
      <TextInput
        placeholder="Name"
        placeholderTextColor={styles.defaultText.color}
        style={styles.input}
        value={name}
        onChangeText={setName}
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
      <TouchableOpacity onPress={handleRegister} style={auth.button}>
        <Text style={auth.buttonText}>Registrieren</Text>
      </TouchableOpacity>
      <View style={auth.linkContainer}>
        <Text style={auth.infoText}>allready got an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
          <Text style={auth.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
