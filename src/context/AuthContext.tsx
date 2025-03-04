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
    
    // Speichere auch den Token separat im AsyncStorage für einfacheren Zugriff
    if (userData && userData.token) {
      console.log("Token im AsyncStorage gespeichert:", userData.token.substring(0, 15) + "...");
      AsyncStorage.setItem("userToken", userData.token);
    } else if (userData === null) {
      // Wenn der Benutzer auf null gesetzt wird, auch Token entfernen
      AsyncStorage.removeItem("userToken");
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
            AsyncStorage.setItem("userToken", parsedUser.token);
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden des Auth-Status:", error);
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
          console.log("Gespeicherter Token gefunden:", token.substring(0, 15) + "...");
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
      await AsyncStorage.removeItem('user');
      await AsyncStorage.setItem('isLoggedIn', JSON.stringify(false));
    } catch (error) {
      console.error("Fehler beim Löschen der Benutzerdaten:", error);
    }
    setUserState(null);
    setIsLoggedInState(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      setIsLoggedIn, 
      setUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
