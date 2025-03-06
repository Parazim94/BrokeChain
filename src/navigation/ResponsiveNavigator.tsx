import { useWindowDimensions } from "react-native";
import TabNavigator from "./TabNavigator";
import DrawerNavigator from "./DrawerNavigator";

export default function ResponsiveNavigator() {
  const { width } = useWindowDimensions();

  // Bei einer Bildschirmbreite unter 768px den TabNavigator anzeigen,
  // ansonsten den DrawerNavigator (der bei verschiedenen Bildschirmgrößen unterschiedlich konfiguriert wird)
  if (width < 768) {
    return <TabNavigator />;
  } else {
    return <DrawerNavigator />;
  }
}
