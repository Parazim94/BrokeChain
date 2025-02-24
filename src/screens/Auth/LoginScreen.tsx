import React from "react";
import { View, Text, TextInput, TouchableOpacity, } from "react-native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";
import { useNavigation } from '@react-navigation/native';
export default function LoginScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation();
  

  function handleLogin() {
    alert("✅ Erfolgreich eingeloggt!");
  }

  return (
    <View style={[styles.container, auth.center]}>
      <Text style={auth.headerText}>Login</Text>
      <TextInput placeholder="E-Mail" placeholderTextColor={styles.defaultText.color} style={styles.input} />
      <TextInput placeholder="Passwort" placeholderTextColor={styles.defaultText.color} secureTextEntry style={styles.input} />
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
