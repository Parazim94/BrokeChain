import React, { useState, useContext, useEffect } from "react";
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
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuthRequest } from 'expo-auth-session/providers/google';

// Konfiguriere den Google Login (Client-ID anpassen!)
const googleClientId = '670521686381-ati6l0d79l8qi1i7d9a8rqu76s8jh53h.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const styles = createStyles();
  const auth = authStyles();
  const navigation = useNavigation<NavigationProp<StackParamList>>();
  const { setIsLoggedIn, setUser, logout } = useContext(AuthContext);
  const { showAlert } = useAlert();   
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const cardPadding = Platform.OS === "web" ? 32 : 16;
  
  const isMobile = Platform.OS !== "web"; // Mobile-Check

  // Google-Auth-Request initialisieren
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: googleClientId,
      iosClientId: googleClientId,
      androidClientId: googleClientId,
      webClientId: googleClientId,
      redirectUri: makeRedirectUri({ useProxy: true } as any), // useProxy aktiviert
    }
  );
  
  // Bei erfolgter Google-Antwort den Token verarbeiten
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);
  
  // Logout beim Laden der Login-Seite ausführen
  useEffect(() => {
    logout();
  }, []);

  // Funktion zum Login mit Google
  const handleGoogleLogin = async (accessToken: string) => {
    try {
      const googleLoginResponse = await fetch("https://broke.dev-space.vip/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      if (!googleLoginResponse.ok) {
        const errorText = await googleLoginResponse.text();
        throw new Error(`Google Login fehlgeschlagen: ${errorText}`);
      }
      
      // Prüfe, ob die Antwort den erwarteten JSON-Content-Type besitzt
      const contentType = googleLoginResponse.headers.get('Content-Type');
      if (contentType && !contentType.includes('application/json')) {
        const errorText = await googleLoginResponse.text();
        throw new Error(`Ungültige Serverantwort (kein JSON): ${errorText}`);
      }
      
      // Klonen der Response, um mehrfach auszulesen
      const responseClone = googleLoginResponse.clone();
      let userData;
      try {
        userData = await googleLoginResponse.json();
        console.log("Google-Login erfolgreich:", userData);
      } catch (parseError) {
        const responseText = await responseClone.text();
        throw new Error(`Ungültige Serverantwort: ${responseText}`);
      }
      
      // Token speichern, User-Daten setzen etc.
      if (userData.token) {
        await AsyncStorage.setItem('userToken', userData.token);
        console.log("Google-Token gespeichert:", userData.token.substring(0, 15) + "...");
      }
      setUser(userData);
      setIsLoggedIn(true);
      navigation.navigate("Main", { screen: "Portfolio" });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Google Login Error",
        message: error instanceof Error ? error.message : "Unexpected error occurred"
      });
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://broke.dev-space.vip/auth/login", {
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

  useEffect(() => {
    if (Platform.OS === "web" && window.location.hash && window.location.hash.includes("access_token")) {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.slice(1)); // Entferne führendes '#'
      const token = params.get("access_token");
      if (token) {
        console.log("Extrahierter access_token:", token);
        handleGoogleLogin(token);
        window.location.hash = ""; // optional: URL-Hash leeren
      }
    }
  }, []);

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
        {/* Neuer Button für Login with Google */}
        <Button
          onPress={() => promptAsync()}
          title="Login with Google"
          fullWidth
          style={{ 
            marginTop: 12, 
            backgroundColor: "#DB4437", 
            ...(isMobile ? { width: "100%", alignItems: "center" } : {})
          }}
          textStyle={{ textAlign: "center" }}
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
