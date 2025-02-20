import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";

export default function LoginScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, auth.center]}>
      <Text style={auth.headerText}>Login</Text>
      <TextInput placeholder="E-Mail" style={styles.input} />
      <TextInput placeholder="Passwort" secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={() => alert("✅ Eingeloggt!")} style={auth.button}>
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
