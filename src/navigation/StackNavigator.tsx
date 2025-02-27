import { createStackNavigator } from "@react-navigation/stack";
import {
  useWindowDimensions,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import DrawerNavigator from "./DrawerNavigator";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import AuthScreen from "../screens/Auth/AuthScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import CashInfo from "../components/CashInfo";

const Stack = createStackNavigator();

export default function StackNavigator() {
  const { width } = useWindowDimensions();
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
      }}
    >
      <Stack.Screen
        name="Main"
        component={width >= 768 ? DrawerNavigator : TabNavigator}
        options={{
          headerTitle: () => null,
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={theme.background}
              />
              <Image
                source={require("../../assets/images/Brokechain3.png")}
                tintColor={theme.accent}
                style={{
                  width: 110,
                  height: 45,
                  marginTop: 5,
                }}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (

            <View style={{ flexDirection: "row", marginRight: 15 }}>
               
                      <CashInfo />
                
              {/* Burger-Button für Sidebar (nur bei großen Screens) */}
              {width >= 768 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(DrawerActions.toggleDrawer())
                  }
                >
                  <Ionicons name="menu" size={28} color={theme.accent} />
                </TouchableOpacity>
              )}
              {/* Profil- und Einstellungen-Icons */}
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.navigate("Auth" as never)}
              >
                <Ionicons name="person-circle" size={28} color={theme.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.navigate("Settings" as never)}
              >
                <Ionicons
                  name="settings-outline"
                  size={24}
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
