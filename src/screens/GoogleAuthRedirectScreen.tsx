import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function GoogleAuthRedirectScreen() {
  const navigation = useNavigation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && window.location.hash && window.location.hash.includes("access_token")) {
      const hash = window.location.hash;
      const token = new URLSearchParams(hash.slice(1)).get("access_token");
      if (!token) {
        setError("Kein access_token gefunden.");
        return;
      }
      window.location.hash = ""; // Hash leeren, um erneute Verarbeitung zu vermeiden
      fetch("https://broke.dev-space.vip/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token })
      })
      .then(response => response.json())
      .then(data => {
        // Hier könnt ihr die Antwort (z. B. Token) speichern und den Benutzer anmelden.
        navigation.navigate("Main", { screen: "Portfolio" });
      })
      .catch(err => {
        console.error("Fehler beim Senden des Tokens:", err);
        setError("Fehler beim Verarbeiten des Tokens.");
      });
    } else {
      setError("Kein access_token im URL-Fragment gefunden.");
    }
  }, [navigation]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems:"center", justifyContent:"center", padding:20 }}>
        <Text style={{ color: 'red', textAlign:"center" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems:"center", justifyContent:"center" }}>
      <ActivityIndicator size="large" />
      <Text>Verarbeite Google Login...</Text>
    </View>
  );
}
