import React, { useState, useContext } from "react";
import { View, Text, TextInput, Platform } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { StackParamList } from "@/src/types/types";
import { AuthContext } from "../../context/AuthContext";
import { createStyles } from "../../styles/style";
import { authStyles } from "@/src/components/AuthComponents/authStyles";
import Button from "@/src/components/Button"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAlert } from "@/src/context/AlertContext";
import Card from "@/src/components/Card";

export default function LoginScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation<NavigationProp<StackParamList>>();
  const { setIsLoggedIn, setUser } = useContext(AuthContext);
  const { showAlert } = useAlert();   
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const cardPadding = Platform.OS === "web" ? 32 : 16;
  
  const isMobile = Platform.OS !== "web"; // Mobile-Check

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://broke-end.vercel.app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Login fehlgeschlagen");
      const userData = await response.json();
      
      // Token im AsyncStorage speichern für persistenten Zugriff
      if (userData.token) {
        await AsyncStorage.setItem('userToken', userData.token);
        console.log("Token gespeichert:", userData.token.substring(0, 15) + "...");
      }
      
      setUser(userData);
      setIsLoggedIn(true);

      // Kurze Verzögerung vor der Navigation, damit der Kontext aktualisiert wird
      setTimeout(() => {
        navigation.navigate("Main", { screen: "Portfolio" });
      }, 100);
    
    } catch (error) {
      showAlert({
        type: "error",
        title: "Login Error",
        message: error instanceof Error ? error.message : "Unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, auth.center]}>
      <Card onPress={() => {}} style={{ padding: cardPadding  }}>
        <Text style={auth.headerText}>Login</Text>
        <TextInput
          placeholder="E-Mail"
          placeholderTextColor={styles.defaultText.color}
          value={email}
          onChangeText={setEmail}
          style={[styles.input, isMobile && { width: "100%", textAlign: "left" }]}
        />
        <TextInput
          placeholder="Passwort"
          placeholderTextColor={styles.defaultText.color}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Button
          onPress={handleLogin}
          title="Login"
          loading={isLoading}
          fullWidth
          style={{ 
            marginTop: 12, 
            ...(isMobile ? { width: "100%", alignItems: "center" } : {})
          }}
        />
        <View style={auth.linkContainer}>
          <Text style={auth.infoText}>New here? </Text>
          <Text 
            style={auth.linkText} 
            onPress={() => navigation.navigate("Register" as never)}
          >
            Register
          </Text>
        </View>
      </Card>
    </View>
  );
}
