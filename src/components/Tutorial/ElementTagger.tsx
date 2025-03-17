import React, { useEffect } from "react";
import { Platform } from "react-native";

/**
 * This component adds IDs to DOM elements for the tutorial system to target
 */
const ElementTagger = () => {
  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== "web") return;

    // Set a timeout to ensure DOM is loaded
    const timeoutId = setTimeout(tagElements, 1000);

    // Set an interval to periodically re-tag elements (handles navigation changes)
    const intervalId = setInterval(tagElements, 5000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  const tagElements = () => {
    try {
      // Tag navigation tabs
      tagTabElements();

      // Tag header buttons
      tagHeaderElements();
    } catch (error) {
      console.error("Error tagging elements:", error);
    }
  };

  // Tag navigation tabs
  const tagTabElements = () => {
    // Web tabs in WebTabTextMenu
    const tabTexts = document.querySelectorAll(
      '.r-flexDirection-18u94kl [role="button"]'
    );
    tabTexts.forEach((element) => {
      const text = element.textContent?.toLowerCase();
      if (text) {
        if (text.includes("markets")) element.id = "markets-button";
        if (text.includes("share")) element.id = "share-button";
        if (text.includes("trade")) element.id = "trade-button";
        if (text.includes("discover")) element.id = "discover-button";
        if (text.includes("portfolio")) element.id = "portfolio-button";
      }
    });

    // Mobile tabs
    const tabElements = document.querySelectorAll('[role="tab"]');
    tabElements.forEach((element) => {
      const label = element.getAttribute("aria-label")?.toLowerCase();
      if (label) {
        if (label.includes("markets")) element.id = "tab-markets";
        if (label.includes("share")) element.id = "tab-share";
        if (label.includes("trade")) element.id = "tab-trade";
        if (label.includes("discover")) element.id = "tab-discover";
        if (label.includes("portfolio")) element.id = "tab-portfolio";
      }
    });
  };

  // Tag header buttons (profile, settings, burger menu)
  const tagHeaderElements = () => {
    const headerButtons = document.querySelectorAll("header button");
    headerButtons.forEach((button) => {
      const innerHTML = button.innerHTML.toLowerCase();

      // Profile button
      if (
        innerHTML.includes("person-circle") ||
        innerHTML.includes("profile")
      ) {
        button.id = "profile-button";
      }
      // Settings button
      else if (
        innerHTML.includes("settings-outline") ||
        innerHTML.includes("gear")
      ) {
        button.id = "settings-button";
      }
      // Burger menu button
      else if (innerHTML.includes("menu")) {
        button.id = "burger-menu";
      }
    });
  };

  return null; // This component doesn't render anything
};

export default ElementTagger;
