import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTutorial } from "../../context/TutorialContext";
import { useTheme } from "../../context/ThemeContext";
import { getTutorialSteps, TutorialStepData, isWeb } from "./TutorialStep";

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

const findElementByTarget = async (
  targetId: string,
  currentStep?: TutorialStepData
): Promise<any> => {
  if (!isWeb) {
    // Return null for native platforms, as we'll use simulated positions
    return null;
  }

  // 1) Versuche mit angegebenem Web-Selektor (neue Eigenschaft)
  if (currentStep?.webSelector) {
    try {
      const element = document.querySelector(currentStep.webSelector);
      if (element) {
        element.id = targetId;
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        };
      }
    } catch (e) {
      console.log("Error with webSelector:", e);
    }
  }

  // 2) Try direct ID
  let position = await measureElement(targetId);
  if (position) return position;

  // 3) Erweiterte Selektor-Strategie für Web
  if (targetId === "profile-button" || targetId === "settings-button") {
    try {
      // Versuche mehrere mögliche Selektoren
      const selectors = [
        `header .r-flexDirection-row:last-child`, // Original
        `header [role="navigation"]`,
        `nav[role="navigation"]`,
        `.header-right`,
        `header > div:last-child`,
      ];

      let headerElement = null;
      for (const selector of selectors) {
        headerElement = document.querySelector(selector);
        if (headerElement) break;
      }

      if (headerElement) {
        // Jetzt suche nach passenden Buttons innerhalb des Headers
        const buttons = [
          ...headerElement.querySelectorAll('button, [role="button"]'),
        ];

        const profileSelectors = ["person", "profile", "user", "account"];
        const settingsSelectors = ["settings", "gear", "cog"];

        const targetSelectors =
          targetId === "profile-button" ? profileSelectors : settingsSelectors;

        // Suche nach Button mit passendem Text oder Icon
        for (const button of buttons) {
          const buttonContent =
            button.textContent?.toLowerCase() || button.innerHTML.toLowerCase();

          if (
            targetSelectors.some((selector) => buttonContent.includes(selector))
          ) {
            button.id = targetId;
            const rect = button.getBoundingClientRect();
            return {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
            };
          }
        }
      }
    } catch (e) {
      console.log(`Error finding ${targetId}:`, e);
    }
  }

  // 4) Try alternative selectors for navigation items
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
  } else if (targetId === "burger-menu") {
    const burgerIcon = document.querySelector('button:has(svg[name="menu"])');
    if (burgerIcon) {
      burgerIcon.id = targetId;
      return await measureElement(targetId);
    }
  }

  // 5) Return null if element not found
  return null;
};

