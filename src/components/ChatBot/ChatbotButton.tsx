import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

interface ChatbotButtonProps {
  onPress: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onPress }) => {
  const { theme } = useContext(ThemeContext);
  const bounceAnimation = useRef(new Animated.Value(0)).current;

  // Setup bounce animation
  useEffect(() => {
    const startBounceAnimation = () => {
      Animated.sequence([
        Animated.timing(bounceAnimation, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Restart animation after delay
        setTimeout(startBounceAnimation, 5000);
      });
    };

    // Start animation initially
    startBounceAnimation();

    return () => {
      bounceAnimation.stopAnimation();
    };
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, { backgroundColor: theme.accent }]}
      onPress={onPress}
    >
      <Animated.View
        style={{
          transform: [{ scale: bounceAnimation }],
        }}
      >
        {/* You can replace this with a custom image of your chatbot character */}
        <Image
          source={require("../../../assets/images/Brokechain3.png")}
          style={styles.botImage}
          tintColor="#FFFFFF"
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 20 : 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  botImage: {
    width: 35,
    height: 35,
  },
});

export default ChatbotButton;
