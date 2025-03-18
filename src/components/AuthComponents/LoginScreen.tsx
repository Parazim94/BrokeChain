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
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";

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

  const isMobile = Platform.OS !== "web";

  // Logout beim Laden der Login-Seite ausführen
  useEffect(() => {
    logout();
  }, []);

  // Normaler Email/Passwort Login
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
        await AsyncStorage.setItem("userToken", userData.token);
        console.log(
          "Token gespeichert:",
          userData.token.substring(0, 15) + "..."
        );
      }

      setUser(userData);
      setIsLoggedIn(true);

      // Kurze Verzögerung vor der Navigation, damit der Kontext aktualisiert wird
      setTimeout(() => {
        navigation.navigate("Main", { screen: "Portfolio" });
      }, 1000);
    } catch (error) {
      showAlert({
        type: "error",
        title: "Login Error",
        message:
          error instanceof Error ? error.message : "Unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialisiere den Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    // clientId: process.env.ID,
    // iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    webClientId: process.env.ID,
    // scopes: ['profile', 'email'],
  });

  // Verarbeite die Google Antwort
  useEffect(() => {
    if (response?.type === "success" && response.authentication) {
      // Get user info using the access token
      console.log(response.authentication.accessToken);
      async function fetchUser(token: String) {
        try {
          const response = await fetch(
            "https://broke.dev-space.vip/auth/google",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(token),
            }
          );
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          throw new Error("fehler google user fetch");
        }
      }
      fetchUser(response.authentication.accessToken);
    }
  }, [response]);

  return (
    <View style={[styles.container, auth.center]}>
      <Card onPress={() => {}} style={{ padding: cardPadding }}>
        <Text style={auth.headerText}>Login</Text>
        <TextInput
          placeholder="E-Mail"
          placeholderTextColor={styles.defaultText.color}
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            isMobile && { width: "100%", textAlign: "left" },
          ]}
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
            ...(isMobile ? { width: "100%", alignItems: "center" } : {}),
          }}
        />
        {/* Neuer Button für Google Login */}
        <Button
          onPress={() => promptAsync()}
          title="Login with Google"
          loading={isLoading}
          fullWidth
          style={{
            marginTop: 12,
            ...(isMobile ? { width: "100%", alignItems: "center" } : {}),
            backgroundColor: "#db4437",
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
        </View>{" "}
        <View style={auth.linkContainer}>
          <Text
            style={auth.linkText}
            onPress={() => navigation.navigate("ForgotPassword" as never)}
          >
            Forgot Password?
          </Text>
        </View>
      </Card>
    </View>
  );
}
