import React, { useEffect, useContext } from "react";
import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar, Platform } from "react-native";
import StackNavigator from "./src/navigation/StackNavigator";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { DataProvider } from "./src/context/DataContext";
import { AlertProvider } from "./src/context/AlertContext";
import * as Linking from 'expo-linking'; 

// NEUE Linking-Konfiguration mit NETLIFY Domain:
const linking = {
	prefixes: ['https://broke-chain.netlify.app', 'broke-chain://'],
	config: {
		screens: {
			LandingPage: '',
			Main: {
				path: 'main',
				screens: {
					Markets: 'markets',
					Share: 'share',
					Trade: 'trade',
					Discover: 'discover',
					Portfolio: 'portfolio'
				}
			},
			Login: 'login',
			Register: 'register',
			Settings: 'settings',
            Verified: 'auth/verify/:token', // NEUER ROUTE
			NotFound: '*'
		}
	}
};

function AppContent() {
  const { user, isLoggedIn } = useContext(AuthContext);
  const { setColorTheme, setAccent, theme } = useContext(ThemeContext);

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
    <>
      {/* Global StatusBar configuration */}
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer linking={linking}> {/* Linking hinzugefügt */}
        <StackNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <AlertProvider>
            <AppContent />
          </AlertProvider>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

registerRootComponent(App);
