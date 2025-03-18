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
    try {
      // Clear any existing ids to prevent confusion
      const existingProfile = document.getElementById("profile-button");
      const existingSettings = document.getElementById("settings-button");
      if (existingProfile) existingProfile.removeAttribute("id");
      if (existingSettings) existingSettings.removeAttribute("id");

      // Get header right section that contains the buttons
      const headerRightSection = document.querySelector(
        "header .r-flexDirection-row:last-child"
      );

      if (headerRightSection) {
        // The buttons are in order: profile, then settings
        const buttons = headerRightSection.querySelectorAll("button");

        if (buttons.length >= 2) {
          // Find profile button (person-circle icon)
          for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const innerHTML = button.innerHTML.toLowerCase();

            if (innerHTML.includes("person-circle")) {
              button.id = "profile-button";
              break;
            }
          }

          // Find settings button (settings-outline icon)
          for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const innerHTML = button.innerHTML.toLowerCase();

            if (innerHTML.includes("settings-outline")) {
              button.id = "settings-button";
              break;
            }
          }
        }
      }

      // Fallback to last two buttons if specific icons not found
      if (
        !document.getElementById("profile-button") ||
        !document.getElementById("settings-button")
      ) {
        const allHeaderButtons = document.querySelectorAll("header button");

        if (allHeaderButtons.length >= 2) {
          // Usually profile is second-to-last button
          const profileIndex = allHeaderButtons.length - 2;
          // Settings is last button
          const settingsIndex = allHeaderButtons.length - 1;

          allHeaderButtons[profileIndex].id = "profile-button";
          allHeaderButtons[settingsIndex].id = "settings-button";
        }
      }
    } catch (error) {
      console.error("Error tagging header elements:", error);
    }
  };

  return null; // This component doesn't render anything
};

export default ElementTagger;
