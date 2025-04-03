import React, { useEffect, useContext } from "react";
import { registerRootComponent } from "expo";
// SplashScreen-Import entfernen, da er den Fehler verursacht
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar, Platform, View } from "react-native";
import StackNavigator from "./src/navigation/StackNavigator";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { DataProvider } from "./src/context/DataContext";
import { AlertProvider } from "./src/context/AlertContext";
import { TutorialProvider } from "./src/context/TutorialContext";
import TutorialOverlay from "./src/components/Tutorial/TutorialOverlay";
import ElementTagger from "./src/components/Tutorial/ElementTagger";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QuizProvider } from "./src/context/QuizzContext";
import * as SplashScreen from 'expo-splash-screen';

// NEUE Linking-Konfiguration mit NETLIFY Domain:
const linking = {
  prefixes: ["https://broke-end.vercel.app/", "broke-chain://"],
  config: {
    screens: {
      LandingPage: "",
      Main: {
        path: "main",
        screens: {
          Markets: "markets",
          Share: "share",
          Trade: "trade",
          Discover: "discover",
          Portfolio: "portfolio",
        },
      },
      Login: "login",
      Register: "register",
      Settings: "settings",
      Verified: "auth/verify/:token",
      redirect: "redirect", 
      NotFound: "*",
      Quiz: "quiz", 
      Impressum: "impressum",
      PrivacyTermsScreen: "privacy",
    },
  },
};


if (Platform.OS === 'android') {
  try {
    SplashScreen.preventAutoHideAsync()
      .then(() => {
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 2000);
      })
      .catch(console.warn);
  } catch (e) {
    console.warn("SplashScreen nicht verfügbar:", e);
  }
}


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
      <NavigationContainer linking={linking}>
        <StackNavigator />
        {/* Add ElementTagger to tag DOM elements on web */}
        <ElementTagger />
        {/* Add the TutorialOverlay which will be shown when tutorial is active */}
        <TutorialOverlay />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DataProvider>
          <AuthProvider>
            <AlertProvider>
              <TutorialProvider>
                <QuizProvider>
                  <AppContent />
                </QuizProvider>
              </TutorialProvider>
            </AlertProvider>
          </AuthProvider>
        </DataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
