import { createStackNavigator } from "@react-navigation/stack";
import {
  useWindowDimensions,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import DrawerNavigator from "./DrawerNavigator";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import AuthScreen from "../screens/Auth/AuthScreen";
import LoginScreen from "../components/AuthComponents/LoginScreen";
import RegisterScreen from "../components/AuthComponents/RegisterScreen";
import CashInfo from "../components/CashInfo";
import LandingPage from "../screens/LandingPage";
import { RootStackParamList } from "../types/types";

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const { width } = useWindowDimensions();
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      initialRouteName="LandingPage"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
          height: Platform.OS === "ios" ? 100 : undefined,
        },
        headerTintColor: theme.text,
        headerStatusBarHeight: Platform.OS === "ios" ? 50 : undefined,
      }}
    >
      <Stack.Screen
        name="LandingPage"
        component={LandingPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={width >= 768 ? DrawerNavigator : TabNavigator}
        options={{
          headerTitle: () => null,
          headerLeft: () => (
            <View
              style={{
                marginLeft: 15,
                alignItems: "center",
                justifyContent: "center",
                marginTop: Platform.OS === "ios" ? 15 : 0,
              }}
            >
              <Image
                source={require("../../assets/images/Brokechain3.png")}
                tintColor={theme.accent}
                style={{
                  width: 110,
                  height: 45,
                  marginTop: Platform.OS === "ios" ? 0 : 5,
                }}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                marginRight: 15,
                alignItems: "center",
                height: Platform.OS === "ios" ? 44 : "auto",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginRight: 15,
                  alignItems: "center",
                }}
              >
                <CashInfo />
              </View>
              {/* Burger-Button für Sidebar (nur bei großen Screens) */}
              {width >= 768 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(DrawerActions.toggleDrawer())
                  }
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="menu" size={28} color={theme.accent} />
                </TouchableOpacity>
              )}
              {/* Profil- und Einstellungen-Icons */}
              <TouchableOpacity
                style={{
                  marginLeft: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => navigation.navigate("Auth" as never)}
              >
                <Ionicons name="person-circle" size={28} color={theme.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  marginLeft: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => navigation.navigate("Settings" as never)}
              >
                <Ionicons
                  name="settings-outline"
                  size={28}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Einstellungen" }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ title: "Profil" }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Login" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Registrieren" }}
      />
    </Stack.Navigator>
  );
}
