import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
  findNodeHandle,
  UIManager,
  Button,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTutorial } from "../../context/TutorialContext";
import { useTheme } from "../../context/ThemeContext";
import { getTutorialSteps, TutorialStepData } from "./TutorialStep";

// Helper function to measure element position
const measureElement = (
  id: string
): Promise<{ x: number; y: number; width: number; height: number } | null> => {
  return new Promise((resolve) => {
    if (Platform.OS === "web") {
      try {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          resolve({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          });
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error("Error measuring element:", error);
        resolve(null);
      }
    } else {
      // React Native measurement would go here if needed
      resolve(null);
    }
  });
};

const findElementByTarget = async (targetId: string): Promise<any> => {
  // First try direct ID
  let position = await measureElement(targetId);
  if (position) return position;

  // Try alternative selectors for navigation items
  if (
    targetId.includes("tab-") ||
    targetId === "markets-button" ||
    targetId === "share-button" ||
    targetId === "trade-button" ||
    targetId === "discover-button" ||
    targetId === "portfolio-button"
  ) {
    // Extract the feature name
    const featureName = targetId.replace("tab-", "").replace("-button", "");

    // Try various selectors
    const selectors = [
      `[role="tab"][aria-label*="${featureName}" i]`,
      `a[href*="${featureName}"]`,
      `div[role="button"]:has(span:contains("${featureName}"))`,
      `button:contains("${featureName}")`,
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          element.id = targetId; // Set ID for future reference
          position = await measureElement(targetId);
          if (position) return position;
          break;
        }
      } catch (e) {
        // Some selectors might not be supported
        console.log("Selector failed:", selector);
      }
    }
  }
  // Try for header buttons
  else if (targetId === "profile-button") {
    const profileIcon = document.querySelector(
      'button:has(svg[name="person-circle"])'
    );
    if (profileIcon) {
      profileIcon.id = targetId;
      return await measureElement(targetId);
    }
  } else if (targetId === "settings-button") {
    const settingsIcon = document.querySelector(
      'button:has(svg[name="settings-outline"])'
    );
    if (settingsIcon) {
      settingsIcon.id = targetId;
      return await measureElement(targetId);
    }
  } else if (targetId === "burger-menu") {
    const burgerIcon = document.querySelector('button:has(svg[name="menu"])');
    if (burgerIcon) {
      burgerIcon.id = targetId;
      return await measureElement(targetId);
    }
  }

  // Return null if element not found
  return null;
};

