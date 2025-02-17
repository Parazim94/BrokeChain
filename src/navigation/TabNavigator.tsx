import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MarketsScreen from "../screens/Main/MarketsScreen";
import ShareScreen from "../screens/Main/ShareScreen";
import TradeScreen from "../screens/Main/TradeScreen";
import DiscoverScreen from "../screens/Main/DiscoverScreen";
import PortfolioScreen from "../screens/Main/PortfolioScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "help-circle";

          if (route.name === "Markets") {
            iconName = "trending-up";
          } else if (route.name === "Share") {
            iconName = "share-social";
          } else if (route.name === "Trade") {
            iconName = "swap-horizontal";
          } else if (route.name === "Discover") {
            iconName = "compass";
          } else if (route.name === "Portfolio") {
            iconName = "wallet";
          }

          return (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Markets" component={MarketsScreen} />
      <Tab.Screen name="Share" component={ShareScreen} />
      <Tab.Screen name="Trade" component={TradeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
    </Tab.Navigator>
  );
}
