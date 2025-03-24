import React, { useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/types/types';
import { StatusBar } from 'expo-status-bar';
import { ThemeContext } from '@/src/context/ThemeContext';
import { Video, ResizeMode } from 'expo-av';
import AnimatedLogo from '@/src/components/UiComponents/AnimatedLogo';
import { AuthContext } from '../../context/AuthContext';
import { fetchPost } from '../../hooks/useFetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  // Vermeide jegliche Ausführung auf Android
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return null;
  }

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { theme } = useContext(ThemeContext);
  const { user, setUser, logout, isLoggedIn, isAuthLoading } = useContext(AuthContext);
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
      let targetRoute = { name: 'Main' as keyof RootStackParamList };
      const isFromLogo = (route.params as { fromLogo?: boolean } | undefined)?.fromLogo;
      
      if (isFromLogo) {
        // Bei Klick aufs Logo: Wenn eingeloggt -> zu Portfolio, sonst zu Markets
        targetRoute = isLoggedIn 
          ? ({ name: 'Main', params: { screen: 'Portfolio' } } as any)
          : ({ name: 'Main', params: { screen: 'Markets' } } as any);
      } else {
        // Alte Logik: Wenn eingeloggt, prüfe auf letzten besuchten Screen
        if (isLoggedIn) {
          try {
            const lastScreen = await AsyncStorage.getItem('lastScreen');
            if (lastScreen && lastScreen !== "Login") {
              targetRoute = { 
                name: 'Main',
                params: { screen: lastScreen }
              } as any;
            } else {
              targetRoute = { 
                name: 'Main',
                params: { screen: 'Portfolio' }
              } as any;
            }
          } catch (error) {
            console.error('Fehler beim Abrufen des letzten Screens:', error);
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

  // Hintergrundfarbe basierend auf Login-Status wählen
  

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <StatusBar hidden />
      
      {Platform.OS === "web" && (
        <Video
          source={require('../../../assets/videos/intro.mp4')}
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
            transform: [{ scale }] 
          }
        ]}
      >
        <AnimatedLogo />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', 
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
});
