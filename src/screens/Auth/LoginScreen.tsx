import React from "react";
import { View, Text, TextInput, Button } from "react-native";
import { createStyles } from "../../styles/style";

export default function LoginScreen() {
  const styles = createStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.defaultText}>🔑 Login</Text>
      <TextInput placeholder="E-Mail" style={styles.input} />
      <TextInput placeholder="Passwort" secureTextEntry style={styles.input} />
      <Button title="Login" onPress={() => alert("✅ Eingeloggt!")} />
    </View>
  );
}
