import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import AuthScreen from "../screens/Auth/AuthScreen";
import { View, Text, TouchableOpacity, Image, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "../styles/style";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";

type StackParamList = {
  Main: undefined;
  Search: undefined;
  Settings: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<StackParamList>();

export default function StackNavigator() {
  const styles = createStyles();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: styles.container.backgroundColor,
          boxShadow: "none",
          
        },
        headerTintColor: styles.accent.color,
      }}
    >
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={({ navigation }) => ({
          headerTintColor: styles.accent.color,
          headerTitle: () => null,
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <StatusBar barStyle="light-content" backgroundColor={styles.defaultText.backgroundColor} />
              <Image
                source={require("../../assets/images/Brokechain3.png")}
                style={{
                  width: 110,
                  height: 45,
                  marginTop: 5,
                  tintColor: styles.accent.color,
                }}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", marginRight: 15 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Auth" as never)}
              >
                <Ionicons
                  name="person-circle"
                  size={28}
                  color={styles.accent.color}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.navigate("Settings" as never)}
              >
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={styles.defaultText.color}
                />
              </TouchableOpacity>
            </View>
          ),
        })}
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
