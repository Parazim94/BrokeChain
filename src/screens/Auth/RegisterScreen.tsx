import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";

export default function RegisterScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, auth.center]}>
      <Text style={auth.headerText}>Register</Text>
      <TextInput placeholder="Name" style={styles.input} />
      <TextInput placeholder="E-Mail" style={styles.input} />
      <TextInput placeholder="age" style={styles.input} />
      <TextInput placeholder="Passwort" secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={() => alert("✅ Registriert!")} style={auth.button}>
        <Text style={auth.buttonText}>Registrieren</Text>
      </TouchableOpacity>
      <View style={auth.linkContainer}>
        <Text style={auth.infoText}>Schon registriert? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
          <Text style={auth.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
