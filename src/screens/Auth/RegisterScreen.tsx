import React from "react";
import { View, Text, TextInput, Button } from "react-native";
import { createStyles } from "../../styles/style";

export default function RegisterScreen() {
  const styles = createStyles();

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" style={styles.input} />
      <TextInput placeholder="E-Mail" style={styles.input} />
      <TextInput placeholder="age" style={styles.input} />
      <TextInput placeholder="Passwort" secureTextEntry style={styles.input} />
      <Button title="Registrieren" onPress={() => alert("✅ Registriert!")} />
    </View>
  );
}
