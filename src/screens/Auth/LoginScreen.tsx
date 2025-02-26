import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { StackParamList } from "@/src/navigation/types";
import { AuthContext } from "../../context/AuthContext";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";

export default function LoginScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation<NavigationProp<StackParamList>>();
  const { setIsLoggedIn, setUser } = useContext(AuthContext);
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
      const userData = await response.json();
      if (userData.status === "ok") {
        setUser(userData);
        setIsLoggedIn(true);
        navigation.navigate("Main", { screen: "Portfolio" });
      } else {
        throw new Error(userData.error || "Login nicht erfolgreich");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unexpected error occurred");
    }
  };

  return (
    <View style={[styles.container, auth.center]}>
      <Text style={auth.headerText}>Login</Text>
      <TextInput
        placeholder="E-Mail"
        placeholderTextColor={styles.defaultText.color}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Passwort"
        placeholderTextColor={styles.defaultText.color}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleLogin} style={auth.button}>
        <Text style={auth.buttonText}>Login</Text>
      </TouchableOpacity>
      <View style={auth.linkContainer}>
        <Text style={auth.infoText}>New here? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
          <Text style={auth.linkText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
