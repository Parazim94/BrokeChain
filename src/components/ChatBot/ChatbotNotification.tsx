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
  onButtonPress?: boolean; // Track when chat button is pressed
}

const ChatbotNotification: React.FC<ChatbotNotificationProps> = ({
  buttonPosition,
  buttonSize,
  visible,
  onButtonPress = false,
}) => {
  const { theme } = useContext(ThemeContext);
  const opacity = useRef(new Animated.Value(0)).current;
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  });
  const [shouldShow, setShouldShow] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle button press reset
  useEffect(() => {
    if (onButtonPress) {
      // Hide notification immediately
      setShouldShow(false);

      // Clear any pending timeouts/intervals
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set new interval for next reminder
      intervalRef.current = setInterval(() => {
        setShouldShow(true);

        // Hide after 10 seconds
        timeoutRef.current = setTimeout(() => {
          setShouldShow(false);
        }, 10000);
      }, 60000); // Show every minute
    }
  }, [onButtonPress]);

  // Initialize timing system
  useEffect(() => {
    // Initial display after 10 seconds of page load
    const initialDelay = setTimeout(() => {
      setShouldShow(true);

      // Hide after 10 seconds
      timeoutRef.current = setTimeout(() => {
        setShouldShow(false);
      }, 10000);
    }, 10000);

    // Set up recurring display every minute
    intervalRef.current = setInterval(() => {
      setShouldShow(true);

      // Hide after 10 seconds
      timeoutRef.current = setTimeout(() => {
        setShouldShow(false);
      }, 10000);
    }, 60000); // 60000ms = 1 minute

    return () => {
      clearTimeout(initialDelay);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
      toValue: visible && shouldShow ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, shouldShow]);

  // Cal  // Calculate the position of the notification bubble
  const getBubblePosition = () => {
    const bubbleWidth = 200;
    const bubbleHeight = 80;
    const padding = 10;

    // Default position (to the right of the button)
    let positionStyle: { left?: number; right?: number; top?: number; bottom?: number } = {
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

  const bubblePosition: { left?: number; right?: number; top?: number; bottom?: number } = getBubblePosition();
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