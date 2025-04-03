import React, { useEffect, useRef, useContext } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Platform,
  TouchableOpacity,
  Text,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types/types";
import { StatusBar } from "expo-status-bar";
import { ThemeContext } from "@/src/context/ThemeContext";
import { Video, ResizeMode } from "expo-av";
import AnimatedLogo from "@/src/components/UiComponents/AnimatedLogo";
import { AuthContext } from "../../context/AuthContext";
import { fetchPost } from "../../hooks/useFetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

export default function LandingPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { theme } = useContext(ThemeContext);
  const { user, setUser, logout, isLoggedIn, isAuthLoading } =
    useContext(AuthContext);
  const didVerify = useRef(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (didVerify.current) return;
    didVerify.current = true;

    const verifyUser = async () => {
      if (user && user.token) {
        try {
          const updatedUser = await fetchPost("user", { token: user.token });
          if (!updatedUser || updatedUser.error) {
            logout();
          } else {
            setUser(updatedUser);
          }
        } catch (error) {
          logout();
        }
      }
    };
    verifyUser();
  }, [logout, setUser]);

  useEffect(() => {
    if (isAuthLoading) return;

    const navigateToLastScreen = async () => {
      let targetRoute = { name: "Main" as keyof RootStackParamList };
      const isFromLogo = (route.params as { fromLogo?: boolean } | undefined)
        ?.fromLogo;

      if (isFromLogo) {
        // Bei Klick aufs Logo: Wenn eingeloggt -> zu Portfolio, sonst zu Markets
        targetRoute = isLoggedIn
          ? ({ name: "Main", params: { screen: "Portfolio" } } as any)
          : ({ name: "Main", params: { screen: "Markets" } } as any);
      } else {
        // Alte Logik: Wenn eingeloggt, prüfe auf letzten besuchten Screen
        if (isLoggedIn) {
          try {
            const lastScreen = await AsyncStorage.getItem("lastScreen");
            if (lastScreen && lastScreen !== "Login") {
              targetRoute = {
                name: "Main",
                params: { screen: lastScreen },
              } as any;
            } else {
              targetRoute = {
                name: "Main",
                params: { screen: "Portfolio" },
              } as any;
            }
          } catch (error) {
            console.error("Fehler beim Abrufen des letzten Screens:", error);
          }
        }
      }

      const initialDelay = isLoggedIn ? 500 : 0;
      const middleDelay = isLoggedIn ? 1000 : 1500;

      setTimeout(() => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: false,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: false,
            }),
          ]),
          Animated.delay(middleDelay),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1800,
              useNativeDriver: false,
            }),
            Animated.timing(scale, {
              toValue: 0,
              duration: 1800,
              useNativeDriver: false,
            }),
          ]),
        ]).start(() => {
          navigation.reset({
            index: 0,
            routes: [targetRoute],
          });
        });
      }, initialDelay);
    };

    navigateToLastScreen();
  }, [navigation, opacity, scale, isLoggedIn, isAuthLoading, route]);

  const handleDownload = () => {
    if (Platform.OS === 'web') {
      // Download direkt im aktuellen Fenster starten
      window.location.href = '/BrokeChain.apk';
    } else {
      // Für mobile Geräte öffnen wir einen externen Link
      Linking.openURL('https://broke.dev-space.vip/BrokeChain.apk');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <StatusBar hidden />

      {Platform.OS === "web" && (
        <Video
          source={require("../../../assets/videos/intro.mp4")}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          isMuted={true}
        />
      )}

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <AnimatedLogo />
      </Animated.View>
      
      <TouchableOpacity 
        style={styles.downloadBanner}
        onPress={handleDownload}
        activeOpacity={0.8}
      >
        <AntDesign name="android1" size={24} color={theme.accent} style={styles.bannerIcon} />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>BrokeChain App</Text>
          <Text style={styles.bannerSubtitle}>Download now</Text>
        </View>
        <View style={[styles.downloadButton, { backgroundColor: theme.accent,marginLeft: 10 }]}>
          <Text style={styles.downloadButtonText}>APK</Text>
          <AntDesign name="download" size={16} color="#000" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 450,
    height: 450,
  },
  backgroundVideo: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.3,
    transform: [{ scale: 2 }],
  },
  downloadBanner: {
    position: 'absolute',
    bottom: 40,
    width: Platform.OS === 'web' ? 'auto' : width - 40,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  bannerIcon: {
    marginRight: 15,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#a3a3a3',
    fontSize: 14,
    marginTop: 4,
  },
  downloadButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#000',
    fontWeight: 'bold',
    marginRight: 8,
  },
});
