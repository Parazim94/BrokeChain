import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { enableScreens } from "react-native-screens";

enableScreens();

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

registerRootComponent(App);
