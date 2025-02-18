import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "../../styles/style";

export default function AuthScreen() {
  const navigation = useNavigation();
  const styles = createStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.defaultText}>🔐 Willkommen im Profil</Text>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate("Login" as never)}
      >
        <Text style={styles.defaultText}>🟢 Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate("Register" as never)}
      >
        <Text style={styles.defaultText}>📝 Registrieren</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => alert("✅ Erfolgreich ausgeloggt!")}
      >
        <Text style={styles.defaultText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