// Fallback simulated positions for different layouts
const getSimulatedPosition = (
  targetId: string,
  width: number,
  height: number
) => {
  // Mobile layout (bottom tabs)
  if (width < 768) {
    if (targetId === "tab-markets") {
      return { x: width * 0.1, y: height - 60, width: width * 0.2, height: 60 };
    } else if (targetId === "tab-share") {
      return { x: width * 0.3, y: height - 60, width: width * 0.2, height: 60 };
    } else if (targetId === "tab-trade") {
      return { x: width * 0.5, y: height - 60, width: width * 0.2, height: 60 };
    } else if (targetId === "tab-discover") {
      return { x: width * 0.7, y: height - 60, width: width * 0.2, height: 60 };
    } else if (targetId === "tab-portfolio") {
      return { x: width * 0.9, y: height - 60, width: width * 0.2, height: 60 };
    } else if (targetId === "profile-button") {
      return { x: width - 60, y: 30, width: 40, height: 40 };
    } else if (targetId === "settings-button") {
      return { x: width - 110, y: 30, width: 40, height: 40 };
    }
  }
  // Tablet layout
  else if (width >= 768 && width < 1024) {
    if (targetId === "burger-menu") {
      return { x: width - 60, y: 30, width: 40, height: 40 };
    } else if (targetId === "profile-button") {
      return { x: width - 110, y: 30, width: 40, height: 40 };
    } else if (targetId === "settings-button") {
      return { x: width - 160, y: 30, width: 40, height: 40 };
    }
    // Tab positions for tablet
    else if (targetId === "markets-button" || targetId === "tab-markets") {
      return { x: width * 0.2, y: 30, width: 100, height: 40 };
    } else if (targetId === "share-button" || targetId === "tab-share") {
      return { x: width * 0.3, y: 30, width: 100, height: 40 };
    } else if (targetId === "trade-button" || targetId === "tab-trade") {
      return { x: width * 0.4, y: 30, width: 100, height: 40 };
    } else if (targetId === "discover-button" || targetId === "tab-discover") {
      return { x: width * 0.5, y: 30, width: 100, height: 40 };
    } else if (
      targetId === "portfolio-button" ||
      targetId === "tab-portfolio"
    ) {
      return { x: width * 0.6, y: 30, width: 100, height: 40 };
    }
  }
  // Desktop layout
  else {
    if (targetId === "markets-button" || targetId === "tab-markets") {
      return { x: width * 0.35, y: 30, width: 100, height: 40 };
    } else if (targetId === "share-button" || targetId === "tab-share") {
      return { x: width * 0.42, y: 30, width: 100, height: 40 };
    } else if (targetId === "trade-button" || targetId === "tab-trade") {
      return { x: width * 0.49, y: 30, width: 100, height: 40 };
    } else if (targetId === "discover-button" || targetId === "tab-discover") {
      return { x: width * 0.56, y: 30, width: 100, height: 40 };
    } else if (
      targetId === "portfolio-button" ||
      targetId === "tab-portfolio"
    ) {
      return { x: width * 0.63, y: 30, width: 100, height: 40 };
    } else if (targetId === "profile-button") {
      return { x: width - 60, y: 30, width: 40, height: 40 };
    } else if (targetId === "settings-button") {
      return { x: width - 110, y: 30, width: 40, height: 40 };
    }
  }

  // Default fallback position
  return { x: width / 2 - 50, y: height / 2 - 25, width: 100, height: 50 };
};

