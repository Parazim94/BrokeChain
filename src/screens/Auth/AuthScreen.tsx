import React, { useContext } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { AuthContext } from "../../context/AuthContext";
import { authStyles } from "./authStyles";

export default function AuthScreen() {
  const navigation = useNavigation();
  const styles = createStyles();
  const auth = authStyles();
  const { isLoggedIn } = useContext(AuthContext);

  if (isLoggedIn) {
    return (
      <View style={[styles.container, auth.center]}>
        <TouchableOpacity
          style={auth.button}
          onPress={() =>
            // Logout-Logik (hier extern via URL oder Context-Update)
            navigation.navigate("Portfolio" as never)
          }
        >
          <Text style={auth.buttonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={auth.buttonText}>Registrieren</Text>
      </TouchableOpacity>
    </View>
  );
}
