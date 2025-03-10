import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/types/types';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import { ThemeContext } from '@/src/context/ThemeContext';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { theme } = useContext(ThemeContext);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Start-Animation für das Logo
    Animated.sequence([
      // Logo einblenden mit leichtem Zoom
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
      // Kurz warten
      Animated.delay(1000),
      // Logo ausblenden
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Nach Abschluss der Animation zur Main-Seite navigieren
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    });
    
  }, [navigation, opacity, scale]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar hidden />
      
      {/* Hintergrundvideo */}
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
        <Image
          source={require('../../assets/images/Brokechain3.png')}
          style={styles.logo}
          tintColor={theme.accent}
          resizeMode="contain"
        />
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
    width: 250,
    height: 250,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
  },
});
