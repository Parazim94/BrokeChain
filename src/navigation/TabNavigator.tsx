import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MarketsScreen from "../screens/Main/MarketsScreen";
import ShareScreen from "../screens/Main/ShareScreen";
import TradeScreen from "../screens/Main/TradeScreen";
import DiscoverScreen from "../screens/Main/DiscoverScreen";
import PortfolioScreen from "../screens/Main/PortfolioScreen";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "../styles/style";
import { SafeAreaView } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const styles = createStyles();
  const { theme } = useContext(ThemeContext);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}
      edges={["bottom"]}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            backgroundColor: styles.container.backgroundColor,
            height: Platform.select({
              ios: 65,
              android: 55,
              web: 60,
            }),
            paddingBottom: Platform.select({
              ios: 20,
              android: 10,
              web: 5,
            }),
          },

          tabBarLabelStyle: {
            fontSize: 12,
          },

          tabBarIcon: ({ focused, size }) => {
            let iconName: string = "help-circle";
            let iconSize = size;

            if (route.name === "Markets") {
              iconName = "trending-up";
            } else if (route.name === "Share") {
              iconName = "share-social";
            } else if (route.name === "Trade") {
              iconName = "swap-horizontal";
              iconSize = size * 1.2;
            } else if (route.name === "Discover") {
              iconName = "compass";
            } else if (route.name === "Portfolio") {
              iconName = "wallet";
            }

            return (
              <Ionicons
                name={iconName as keyof typeof Ionicons.glyphMap}
                size={iconSize}
                color={focused ? styles.accent.color : theme.text}
              />
            );
          },
        })}
      >
        <Tab.Screen
          name="Markets"
          component={MarketsScreen}
          options={{
            headerShown: false,
            tabBarActiveTintColor: styles.accent.color,
          }}
        />
        <Tab.Screen
          name="Share"
          component={ShareScreen}
          options={{
            headerShown: false,
            tabBarActiveTintColor: styles.accent.color,
          }}
        />
        <Tab.Screen
          name="Trade"
          component={TradeScreen}
          options={{
            headerShown: false,
            tabBarActiveTintColor: styles.accent.color,
          }}
        />
        <Tab.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{
            headerShown: false,
            tabBarActiveTintColor: styles.accent.color,
          }}
        />
        <Tab.Screen
          name="Portfolio"
          component={PortfolioScreen}
          options={{
            headerShown: false,
            tabBarActiveTintColor: styles.accent.color,
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
