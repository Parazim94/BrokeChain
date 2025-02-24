import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: any) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  setIsLoggedIn: () => {},
  setUser: () => {},
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

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setIsLoggedIn, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