// Fallback simulated positions for different layouts
const getSimulatedPosition = (
  targetId: string,
  width: number,
  height: number
) => {
  // For the profile and settings buttons, make the highlight smaller or circular
  const iconSize = 28; // Matches your typical icon size
  const paddingAround = 10; // Space around the icon in the highlight

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
    } else if (targetId === "settings-button") {
      const x = width - 60 + 15;
      const y = 30;
      return {
        x: x - paddingAround,
        y: y - paddingAround,
        width: iconSize + 2 * paddingAround,
        height: iconSize + 2 * paddingAround,
      };
    } else if (targetId === "profile-button") {
      const x = width - 110 + 15;
      const y = 30;
      return {
        x: x - paddingAround,
        y: y - paddingAround,
        width: iconSize + 2 * paddingAround,
        height: iconSize + 2 * paddingAround,
      };
    }
  }
  // Tablet layout
  else if (width >= 768 && width < 1024) {
    if (targetId === "burger-menu") {
      // Burger-Menü ist links vom Profil-Button
      const x = width - 125;
      const y = 23;
      return {
        x: x - paddingAround,
        y: y - paddingAround,
        width: iconSize + 2 * paddingAround -10,
        height: iconSize + 2 * paddingAround -10,
      };
    } else if (targetId === "settings-button") {
      // Settings-Button ist ganz rechts
      const x = width - 45;
      const y = 30;
      return {
        x: x - paddingAround,
        y: y - paddingAround,
        width: iconSize + 2 * paddingAround ,
        height: iconSize + 2 * paddingAround ,
      };
    } else if (targetId === "profile-button") {
      // Profil-Button ist zwischen Burger-Menü und Settings
      const x = width - 88;
      const y = 30;
      return {
        x: x - paddingAround,
        y: y - paddingAround,
        width: iconSize + 2 * paddingAround,
        height: iconSize + 2 * paddingAround,
      };
    } else if (targetId === "markets-button" || targetId === "tab-markets") {
      return {
        x: width * 0.2,
        y: 30, 
        width: 100, 
        height: 40 
      };
    } else if (targetId === "share-button" || targetId === "tab-share") {
      return {
        x: width * 0.3, 
        y: 30, 
        width: 100, 
        height: 40 };
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
    // Layout Konstanten
    const logoWidth = 165; // Geschätzte Breite des Logos
    const navStartX = logoWidth - 20; // Navigation beginnt nach dem Logo + Abstand
    const navItemWidth = 85; // Breite eines Navigationselements
    const navItemGap = 5; // Abstand zwischen Navigationselementen

    // Position für die Elemente berechnen
    if (targetId === "markets-button" || targetId === "tab-markets") {
      return {
        x: navStartX,
        y: 10,
        width: navItemWidth,
        height: 40,
      };
    } else if (targetId === "share-button" || targetId === "tab-share") {
      return {
        x: navStartX + navItemWidth + navItemGap,
        y: 10,
        width: navItemWidth,
        height: 40,
      };
    } else if (targetId === "trade-button" || targetId === "tab-trade") {
      return {
        x: navStartX + (navItemWidth + navItemGap) * 2,
        y: 10,
        width: navItemWidth - 10,
        height: 40,
      };
    } else if (targetId === "discover-button" || targetId === "tab-discover") {
      return {
        x: navStartX + (navItemWidth + navItemGap) * 3,
        y: 10,
        width: navItemWidth,
        height: 40,
      };
    } else if (
      targetId === "portfolio-button" ||
      targetId === "tab-portfolio"
    ) {
      return {
        x: navStartX + (navItemWidth + navItemGap) * 4,
        y: 10,
        width: navItemWidth + 10,
        height: 40,
      };
    }
    // Settings und Profile buttons bleiben rechts fixiert
    else if (targetId === "settings-button") {
      const x = width - 60 + 15;
      const y = 30;
      return {
        x: x - paddingAround,
        y: y - paddingAround,
        width: iconSize + 2 * paddingAround,
        height: iconSize + 2 * paddingAround,
      };
    } else if (targetId === "profile-button") {
      const x = width - 110 + 15;
      const y = 30;
      return {
        x: x - paddingAround + 7,
        y: y - paddingAround,
        width: iconSize + 2 * paddingAround,
        height: iconSize + 2 * paddingAround,
      };
    }
  }

  // Default fallback
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

  // Offset-Konstanten definieren
  const highlightOffsetX = 0; // Passe diesen Wert an (z.B. -2, +2, ...)
  const highlightOffsetY = 0; // Passe diesen Wert an
  const tooltipOffsetX = 0; // Offset für das Tooltip horizontal
  const tooltipOffsetY = 0; // Offset für das Tooltip vertikal

  // Dynamische Berechnung der Desktop-Offsets basierend auf der Bildschirmbreite
  const getDesktopOffsets = (screenWidth: number) => {
    const xOffset = -10; // Leicht nach links verschoben vom jeweiligen Element
    const yOffset = -10; // Nach oben verschoben

    return { x: xOffset, y: yOffset };
  };

  // Neue Funktion für Tablet-spezifische Offsets
  const getTabletOffsets = () => {
    return {
      x: -80, // Deutlicher Versatz nach links
      y: -10
    };
  };

  // Load steps based on screen size
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

  // Reset to first step on tutorial start
  useEffect(() => {
    if (isTutorialActive) {
      setCurrentStepIndex(0);
    }
  }, [isTutorialActive]);

  const currentStep = steps[currentStepIndex];

  // Update the highlight position
  const updateTargetPosition = async () => {
    if (!currentStep || !currentStep.targetElementId) {
      setTargetPosition(null);
      return;
    }

    try {
      // Pass current step to improve element finding
      const position = await findElementByTarget(
        currentStep.targetElementId,
        currentStep
      );
      if (position) {
        setTargetPosition(position);
      } else {
        // Fallback
        const simulatedPosition = getSimulatedPosition(
          currentStep.targetElementId,
          width,
          height
        );
        setTargetPosition(simulatedPosition);
      }
    } catch (error) {
      console.error("Error updating target position:", error);
      // Use fallback if there's an error
      const simulatedPosition = getSimulatedPosition(
        currentStep.targetElementId,
        width,
        height
      );
      setTargetPosition(simulatedPosition);
    }
  };

  // Re-run when step changes or on screen resize
  useEffect(() => {
    if (isTutorialActive && currentStep) {
      // Fade out old highlight
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
        // Re-measure
        updateTargetPosition().then(() => {
          // Fade in new highlight
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
              toValue: 0.8, // Numerischer Wert, nicht Boolean
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        });
      });
    }
  }, [currentStep, isTutorialActive, width, height]);

  // Navigation
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

  // Determine tooltip position
  const getTooltipPosition = () => {
    // Definiere hier ggf. Offset-Werte für das Tooltip
    const tooltipWidth = width < 768 ? Math.min(300, width - 40) : 300;
    const tooltipHeight = 180; // Approximate height

    // Offset basierend auf dem Gerätetyp
    let currentOffsetX = tooltipOffsetX;
    let currentOffsetY = tooltipOffsetY;

    // Desktop-Ansicht
    if (width >= 1024) {
      const desktopOffsets = getDesktopOffsets(width);
      currentOffsetX = desktopOffsets.x;
      currentOffsetY = desktopOffsets.y;
    } 
    // Tablet-Ansicht
    else if (width >= 768 && width < 1024) {
      const tabletOffsets = getTabletOffsets();
      currentOffsetX = tabletOffsets.x;
      currentOffsetY = tabletOffsets.y;
    }

    // Zusätzliche Sicherheitsabfrage, damit Tooltip nicht rechts überläuft
    const ensureOnScreen = (left: number) => {
      // Stellt sicher, dass der Tooltip nie über den rechten Bildschirmrand hinausragt
      return Math.min(left, width - tooltipWidth - 10);
    };

    if (!targetPosition || !currentStep.position) {
      return {
        top: height / 2 - 100 + currentOffsetY,
        left: ensureOnScreen(width / 2 - 150 + currentOffsetX),
      };
    }

    switch (currentStep.position) {
      case "top":
        return {
          bottom: Math.max(10, height - targetPosition.y + 15) + currentOffsetY,
          left: ensureOnScreen(
            Math.max(
              10,
              Math.min(
                width - tooltipWidth - 10,
                targetPosition.x + targetPosition.width / 2 - tooltipWidth / 2
              )
            ) + currentOffsetX
          ),
        };
      case "bottom":
        return {
          top:
            Math.min(
              height - tooltipHeight - 10,
              targetPosition.y + targetPosition.height + 15
            ) + currentOffsetY,
          left: ensureOnScreen(
            Math.max(
              10,
              Math.min(
                width - tooltipWidth - 10,
                targetPosition.x + targetPosition.width / 2 - tooltipWidth / 2
              )
            ) + currentOffsetX
          ),
        };
      case "left":
        // Bei position="left" besonders auf Tablet aufpassen
        if (width >= 768 && width < 1024) {
          return {
            top: Math.max(
              10,
              targetPosition.y + targetPosition.height / 2 - tooltipHeight / 2
            ) + currentOffsetY,
            left: Math.max(10, targetPosition.x - tooltipWidth - 15),
          };
        } else {
          return {
            top:
              Math.max(
                10,
                targetPosition.y + targetPosition.height / 2 - tooltipHeight / 2
              ) + currentOffsetY,
            right: Math.max(10, width - targetPosition.x + 15) + -currentOffsetX,
          };
        }
      case "right":
        return {
          top:
            Math.max(
              10,
              targetPosition.y + targetPosition.height / 2 - tooltipHeight / 2
            ) + currentOffsetY,
          left: ensureOnScreen(
            Math.min(
              width - tooltipWidth - 10,
              targetPosition.x + targetPosition.width + 15
            ) + currentOffsetX
          ),
        };
      default:
        return {
          top: height / 2 - 100 + currentOffsetY,
          left: ensureOnScreen(width / 2 - 150 + currentOffsetX),
        };
    }
  };

  const tooltipPosition = getTooltipPosition();
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Decide highlight style
  let highlightStyle: any = {
    top: targetPosition ? targetPosition.y - 5 : 0,
    left: targetPosition ? targetPosition.x - 5 : 0,
    width: targetPosition ? targetPosition.width + 10 : 0,
    height: targetPosition ? targetPosition.height + 10 : 0,
    borderColor: theme.accent,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    backgroundColor: "transparent",
    position: "absolute",
    zIndex: 10,
  };

  const isProfileOrSettings =
    currentStep?.targetElementId === "profile-button" ||
    currentStep?.targetElementId === "settings-button";

  if (targetPosition && isProfileOrSettings) {
    // Zuerst definieren wir Offset-Werte für die Highlight-Markierung:
    const offsetX = highlightOffsetX + 2; // z.B. -2, +2
    const offsetY = highlightOffsetY - 12; // z.B.  2, -2

    // Dann berechnen wir den Kreis:
    const highlightDiameter =
      Math.max(targetPosition.width, targetPosition.height) - 5;
    const highlightRadius = highlightDiameter / 2;
    const centerX = targetPosition.x + targetPosition.width / 2;
    const centerY = targetPosition.y + targetPosition.height / 2;

    // Anschließend wenden wir die Offsets an:
    highlightStyle = {
      ...highlightStyle,
      top: centerY - highlightRadius + offsetY,
      left: centerX - highlightRadius + offsetX,
      width: highlightDiameter,
      height: highlightDiameter,
      borderRadius: highlightRadius,
    };
  }

  return (
    <Modal transparent visible={isTutorialActive} animationType="fade">
      <View style={styles.container}>
        {/* Dimmed overlay areas that avoid the target element */}
        {targetPosition && (
          <>
            {/* Top */}
            <View
              style={[
                styles.overlaySection,
                {
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: targetPosition.y,
                },
              ]}
            />
            {/* Left */}
            <View
              style={[
                styles.overlaySection,
                {
                  top: targetPosition.y,
                  left: 0,
                  width: targetPosition.x,
                  height: targetPosition.height,
                },
              ]}
            />
            {/* Right */}
            <View
              style={[
                styles.overlaySection,
                {
                  top: targetPosition.y,
                  left: targetPosition.x + targetPosition.width,
                  width: width - (targetPosition.x + targetPosition.width),
                  height: targetPosition.height,
                },
              ]}
            />
            {/* Bottom */}
            <View
              style={[
                styles.overlaySection,
                {
                  top: targetPosition.y + targetPosition.height,
                  left: 0,
                  width: "100%",
                  height: height - (targetPosition.y + targetPosition.height),
                },
              ]}
            />

            {/* Highlight border */}
            <Animated.View 
              style={[
                highlightStyle, 
                { opacity: highlightOpacity } // Korrekte Verwendung mit Animated.View
              ]} 
            />
          </>
        )}

        {/* If no target, full screen dim */}
        {!targetPosition && <View style={styles.fullOverlay} />}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            tooltipPosition,
            {
              backgroundColor: theme.background,
              borderColor: theme.accent,
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
          <Text style={[styles.tooltipDescription, { color: theme.text }]}>
            {currentStep.description}
          </Text>

          {/* Footer (Skip/Prev/Next) */}
          <View style={styles.tooltipFooter}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: theme.accent }]}>
                Skip
              </Text>
            </TouchableOpacity>

            <View style={styles.navigationButtons}>
              {!isFirstStep && (
                <TouchableOpacity
                  onPress={goToPrevStep}
                  style={[styles.navButton, { borderColor: theme.text }]}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.text} />
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  overlaySection: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  highlight: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: "dashed",
    backgroundColor: "transparent",
    zIndex: 10,
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
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
  },
  finishText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    padding: 4,
  },
});

export default TutorialOverlay;
