import React, { useContext, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";
import { AuthContext } from "../../context/AuthContext";
import Button from "@/src/components/Button"; // Neue Button-Komponente importieren

export default function AuthScreen() {
  const navigation = useNavigation();
  const styles = createStyles();
  const auth = authStyles();
  const { isLoggedIn, setIsLoggedIn, setUser } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Logout-Funktion
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setUser(null);
      setIsLoggedIn(false);
      setIsLoggingOut(false);
      alert("Erfolgreich ausgeloggt!");
    }, 500);
  };

  return (
    <View style={[styles.container, auth.center]}>
      <Button
        onPress={() => navigation.navigate("Login" as never)}
        title="Login"
        fullWidth
        style={{ marginBottom: 10 }}
      />
      <Button
        onPress={() => navigation.navigate("Register" as never)}
        title="Registrieren"
        fullWidth
        style={{ marginBottom: 10 }}
      />
      {isLoggedIn && (
        <Button
          onPress={handleLogout}
          title="Logout"
          type="danger"
          loading={isLoggingOut}
          fullWidth
        />
      )}
    </View>
  );
}
