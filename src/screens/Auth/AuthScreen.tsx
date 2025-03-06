import React, { useContext, useState } from "react";
import { View, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";
import { authStyles } from "./authStyles";
import { AuthContext } from "../../context/AuthContext";
import Button from "@/src/components/Button"; // Neue Button-Komponente importieren
import { useAlert } from "@/src/context/AlertContext"; 
import Card from "@/src/components/Card";

export default function AuthScreen() {
  const navigation = useNavigation();
  const styles = createStyles();
  const auth = authStyles();
  const { isLoggedIn, setIsLoggedIn, setUser } = useContext(AuthContext);
  const { showAlert } = useAlert(); // Hook für Custom Alerts
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const cardPadding = Platform.OS === "web" ? 32 : 16;

  // Logout-Funktion
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setUser(null);
      setIsLoggedIn(false);
      setIsLoggingOut(false);
      
      showAlert({
        type: "success",
        title: "Logged Out",
        message: "You have been successfully logged out."
      });
    }, 500);
  };

  return (
    <View style={[styles.container, auth.center]}>
      <Card onPress={() => {}} style={{ padding: cardPadding, margin: 20 }}>
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
      </Card>
    </View>
  );
}
