import React from "react";
import { StyleProp, ViewStyle, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface TutorialStepData {
  id: string;
  title: string;
  description: string;
  targetElementId?: string;
  position?: "top" | "bottom" | "left" | "right";
  icon?: keyof typeof Ionicons.glyphMap;
  targetElementStyle?: StyleProp<ViewStyle>;
  onlyShowOn?: "mobile" | "tablet" | "desktop" | "all";
  webSelector?: string; // CSS-Selektor für Web-Ansicht
  nativeOnly?: boolean; // Nur in nativer Umgebung anzeigen
  webOnly?: boolean; // Nur im Web anzeigen
}

// Plattformerkennung verbessern
export const isNativeMobile = Platform.OS !== "web";
export const isWeb = Platform.OS === "web";

// Define tutorial steps for different screen sizes
export const getMobileSteps = (): TutorialStepData[] => [
  {
    id: "welcome",
    title: "Welcome to TradeYoMama",
    description:
      "Let's take a quick tour of the app. You can skip or exit the tutorial at any time.",
    icon: "rocket-outline",
    onlyShowOn: "all",
  },
  {
    id: "markets-mobile",
    title: "Markets",
    description: "View real-time market data, trends, and stock prices.",
    targetElementId: "tab-markets",
    position: "top",
    icon: "trending-up",
    onlyShowOn: "mobile",
  },
  {
    id: "share-mobile",
    title: "Share",
    description: "Share your investments and strategies with the community.",
    targetElementId: "tab-share",
    position: "top",
    icon: "share-social",
    onlyShowOn: "mobile",
  },
  {
    id: "trade-mobile",
    title: "Trade",
    description: "Execute trades in real-time. Buy and sell assets with ease.",
    targetElementId: "tab-trade",
    position: "top",
    icon: "swap-horizontal",
    onlyShowOn: "mobile",
  },
  {
    id: "discover-mobile",
    title: "Discover",
    description:
      "Explore new investment opportunities and learn about market trends.",
    targetElementId: "tab-discover",
    position: "top",
    icon: "compass",
    onlyShowOn: "mobile",
  },
  {
    id: "portfolio-mobile",
    title: "Portfolio",
    description:
      "Track your investments, analyze performance, and manage your assets.",
    targetElementId: "tab-portfolio",
    position: "top",
    icon: "wallet",
    onlyShowOn: "mobile",
  },
];

export const getDesktopSteps = (): TutorialStepData[] => [
  {
    id: "welcome",
    title: "Welcome to TradeYoMama",
    description:
      "Let's take a quick tour of the app. You can skip or exit the tutorial at any time.",
    icon: "rocket-outline",
    onlyShowOn: "all",
  },
  {
    id: "markets-desktop",
    title: "Markets",
    description: "View real-time market data, trends, and stock prices.",
    targetElementId: "markets-button",
    position: "bottom",
    icon: "trending-up",
    onlyShowOn: "desktop",
  },
  {
    id: "share-desktop",
    title: "Share",
    description: "Share your investments and strategies with the community.",
    targetElementId: "share-button",
    position: "bottom",
    icon: "share-social",
    onlyShowOn: "desktop",
  },
  {
    id: "trade-desktop",
    title: "Trade",
    description: "Execute trades in real-time. Buy and sell assets with ease.",
    targetElementId: "trade-button",
    position: "bottom",
    icon: "swap-horizontal",
    onlyShowOn: "desktop",
  },
  {
    id: "discover-desktop",
    title: "Discover",
    description:
      "Explore new investment opportunities and learn about market trends.",
    targetElementId: "discover-button",
    position: "bottom",
    icon: "compass",
    onlyShowOn: "desktop",
  },
  {
    id: "portfolio-desktop",
    title: "Portfolio",
    description:
      "Track your investments, analyze performance, and manage your assets.",
    targetElementId: "portfolio-button",
    position: "bottom",
    icon: "wallet",
    onlyShowOn: "desktop",
  },
];

export const getTabletSteps = (): TutorialStepData[] => [
  ...getDesktopSteps(),
  {
    id: "burger-menu",
    title: "Menu",
    description:
      "Access the navigation menu to browse different sections of the app.",
    targetElementId: "burger-menu",
    position: "left",
    icon: "menu",
    onlyShowOn: "tablet",
  },
];

export const getCommonSteps = (): TutorialStepData[] => [
  {
    id: "settings",
    title: "Settings",
    description:
      "Customize your app experience, adjust preferences, and configure account settings.",
    targetElementId: "settings-button",
    position: "left",
    icon: "settings-outline",
    onlyShowOn: "all",
  },
  {
    id: "profile",
    title: "Profile",
    description:
      "Access your account details, view your profile, and manage your personal information.",
    targetElementId: "profile-button",
    position: "left",
    icon: "person-circle",
    onlyShowOn: "all",
  },
  {
    id: "finish",
    title: "You're all set!",
    description:
      "Now you know the basics of TradeYoMama. Start exploring and happy trading!",
    icon: "checkmark-circle-outline",
    onlyShowOn: "all",
  },
];

// Get appropriate tutorial steps based on screen width and platform
export const getTutorialSteps = (width: number): TutorialStepData[] => {
  const commonSteps = getCommonSteps();
  let steps: TutorialStepData[] = [];

  if (width < 768) {
    steps = [...getMobileSteps(), ...commonSteps];
  } else if (width >= 768 && width < 1024) {
    steps = [...getTabletSteps(), ...commonSteps];
  } else {
    steps = [...getDesktopSteps(), ...commonSteps];
  }

  // Filtere Schritte basierend auf Plattform
  return steps.filter(step => {
    // Wenn nativeOnly und wir sind im Web, überspringen
    if (step.nativeOnly && isWeb) return false;
    
    // Wenn webOnly und wir sind nativ, überspringen
    if (step.webOnly && isNativeMobile) return false;
    
    // Prüfe die "onlyShowOn"-Eigenschaft
    if (step.onlyShowOn === "all") return true;
    if (width < 768 && step.onlyShowOn === "mobile") return true;
    if (width >= 768 && width < 1024 && step.onlyShowOn === "tablet") return true;
    if (width >= 1024 && step.onlyShowOn === "desktop") return true;
    return false;
  });
};
