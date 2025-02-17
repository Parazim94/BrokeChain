import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MarketsScreen from "../screens/Main/MarketsScreen";
import ShareScreen from "../screens/Main/ShareScreen";
import TradeScreen from "../screens/Main/TradeScreen";
import DiscoverScreen from "../screens/Main/DiscoverScreen";
import PortfolioScreen from "../screens/Main/PortfolioScreen";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "../styles/style";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const styles = createStyles();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: styles.container.backgroundColor },
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
              color={styles.defaultText.color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Markets"
        component={MarketsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Share"
        component={ShareScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Trade"
        component={TradeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
