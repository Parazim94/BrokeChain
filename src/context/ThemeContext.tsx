import React, { createContext, useState, useContext } from "react";
import Colors from "../constants/colors";
import { AccentColors } from "../constants/accentColors";
import { View } from "react-native";

type Style = {
  text: string;
  background: string;
  icon: string;
  accent: string;
};

interface ThemeContextType {
  colorTheme: "light" | "dark" | null | undefined;
  setColorTheme: React.Dispatch<
    React.SetStateAction<"light" | "dark" | null | undefined>
  >;
  theme: Style;
  accent: string;
  setAccent: React.Dispatch<React.SetStateAction<string>>;
}

export const ThemeContext = createContext<ThemeContextType>({
  colorTheme: "light",
  setColorTheme: () => {},
  theme: {
    text: "",
    background: "",
    icon: "",
    accent: "",
  },
  accent: AccentColors[0],
  setAccent: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colorTheme, setColorTheme] = useState<
    "light" | "dark" | null | undefined
  >("light");
  const [accent, setAccent] = useState(AccentColors[0]);

  const theme = {
    ...Colors[colorTheme || "light"],
    accent,
  };

  return (
    <ThemeContext.Provider
      value={{ colorTheme, setColorTheme, theme, accent, setAccent }}
    >
      <View style={{ flex: 1 }}>{children}</View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
