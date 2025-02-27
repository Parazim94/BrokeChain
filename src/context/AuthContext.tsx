import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  setIsLoggedIn: () => {},
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [user, setUserState] = useState<any>(null);

  const setIsLoggedIn = (value: boolean) => {
    setIsLoggedInState(value);
    AsyncStorage.setItem("isLoggedIn", JSON.stringify(value));
  };

  const setUser = (userData: any) => {
    setUserState(userData);
    AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  useEffect(() => {
    async function loadAuthState() {
      const storedIsLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      const storedUser = await AsyncStorage.getItem("user");
      if (storedIsLoggedIn !== null) {
        setIsLoggedInState(JSON.parse(storedIsLoggedIn));
      }
      if (storedUser !== null) {
        setUserState(JSON.parse(storedUser));
      }
    }
    loadAuthState();
  }, []);

  // Beim Start versuchen, den gespeicherten Token zu laden
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Hier könnte man einen API-Aufruf machen, um die Benutzerdaten mit dem Token abzurufen
          console.log("Gespeicherter Token gefunden:", token.substring(0, 15) + "...");
          // Wenn nötig, setze den Benutzer und den eingeloggten Status
          // setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Fehler beim Wiederherstellen des Tokens:", error);
      }
    };
    
    restoreToken();
  }, []);

  // Logout-Funktion aktualisieren, um auch den gespeicherten Token zu löschen
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      console.error("Fehler beim Löschen des Tokens:", error);
    }
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      setIsLoggedIn, 
      setUser,
      logout // Neue logout-Funktion
    }}>
      {children}
    </AuthContext.Provider>
  );
};
