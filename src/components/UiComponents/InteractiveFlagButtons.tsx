import React, { useContext, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Reanimated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { NavigationProp } from "@react-navigation/native";
import { ThemeContext } from "../../context/ThemeContext";
import { useTutorial } from "../../context/TutorialContext";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatModal from "../ChatBot/ChatModal";
import ChatbotNotification from "../ChatBot/ChatbotNotification";

type RootStackParamList = {
  Quiz: undefined;
  Main: { screen: string };
  // Add other screens as needed
};

// Standard Flag Button Component
const FlagButton = ({ 
  icon, 
  label, 
  onPress 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  onPress: () => void 
}) => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);
  const textOpacity = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isHovered ? 120 : 48, { duration: 300 }),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isHovered ? 1 : 0, { duration: 200 }),
    };
  });

  useEffect(() => {
    textOpacity.value = isHovered ? 1 : 0;
  }, [isHovered]);

  return (
    <Reanimated.View
      style={[
        styles.flagContainer,
        animatedContainerStyle,
        { backgroundColor: theme.accent },
      ]}
      {...(Platform.OS === "web" ? { 
        onMouseEnter: () => setIsHovered(true), 
        onMouseLeave: () => setIsHovered(false) 
      } : {})}
    >
      <TouchableOpacity
        style={styles.flagButton}
        onPress={onPress}
        onPressIn={Platform.OS !== "web" ? () => setIsHovered(true) : undefined}
        onPressOut={Platform.OS !== "web" ? () => setIsHovered(false) : undefined}
      >
        <Ionicons name={icon} size={24} color="#fff" />
        <Reanimated.Text style={[styles.flagText, animatedTextStyle]}>
          {label}
        </Reanimated.Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

// Chat Flag Button (nicht verschiebbar)
const ChatFlagButton = () => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);
  const textOpacity = useSharedValue(0);
  
  // Modal & notification states
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);
  
  // Position tracking - nur für die Benachrichtigung
  const screenDimensions = Dimensions.get("window");
  const [screenWidth, setScreenWidth] = useState(screenDimensions.width);
  const [screenHeight, setScreenHeight] = useState(screenDimensions.height);

  // Feste Position der Flag
  const flagPosition = {
    x: screenWidth - 60,
    y: screenHeight - 250
  };
  
  useEffect(() => {
    textOpacity.value = isHovered ? 1 : 0;
  }, [isHovered]);
  
  // Überprüfe Benachrichtigungsstatus
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        const notificationSeen = await AsyncStorage.getItem("chatNotificationSeen");
        setHasShownNotification(notificationSeen === "true");
        
        if (notificationSeen !== "true") {
          setTimeout(() => {
            setNotificationVisible(true);
            // Nach 15 Sekunden ausblenden
            setTimeout(() => {
              setNotificationVisible(false);
            }, 15000);
          }, 10000); // Nach 10 Sekunden anzeigen
        }
      } catch (error) {
        console.error("Error checking notification status:", error);
      }
    };
    
    checkNotificationStatus();
  }, []);

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get("window").width);
      setScreenHeight(Dimensions.get("window").height);
    };
    
    if (Platform.OS === "web") {
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  // Chat öffnen 
  const handleOpenChat = () => {
    setModalVisible(true);
    setNotificationVisible(false);
    
    // Benachrichtigung als gesehen markieren
    AsyncStorage.setItem("chatNotificationSeen", "true");
    setHasShownNotification(true);
  };
  
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isHovered ? 120 : 48, { duration: 300 }),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isHovered ? 1 : 0, { duration: 200 }),
    };
  });

  return (
    <React.Fragment>
      <Reanimated.View
        style={[
          styles.flagContainer,
          animatedContainerStyle,
          { 
            backgroundColor: theme.accent,
            marginBottom: 10
          }
        ]}
        {...(Platform.OS === "web" ? {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false)
        } : {})}
      >
        <TouchableOpacity
          style={styles.flagButton}
          onPress={handleOpenChat}
          onPressIn={Platform.OS !== "web" ? () => setIsHovered(true) : undefined}
          onPressOut={Platform.OS !== "web" ? () => setIsHovered(false) : undefined}
        >
          <Ionicons name="chatbox-ellipses" size={24} color="#fff" />
          <Reanimated.Text style={[styles.flagText, animatedTextStyle]}>
            Chat AI
          </Reanimated.Text>
        </TouchableOpacity>
      </Reanimated.View>
      
      <ChatbotNotification
        buttonPosition={flagPosition}
        buttonSize={{ width: 48, height: 48 }}
        visible={notificationVisible && !hasShownNotification}
      />
      
      <ChatModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default function InteractiveFlagButtons() {
  const { startTutorial } = useTutorial();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useContext(AuthContext);

  // Check which tools to display based on user settings
  // Angepasst für das richtige Schema - Tutorial auf Android immer ausblenden
  const showChatAi = user?.displayedTools?.chatAi !== false;
  const showTutorial = Platform.OS === "android" ? false : user?.displayedTools?.tutorial !== false;
  const showQuiz = user?.displayedTools?.quiz !== false;

  // Don't render anything if no tools are visible
  if (!showChatAi && !showTutorial && !showQuiz) {
    return null;
  }

  // Button handlers
  const handleTutorialPress = () => {
    // Erst zur Market-Seite navigieren und dann das Tutorial starten
    navigation.navigate("Main", { screen: "Market" });
    
    // Kurze Verzögerung, damit die Navigation abgeschlossen wird
    setTimeout(() => {
      startTutorial();
    }, 300);
  };
  
  const handleQuizPress = () => navigation.navigate("Quiz");

  return (
    <View style={styles.container}>
      {showChatAi && <ChatFlagButton />}
      
      {showTutorial && (
        <FlagButton
          icon="school-outline"
          label="Tutorial"
          onPress={handleTutorialPress}
        />
      )}
      
      {showQuiz && (
        <FlagButton
          icon="help-circle-outline"
          label="Quiz"
          onPress={handleQuizPress}
        />
      )}
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
  floatingButton: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
    zIndex: 1100,
  },
  floatingButtonContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  }
});
