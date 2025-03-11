import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/types/types';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import { ThemeContext } from '@/src/context/ThemeContext';
import { Video, ResizeMode } from 'expo-av';
import AnimatedLogo from '@/src/components/AnimatedLogo';
import { AuthContext } from '../context/AuthContext';
import { fetchPost } from '../hooks/useFetch';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { theme } = useContext(ThemeContext);
  const { user, setUser, logout } = useContext(AuthContext);
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
        routes: [{ name: 'Main' }],
      });
    });
    
  }, [navigation, opacity, scale]);

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
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
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
    opacity: 0.3,
  },
});
