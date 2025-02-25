import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";
import { AuthContext } from "../../context/AuthContext"; // neu

export default function AuthScreen() {
  const navigation = useNavigation();
  const styles = createStyles();
  const auth = authStyles();
  const { isLoggedIn, user, setIsLoggedIn, setUser } = useContext(AuthContext); // neu

  // Neue Logout-Funktion
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    alert("Erfolgreich ausgeloggt!");
  };

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
      {isLoggedIn && (
        <TouchableOpacity style={auth.button} onPress={handleLogout}>
          <Text style={auth.buttonText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
