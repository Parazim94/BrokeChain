import React, { useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/types/types';
import { StatusBar } from 'expo-status-bar';
import { ThemeContext } from '@/src/context/ThemeContext';
import { Video, ResizeMode } from 'expo-av';
import AnimatedLogo from '@/src/components/AnimatedLogo';
import { AuthContext } from '../context/AuthContext';
import { fetchPost } from '../hooks/useFetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { theme } = useContext(ThemeContext);
  const { user, setUser, logout, isLoggedIn, isAuthLoading } = useContext(AuthContext);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
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
  }, [user, logout, setUser]);

  useEffect(() => {
    // Navigation erst auslösen, wenn der Auth-Status geladen ist
    if (isAuthLoading) return;
    
    const navigateToLastScreen = async () => {
      let targetRoute = { name: 'Main' as keyof RootStackParamList };
      
      // Wenn eingeloggt, prüfe auf letzten besuchten Screen
      if (isLoggedIn) {
        try {
          const lastScreen = await AsyncStorage.getItem('lastScreen');
          // Falls der letzte Screen "Login" ist, auf Portfolio umstellen
          if (lastScreen && lastScreen !== "Login") {
            targetRoute = { 
              name: 'Main',
              params: {
                screen: lastScreen
              }
            };
          } else {
            targetRoute = { 
              name: 'Main',
              params: {
                screen: 'Portfolio'
              }
            };
          }
        } catch (error) {
          console.error('Fehler beim Abrufen des letzten Screens:', error);
        }
      }
      
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: false,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
        ]),
        Animated.delay(1000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        navigation.reset({
          index: 0,
          routes: [targetRoute],
        });
      });
    };
    
    navigateToLastScreen();
  }, [navigation, opacity, scale, isLoggedIn, isAuthLoading]);

  // Hintergrundfarbe basierend auf Login-Status wählen
  const backgroundColor = isLoggedIn ? theme.background : "#000";

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <StatusBar hidden />
      
      <Video
        source={require('../../assets/videos/intro.mp4')}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted={true}
      />
      
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
