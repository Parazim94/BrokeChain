import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  Image,
  PanResponder,
  Dimensions,
  Text,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

interface ChatbotButtonProps {
  onPress: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  onPress,
  onPositionChange,
}) => {
  const { theme } = useContext(ThemeContext);
  const bounceAnimation = useRef(new Animated.Value(1)).current;

  // Bildschirmabmessungen ermitteln
  const screenDimensions = Dimensions.get("window");
  const [screenWidth, setScreenWidth] = useState(screenDimensions.width);
  const [screenHeight, setScreenHeight] = useState(screenDimensions.height);

  // Flag um zu prüfen, ob der Button jemals verschoben wurde
  const [wasEverMoved, setWasEverMoved] = useState(false);
  
  // Standard-Position für Flag-Style (rechts seitlich)
  const defaultFlagPosition = {
    x: screenWidth - 60,
    y: Platform.OS === "web" ? screenHeight - 200 : screenHeight - 250,
  };

  // Zustand: Position des Buttons
  const [position, setPosition] = useState(defaultFlagPosition);

  // Ref, um die zuletzt festgeschriebene Position zu speichern
  const lastPosition = useRef(position);

  // Animated ValueXY für die aktuelle Position
  const translatePosition = useRef(new Animated.ValueXY(position)).current;

  // Zustand, ob gerade gezogen wird
  const [isDragging, setIsDragging] = useState(false);
  
  // Hover-Zustand für die Flag-Animation (wenn nicht verschoben)
  const [isHovered, setIsHovered] = useState(false);

  // Variablen zur Unterscheidung zwischen Tap und Drag
  const touchStartTime = useRef(0);
  const hasMoved = useRef(false);

  // Aktualisierung der Bildschirmgrößen bei Resize
  const updateDimensions = () => {
    const { width, height } = Dimensions.get("window");
    setScreenWidth(width);
    setScreenHeight(height);
    
    // Aktualisiere auch die Flag-Position, wenn der Button nicht verschoben wurde
    if (!wasEverMoved) {
      const newFlagPosition = {
        x: width - 60,
        y: Platform.OS === "web" ? height - 200 : height - 250,
      };
      setPosition(newFlagPosition);
      lastPosition.current = newFlagPosition;
      translatePosition.setValue(newFlagPosition);
    }
  };

  // Beim Mount: Setze initiale Position und registriere ggf. den Resize-Listener
  useEffect(() => {
    translatePosition.setValue(position);
    lastPosition.current = position;
    if (Platform.OS === "web") {
      window.addEventListener("resize", updateDimensions);
      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }
  }, []);

  // Bei Änderung der Bildschirmgröße: Stelle sicher, dass der Button innerhalb der Grenzen bleibt
  useEffect(() => {
    const boundedX = Math.min(Math.max(0, position.x), screenWidth - 80);
    const boundedY = Math.min(Math.max(0, position.y), screenHeight - 80);

    if (boundedX !== position.x || boundedY !== position.y) {
      const newPos = { x: boundedX, y: boundedY };
      setPosition(newPos);
      lastPosition.current = newPos;
      translatePosition.setValue(newPos);
    }
  }, [screenWidth, screenHeight]);

  // Bounce-Animation konfigurieren
  useEffect(() => {
    let bounceTimer: NodeJS.Timeout;

    const startBounceAnimation = () => {
      if (!isDragging) {
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
        ]).start();

        bounceTimer = setTimeout(startBounceAnimation, 5000);
      }
    };

    startBounceAnimation();

    return () => {
      if (bounceTimer) clearTimeout(bounceTimer);
      bounceAnimation.stopAnimation();
    };
  }, [isDragging]);

  // Lade die gespeicherte Position aus AsyncStorage
  useEffect(() => {
    const loadSavedPosition = async () => {
      try {
        const savedPositionString = await AsyncStorage.getItem(
          "chatbotButtonPosition"
        );
        
        if (savedPositionString) {
          const wasMoved = await AsyncStorage.getItem("chatbotButtonWasMoved");
          setWasEverMoved(wasMoved === "true");
          
          const savedPosition = JSON.parse(savedPositionString);
          const x = Math.min(Math.max(0, savedPosition.x), screenWidth - 80);
          const y = Math.min(Math.max(0, savedPosition.y), screenHeight - 80);
          const newPos = { x, y };
          setPosition(newPos);
          lastPosition.current = newPos;
          translatePosition.setValue(newPos);
        }
      } catch (error) {
        console.error("Error loading chatbot position:", error);
      }
    };

    loadSavedPosition();
  }, [screenWidth, screenHeight]);

  // Notify parent of position changes
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(position);
    }
  }, [position, onPositionChange]);

  // PanResponder zur Handhabung des Drag & Drop
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        touchStartTime.current = Date.now();
        hasMoved.current = false;
      },

      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          hasMoved.current = true;
          setIsDragging(true);
        }

        // Berechne neue Position basierend auf der letzten festgeschriebenen Position
        const newX = lastPosition.current.x + dx;
        const newY = lastPosition.current.y + dy;
        translatePosition.setValue({ x: newX, y: newY });
      },

      onPanResponderRelease: (_, gestureState) => {
        const touchDuration = Date.now() - touchStartTime.current;

        if (!hasMoved.current && touchDuration < 200) {
          // Es war ein Tap
          onPress();
        } else if (hasMoved.current) {
          // Es war ein Drag – berechne die finale Position unter Einhaltung der Bildschirmgrenzen
          const newX = Math.min(
            Math.max(0, lastPosition.current.x + gestureState.dx),
            screenWidth - 80
          );
          const newY = Math.min(
            Math.max(0, lastPosition.current.y + gestureState.dy),
            screenHeight - 80
          );

          const newPos = { x: newX, y: newY };
          setPosition(newPos);
          lastPosition.current = newPos;
          translatePosition.setValue(newPos);

          // Markiere, dass der Button manuell verschoben wurde
          setWasEverMoved(true);
          AsyncStorage.setItem("chatbotButtonWasMoved", "true");

          // Notify parent of position changes
          if (onPositionChange) {
            onPositionChange(newPos);
          }

          // Speichere die neue Position in AsyncStorage
          try {
            AsyncStorage.setItem(
              "chatbotButtonPosition",
              JSON.stringify(newPos)
            );
          } catch (error) {
            console.error("Error saving position:", error);
          }
        }

        setIsDragging(false);
      },

      onPanResponderTerminate: () => {
        setIsDragging(false);
        hasMoved.current = false;
        translatePosition.setValue(lastPosition.current);
      },
    })
  ).current;

  // Berechne die Breite für den Flag-Style
  const getButtonStyle = () => {
    if (wasEverMoved) {
      // Runder Button, wenn jemals verschoben
      return {
        width: 50,
        height: 50,
        borderRadius: 30,
      };
    } else {
      // Flag-Style, wenn nie verschoben
      return {
        width: isHovered ? 120 : 48,
        height: 48,
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getButtonStyle(),
        {
          backgroundColor: theme.accent,
          transform: [
            { translateX: translatePosition.x },
            { translateY: translatePosition.y },
            { scale: isDragging ? 1.2 : bounceAnimation },
          ],
        },
        isDragging && { opacity: 0.8 },
      ]}
      {...panResponder.panHandlers}
      {...(Platform.OS === "web" && !wasEverMoved ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } : {} as any)}
    >
      {wasEverMoved ? (
        // Runder Button mit Icon, wenn verschoben
        <Image
          source={require("../../../assets/images/Brokechain3.png")}
          style={styles.botImage}
          tintColor="#FFFFFF"
          resizeMode="contain"
        />
      ) : (
        // Flag-Style mit Text, wenn nicht verschoben
        <View style={styles.flagButton}>
          <Ionicons name="chatbox-ellipses" size={24} color="#fff" />
          {isHovered && (
            <Text style={styles.flagText}>Chat AI</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
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

export default ChatbotButton;
