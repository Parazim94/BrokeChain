import React, { useEffect, useContext } from "react";
import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";

function AppContent() {
  const { user, isLoggedIn } = useContext(AuthContext);
  const { setColorTheme, setAccent } = useContext(ThemeContext);

  useEffect(() => {
    if (
      isLoggedIn &&
      user &&
      user.prefTheme &&
      Array.isArray(user.prefTheme) &&
      user.prefTheme.length >= 2
    ) {
      setColorTheme(user.prefTheme[0]);
      setAccent(user.prefTheme[1]);
    }
  }, [isLoggedIn, user, setColorTheme, setAccent]);

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

registerRootComponent(App);
