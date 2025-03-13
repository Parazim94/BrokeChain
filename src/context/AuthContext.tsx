import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: any) => void;
  logout: () => void;
  isAuthLoading: boolean; // Neuer Wert
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  setIsLoggedIn: () => {},
  setUser: () => {},
  logout: () => {},
  isAuthLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [user, setUserState] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Neuer State

  const setIsLoggedIn = (value: boolean) => {
    setIsLoggedInState(value);
    AsyncStorage.setItem("isLoggedIn", JSON.stringify(value));
  };

  const setUser = async (userData: any) => {
    setUserState(userData);
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      if (userData && userData.token) {
        console.log("Token im AsyncStorage gespeichert:", userData.token);
        await AsyncStorage.setItem("userToken", userData.token);
      } else if (userData === null) {
        await AsyncStorage.removeItem("userToken");
      }
    } catch (error) {
      console.error("Error saving user data to AsyncStorage:", error);
    }
  };

  useEffect(() => {
    async function loadAuthState() {
      try {
        const storedIsLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedIsLoggedIn !== null) {
          setIsLoggedInState(JSON.parse(storedIsLoggedIn));
        }

        if (storedUser !== null) {
          const parsedUser = JSON.parse(storedUser);
          setUserState(parsedUser);

          // Stelle sicher, dass der Token auch separat gespeichert ist
          if (parsedUser && parsedUser.token) {
            await AsyncStorage.setItem("userToken", parsedUser.token);
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden des Auth-Status:", error);
      }
      setIsAuthLoading(false); // Auth-Status geladen
    }

    loadAuthState();
  }, []);

  // Beim Start versuchen, den gespeicherten Token zu laden
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          console.log(
            "Gespeicherter Token gefunden:",
            token.substring(0, 15) + "..."
          );
        }
      } catch (error) {
        console.error("Fehler beim Wiederherstellen des Tokens:", error);
      }
    };

    restoreToken();
  }, []);

  // Logout-Funktion aktualisieren, um auch den gespeicherten Token zu löschen und alle Storage-Daten zu clearen
  const logout = async () => {
    try {
      await AsyncStorage.clear(); // alle Daten löschen
    } catch (error) {
      console.error("Fehler beim Clearen des AsyncStorage:", error);
    }
    setUserState(null);
    setIsLoggedInState(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        setIsLoggedIn,
        setUser,
        logout,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
