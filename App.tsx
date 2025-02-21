import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { enableScreens } from "react-native-screens";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";

enableScreens();

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer >
          <StackNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

registerRootComponent(App);
