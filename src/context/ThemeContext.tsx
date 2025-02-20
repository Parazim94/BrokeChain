// Dark/Light mode context
import { createContext, useState } from "react";
import { Appearance } from "react-native";
import Colors from "../constants/colors";

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
}

export const ThemeContext = createContext<ThemeContextType>({
  colorTheme: null,
  setColorTheme: () => {},
  theme: {
    text: "",
    background: "",
    icon: "",
    accent: "",
  },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colorTheme, setColorTheme] = useState(Appearance.getColorScheme);
  const theme = colorTheme === "dark" ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
