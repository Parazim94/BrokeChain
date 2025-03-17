import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { ThemeContext } from "../context/ThemeContext";

interface FlagButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

const FlagButton = ({ icon, label, onPress }: FlagButtonProps) => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isHovered ? 120 : 48, { duration: 300 }),
    };
  });

  return (
    <Animated.View
      style={[
        styles.flagContainer,
        animatedStyle,
        { backgroundColor: theme.accent },
      ]}
      onMouseEnter={
        Platform.OS === "web" ? () => setIsHovered(true) : undefined
      }
      onMouseLeave={
        Platform.OS === "web" ? () => setIsHovered(false) : undefined
      }
    >
      <TouchableOpacity
        style={styles.flagButton}
        onPress={onPress}
        onPressIn={Platform.OS !== "web" ? () => setIsHovered(true) : undefined}
        onPressOut={
          Platform.OS !== "web" ? () => setIsHovered(false) : undefined
        }
      >
        <Ionicons name={icon} size={24} color="#fff" />
        {isHovered && (
          <Animated.Text
            style={[
              styles.flagText,
              { opacity: withTiming(1, { duration: 200 }) },
            ]}
          >
            {label}
          </Animated.Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function InteractiveFlagButtons() {
  const handleTutorialPress = () => {
    // Handle tutorial navigation or action
    console.log("Tutorial pressed");
  };

  const handleQuizPress = () => {
    // Handle quiz navigation or action
    console.log("Quiz pressed");
  };

  return (
    <View style={styles.container}>
      <FlagButton
        icon="school-outline"
        label="Tutorial"
        onPress={handleTutorialPress}
      />
      <FlagButton
        icon="help-circle-outline"
        label="Quiz"
        onPress={handleQuizPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 0,
    zIndex: 1000,
    alignItems: "flex-end",
  },
  flagContainer: {
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  flagButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  flagText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
});
