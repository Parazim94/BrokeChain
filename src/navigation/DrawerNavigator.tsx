import { createDrawerNavigator } from "@react-navigation/drawer";
import { useContext } from "react";
import { useWindowDimensions } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import MarketsScreen from "../screens/Main/MarketsScreen";
import ShareScreen from "../screens/Main/ShareScreen";
import TradeScreen from "../screens/Main/TradeScreen";
import DiscoverScreen from "../screens/Main/DiscoverScreen";
import PortfolioScreen from "../screens/Main/PortfolioScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { theme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.background,
          width: width >= 768 ? 250 : 0,
        },
        drawerLabelStyle: {
          color: theme.text,
        },
        drawerActiveTintColor: theme.accent,
        drawerInactiveTintColor: theme.text,
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="Markets"
        component={MarketsScreen}
        options={{
          drawerIcon: ({ size }) => (
            <Ionicons name="trending-up" size={size} color={theme.text} />
          ),
        }}
      />
      <Drawer.Screen
        name="Share"
        component={ShareScreen}
        options={{
          drawerIcon: ({ size }) => (
            <Ionicons name="share-social" size={size} color={theme.text} />
          ),
        }}
      />
      <Drawer.Screen
        name="Trade"
        component={TradeScreen}
        options={{
          drawerIcon: ({ size }) => (
            <Ionicons name="swap-horizontal" size={size} color={theme.text} />
          ),
        }}
      />
      <Drawer.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          drawerIcon: ({ size }) => (
            <Ionicons name="compass" size={size} color={theme.text} />
          ),
        }}
      />
      <Drawer.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          drawerIcon: ({ size }) => (
            <Ionicons name="wallet" size={size} color={theme.text} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
