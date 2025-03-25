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
import { AuthContext } from "../context/AuthContext";
import {
  NavigationProp,
  useNavigation,
  DrawerActions,
} from "@react-navigation/native";
import ResponsiveNavigator from "./ResponsiveNavigator";
import SettingsScreen from "../screens/Secondary/SettingsScreen";
// import AuthScreen from "../screens/Auth/AuthScreen";
import LoginScreen from "../components/AuthComponents/LoginScreen";
import RegisterScreen from "../components/AuthComponents/RegisterScreen";
import CashInfo from "../components/PortfolioComponents/CashInfo";
import LandingPage from "../screens/Secondary/LandingPage";
import { RootStackParamList } from "../types/types";
import WebTabTextMenu from "./WebTabTextMenu";
import NotFoundScreen from "../screens/Secondary/NotFoundScreen";
import VerifiedScreen from "../screens/Secondary/VerifiedScreen";
import InteractiveFlagButtons from "../components/UiComponents/InteractiveFlagButtons";
import QuizScreen from "../screens/Secondary/QuizScreen"; 
import ImpressumScreen from "../screens/Secondary/ImpressumScreen";  
import Footer from "../components/UiComponents/Footer"; 
import PrivacyTermsScreen from "../screens/Secondary/PrivacyTermsScreen";
import ChatbotScreen from "../components/ChatBot/ChatbotScreen"; // Neuer Import

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const { width } = useWindowDimensions();
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Android startet direkt mit dem Main-Screen
  const initialRoute = Platform.OS === "android" ? "Main" : "LandingPage";

  return (
    <>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
            height: Platform.OS === "ios" ? 100 : undefined,
          },
          headerTintColor: theme.text,
          headerStatusBarHeight: Platform.OS === "ios" ? 50 : undefined,
        }}
      >
        {/* LandingPage nur für nicht-Android-Plattformen rendern */}
        {Platform.OS !== "android" && (
          <Stack.Screen
            name="LandingPage"
            component={LandingPage}
            options={{ headerShown: false }}
          />
        )}

        <Stack.Screen
          name="Main"
          component={ResponsiveNavigator}
          options={{
            headerTitle:
              Platform.OS === "web"
                ? () => (                  
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: width >= 1024 ? "center" : "flex-start",
                        marginTop: Platform.OS === "ios" ? 15 : 0,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("LandingPage", { fromLogo: true })
                        }
                      >
                        <Image
                          source={require("../../assets/images/Brokechain3.png")}
                          tintColor={theme.accent}
                          style={{ width: 120, height: 45 }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      {width >= 1024 && <WebTabTextMenu />}
                    </View>
                  )
                : () => null,
            headerLeft:
              Platform.OS === "web"
                ? () => null
                : () => (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("LandingPage", { fromLogo: true })
                      }
                    >
                      <View
                        style={{
                          width: "auto",
                          marginLeft: 15,
                          alignItems: "flex-start",
                          justifyContent: "flex-start",
                          margin: "auto",
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
                    </TouchableOpacity>
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
                {/* Burger-Button nur anzeigen, wenn Bildschirmbreite zwischen 768 und 1024 */}
                {width >= 768 && width < 1024 && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.dispatch(DrawerActions.toggleDrawer())
                    }
                    style={{ 
                      alignItems: "center", 
                      justifyContent: "center",
                      marginRight: 15 // Abstand zwischen Burger-Menü und Profil-Button
                    }}
                  >
                    <Ionicons name="menu" size={28} color={theme.accent} />
                  </TouchableOpacity>
                )}
                {/* Benutzer-Icon: Navigiert zu Portfolio, wenn angemeldet, sonst zu Login */}
                <TouchableOpacity
                  style={{
                    marginLeft: Platform.OS === "web" && width >= 768 && width < 1024 ? 0 : 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    if (isLoggedIn) {
                      navigation.navigate("Main", { screen: "Portfolio" });
                    } else {
                      navigation.navigate("Login");
                    }
                  }}
                >
                  <Ionicons
                    name="person-circle"
                    size={28}
                    color={theme.accent}
                  />
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
          options={{ title: "Account Settings" }}
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
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{ title: "Seite nicht gefunden" }}
        />
        <Stack.Screen
          name="Verified"
          component={VerifiedScreen}
          options={{ title: "E-Mail Verifizierung" }}
        />
        {/* Neuer Screen für Quiz */}
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ headerShown: false }}
        />
        {/* Neuer Impressum-Screen */}
        <Stack.Screen
          name="Impressum"
          component={ImpressumScreen}
          options={{ title: "Impressum" }}
        />
        {/* Neuer PrivacyTermsScreen */}
        <Stack.Screen
          name="PrivacyTermsScreen"
          component={PrivacyTermsScreen}
          options={{ title: "Privacy & Terms" }}
        />
        {/* Neuer ChatbotScreen */}
        <Stack.Screen
          name="ChatbotScreen"
          component={ChatbotScreen}
          options={{ 
            headerShown: false, // Header verstecken, da der Screen seinen eigenen Header hat
          }}
        />
      </Stack.Navigator>

      {/* Add InteractiveFlagButtons component */}
      <InteractiveFlagButtons />

      {/* Footer integrieren */}
      <Footer />

      {/* CookieConsent integrieren */}
      {/* <CookieConsent /> */}

      {/* PrivacyTermsScreen integrieren */}
    

      {/* StatusBar für Android */}
      {Platform.OS === "android" && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.background}
        />
      )}

    </>
  );
}
