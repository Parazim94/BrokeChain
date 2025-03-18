import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuizCategoryKey } from "@/src/data/quizData";

// Interface für ein Quiz-Ergebnis
export interface QuizResult {
  score: number;
  total: number;
  category: string;
  categoryKey: QuizCategoryKey;
  date: Date;
}

// Interface für den Context
interface QuizContextType {
  quizResults: QuizResult[];
  addQuizResult: (result: Omit<QuizResult, "date">) => void;
  clearQuizResults: () => void;
}

// Erstellung des Contexts
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Storage-Key für AsyncStorage
const QUIZ_RESULTS_STORAGE_KEY = "quizResults";

// Provider-Komponente
export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // Laden der gespeicherten Ergebnisse beim Start
  useEffect(() => {
    const loadQuizResults = async () => {
      try {
        const storedResults = await AsyncStorage.getItem(QUIZ_RESULTS_STORAGE_KEY);
        if (storedResults) {
          const parsedResults = JSON.parse(storedResults).map((result: any) => ({
            ...result,
            date: new Date(result.date)
          }));
          setQuizResults(parsedResults);
        }
      } catch (error) {
        console.error("Error loading quiz results:", error);
      }
    };

    loadQuizResults();
  }, []);

  // Speichern der Ergebnisse bei Änderungen
  useEffect(() => {
    const saveQuizResults = async () => {
      try {
        await AsyncStorage.setItem(QUIZ_RESULTS_STORAGE_KEY, JSON.stringify(quizResults));
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    };

    if (quizResults.length > 0) {
      saveQuizResults();
    }
  }, [quizResults]);

  // Funktion zum Hinzufügen eines neuen Ergebnisses
  const addQuizResult = (result: Omit<QuizResult, "date">) => {
    const newResult: QuizResult = {
      ...result,
      date: new Date()
    };
    setQuizResults(prev => [newResult, ...prev].slice(0, 20)); // Begrenze auf 20 Ergebnisse
  };

  // Funktion zum Löschen aller Ergebnisse
  const clearQuizResults = async () => {
    setQuizResults([]);
    try {
      await AsyncStorage.removeItem(QUIZ_RESULTS_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing quiz results:", error);
    }
  };

  return (
    <QuizContext.Provider value={{ quizResults, addQuizResult, clearQuizResults }}>
      {children}
    </QuizContext.Provider>
  );
};

// Hook für den einfachen Zugriff auf den Context
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
