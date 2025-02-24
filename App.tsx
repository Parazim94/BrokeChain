import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { enableScreens } from "react-native-screens";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { TradeProvider } from "./src/context/TradeContext"; // Neuer Import

enableScreens();

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TradeProvider>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </TradeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

registerRootComponent(App);
