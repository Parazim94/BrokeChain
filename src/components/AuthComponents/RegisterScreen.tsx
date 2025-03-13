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
  const [isLoading, setIsLoading] = useState(false); // Loading-State für Button

  const cardPadding = Platform.OS === "web" ? 32 : 16;

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
        message: "Registration successful! <b>Please Check your mails!</b>",
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
          placeholder="Passwort"
          placeholderTextColor={styles.defaultText.color}
          secureTextEntry
          style={[styles.input, { width: "100%", textAlign: "left" }]}  
          value={password}
          onChangeText={setPassword}
        />
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