const TutorialOverlay: React.FC = () => {
  const { isTutorialActive, endTutorial } = useTutorial();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TutorialStepData[]>([]);
  const [targetPosition, setTargetPosition] = useState<any>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;

  // Initialize steps based on screen width
  useEffect(() => {
    const tutorialSteps = getTutorialSteps(width).filter((step) => {
      if (step.onlyShowOn === "all") return true;
      if (width < 768 && step.onlyShowOn === "mobile") return true;
      if (width >= 768 && width < 1024 && step.onlyShowOn === "tablet")
        return true;
      if (width >= 1024 && step.onlyShowOn === "desktop") return true;
      return false;
    });
    setSteps(tutorialSteps);
  }, [width]);

  // Reset to first step when tutorial is activated
  useEffect(() => {
    if (isTutorialActive) {
      setCurrentStepIndex(0);
    }
  }, [isTutorialActive]);

  // Get current step
  const currentStep = steps[currentStepIndex];

  // Function to check web element positions
  const updateTargetPosition = async () => {
    if (!currentStep || !currentStep.targetElementId) {
      setTargetPosition(null);
      return;
    }

    try {
      // Try to find element through DOM
      const position = await findElementByTarget(currentStep.targetElementId);

      if (position) {
        setTargetPosition(position);
      } else {
        // Use fallback simulated position
        const simulatedPosition = getSimulatedPosition(
          currentStep.targetElementId,
          width,
          height
        );
        setTargetPosition(simulatedPosition);
      }
    } catch (error) {
      console.error("Error updating target position:", error);
      // Use fallback simulated position on error
      const simulatedPosition = getSimulatedPosition(
        currentStep.targetElementId,
        width,
        height
      );
      setTargetPosition(simulatedPosition);
    }
  };

  // Update position when step changes or when screen size changes
  useEffect(() => {
    if (isTutorialActive && currentStep) {
      // Fade out
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(highlightOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update position
        updateTargetPosition().then(() => {
          // Fade in
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(highlightOpacity, {
              toValue: 0.8,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        });
      });
    }
  }, [currentStep, isTutorialActive, width, height]);

  // Handle navigation
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endTutorial();
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    endTutorial();
  };

  if (!isTutorialActive || !currentStep) {
    return null;
  }

  // Calculate tooltip position based on target position and step position
  const getTooltipPosition = () => {
    if (!targetPosition || !currentStep.position) {
      // Center in screen if no target
      return {
        top: height / 2 - 100,
        left: width / 2 - 150,
      };
    }

    const tooltipWidth = width < 768 ? Math.min(300, width - 40) : 300;
    const tooltipHeight = 180; // Approximate height of tooltip

    switch (currentStep.position) {
      case "top":
        return {
          bottom: Math.max(10, height - targetPosition.y + 15),
          left: Math.max(
            10,
            Math.min(
              width - tooltipWidth - 10,
              targetPosition.x + targetPosition.width / 2 - tooltipWidth / 2
            )
          ),
        };
      case "bottom":
        return {
          top: Math.min(
            height - tooltipHeight - 10,
            targetPosition.y + targetPosition.height + 15
          ),
          left: Math.max(
            10,
            Math.min(
              width - tooltipWidth - 10,
              targetPosition.x + targetPosition.width / 2 - tooltipWidth / 2
            )
          ),
        };
      case "left":
        return {
          top: Math.max(
            10,
            targetPosition.y + targetPosition.height / 2 - tooltipHeight / 2
          ),
          right: Math.max(10, width - targetPosition.x + 15),
        };
      case "right":
        return {
          top: Math.max(
            10,
            targetPosition.y + targetPosition.height / 2 - tooltipHeight / 2
          ),
          left: Math.min(
            width - tooltipWidth - 10,
            targetPosition.x + targetPosition.width + 15
          ),
        };
      default:
        return {
          top: height / 2 - 100,
          left: width / 2 - 150,
        };
    }
  };

  const tooltipPosition = getTooltipPosition();
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <Modal transparent visible={isTutorialActive} animationType="fade">
      <BlurView intensity={30} style={StyleSheet.absoluteFill}>
        <View style={styles.overlay}>
          {/* Highlight around target element */}
          {targetPosition && (
            <Animated.View
              style={[
                styles.highlight,
                {
                  top: targetPosition.y - 5,
                  left: targetPosition.x - 5,
                  width: targetPosition.width + 10,
                  height: targetPosition.height + 10,
                  borderColor: theme.accent,
                  opacity: highlightOpacity,
                },
              ]}
            />
          )}

          {/* Tooltip */}
          <Animated.View
            style={[
              styles.tooltip,
              tooltipPosition,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                opacity,
                transform: [{ scale }],
              },
            ]}
          >
            {/* Title */}
            <View style={styles.tooltipHeader}>
              {currentStep.icon && (
                <Ionicons
                  name={currentStep.icon}
                  size={24}
                  color={theme.accent}
                  style={styles.tooltipIcon}
                />
              )}
              <Text style={[styles.tooltipTitle, { color: theme.text }]}>
                {currentStep.title}
              </Text>
            </View>

            {/* Description */}
            <Text
              style={[
                styles.tooltipDescription,
                { color: theme.textSecondary },
              ]}
            >
              {currentStep.description}
            </Text>

            {/* Navigation */}
            <View style={styles.tooltipFooter}>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: theme.textSecondary }]}>
                  Skip
                </Text>
              </TouchableOpacity>

              <View style={styles.navigationButtons}>
                {!isFirstStep && (
                  <TouchableOpacity
                    onPress={goToPrevStep}
                    style={[styles.navButton, { borderColor: theme.border }]}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={theme.text}
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={goToNextStep}
                  style={[
                    styles.navButton,
                    styles.nextButton,
                    { backgroundColor: theme.accent },
                  ]}
                >
                  {isLastStep ? (
                    <Text style={styles.finishText}>Done</Text>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tooltip: {
    position: "absolute",
    width: 300,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tooltipIcon: {
    marginRight: 10,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tooltipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  tooltipFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navigationButtons: {
    flexDirection: "row",
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  nextButton: {
    borderWidth: 0,
  },
  highlight: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: "dashed",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
  },
  finishText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default TutorialOverlay;
