import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TutorialContextType {
  isTutorialActive: boolean;
  startTutorial: () => void;
  endTutorial: () => void;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;
}

const TutorialContext = createContext<TutorialContextType>({
  isTutorialActive: false,
  startTutorial: () => {},
  endTutorial: () => {},
  hasSeenTutorial: false,
  setHasSeenTutorial: () => {},
});

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Check if user has seen tutorial before
  useEffect(() => {
    const checkTutorialSeen = async () => {
      try {
        const seen = await AsyncStorage.getItem("hasSeenTutorial");
        setHasSeenTutorial(seen === "true");
      } catch (error) {
        console.error("Error checking tutorial status", error);
      }
    };

    checkTutorialSeen();
  }, []);

  const startTutorial = () => {
    setIsTutorialActive(true);
  };

  const endTutorial = async () => {
    setIsTutorialActive(false);
    try {
      await AsyncStorage.setItem("hasSeenTutorial", "true");
      setHasSeenTutorial(true);
    } catch (error) {
      console.error("Error saving tutorial status", error);
    }
  };

  return (
    <TutorialContext.Provider
      value={{
        isTutorialActive,
        startTutorial,
        endTutorial,
        hasSeenTutorial,
        setHasSeenTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};
