import React, { useEffect, useContext } from "react";
import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { enableScreens } from "react-native-screens";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";

enableScreens();

export default function App() {
  const { user, isLoggedIn } = useContext(AuthContext);
  const { setColorTheme, setAccent } = useContext(ThemeContext);

  useEffect(() => {
    if (isLoggedIn && user && user.prefTheme && user.prefTheme.length >= 2) {
      // User-Voreinstellungen übernehmen:
      setColorTheme(user.prefTheme[0]);
      setAccent(user.prefTheme[1]);
    }
  }, [isLoggedIn, user, setColorTheme, setAccent]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

registerRootComponent(App);
