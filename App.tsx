import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { enableScreens } from "react-native-screens";
import { ThemeProvider } from "./src/context/ThemeContext";

enableScreens();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

registerRootComponent(App);
