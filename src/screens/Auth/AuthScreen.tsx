import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";

export default function AuthScreen() {
  const navigation = useNavigation();
  const styles = createStyles();
  const auth = authStyles();

  return (
    <View style={[styles.container, auth.center]}>

      <TouchableOpacity
        style={auth.button}
        onPress={() => navigation.navigate("Login" as never)}
      >
        <Text style={auth.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={auth.button}
        onPress={() => navigation.navigate("Register" as never)}
      >
        <Text style={auth.buttonText}> Registrieren</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={auth.button}
        onPress={() => alert("✅ Erfolgreich ausgeloggt!")}
      >
        <Text style={auth.buttonText}> Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
