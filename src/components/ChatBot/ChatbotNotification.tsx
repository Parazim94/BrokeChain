import React, { useEffect, useRef, useState, useContext } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

interface ChatbotNotificationProps {
  buttonPosition: { x: number; y: number };
  buttonSize: { width: number; height: number };
  visible: boolean;
}

const ChatbotNotification: React.FC<ChatbotNotificationProps> = ({
  buttonPosition,
  buttonSize,
  visible,
}) => {
  const { theme } = useContext(ThemeContext);
  const opacity = useRef(new Animated.Value(0)).current;
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  });

  // Update dimensions on resize (for web)
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
      });
    };

    if (Platform.OS === "web") {
      window.addEventListener("resize", updateDimensions);
      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }
  }, []);

  // Animate the appearance and disappearance of the notification
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // Calculate the position of the notification bubble
  const getBubblePosition = () => {
    const bubbleWidth = 200;
    const bubbleHeight = 80;
    const padding = 10;

    // Default position (to the right of the button)
    let positionStyle = {
      left: buttonPosition.x + buttonSize.width + 10,
      top: buttonPosition.y,
    };

    // Check if there's enough space to the right
    if (
      buttonPosition.x + buttonSize.width + bubbleWidth + padding >
      dimensions.width
    ) {
      // Not enough space to the right, try placing it to the left
      if (buttonPosition.x - bubbleWidth - padding > 0) {
        // Place to the left of the button
        positionStyle = {
          right: dimensions.width - buttonPosition.x + 10,
          top: buttonPosition.y,
        };
      } else {
        // Place above the button
        positionStyle = {
          left: Math.max(
            padding,
            Math.min(
              dimensions.width - bubbleWidth - padding,
              buttonPosition.x - bubbleWidth / 2 + buttonSize.width / 2
            )
          ),
          bottom: dimensions.height - buttonPosition.y + 10,
        };
      }
    }

    // Check vertical boundaries
    if (
      positionStyle.top &&
      positionStyle.top + bubbleHeight + padding > dimensions.height
    ) {
      positionStyle.top = dimensions.height - bubbleHeight - padding;
    }

    return positionStyle;
  };

  const bubblePosition = getBubblePosition();
  const isPositionedLeft = bubblePosition.right !== undefined;
  const isPositionedBottom = bubblePosition.bottom !== undefined;

  return (
    <Animated.View
      style={[
        styles.container,
        bubblePosition,
        { opacity },
        { backgroundColor: theme.accent },
      ]}
    >
      <Text style={styles.text}>
        Need help trading? Click here for AI support!
      </Text>
      <View
        style={[
          styles.arrow,
          isPositionedLeft
            ? styles.arrowRight
            : isPositionedBottom
            ? styles.arrowBottom
            : styles.arrowLeft,
          { backgroundColor: theme.accent },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 200,
    padding: 12,
    borderRadius: 12,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
  },
  arrow: {
    position: "absolute",
    width: 15,
    height: 15,
    transform: [{ rotate: "45deg" }],
  },
  arrowLeft: {
    left: -7,
    top: 20,
  },
  arrowRight: {
    right: -7,
    top: 20,
  },
  arrowBottom: {
    bottom: -7,
    left: "50%",
    marginLeft: -7,
  },
});

export default ChatbotNotification;
