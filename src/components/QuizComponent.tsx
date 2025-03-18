import React, { useState, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import CustomModal from "./CustomModal";
import Button from "./Button";
import { quizData, QuizCategoryKey } from "../data/quizData";
import Card from "./Card";

interface QuizComponentProps {
  onQuizComplete?: (result: { score: number; total: number; category: string; categoryKey: QuizCategoryKey }) => void;
}

const QuizComponent = ({ onQuizComplete }: QuizComponentProps) => {
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizCategoryKey | null>(null);
  const [showResult, setShowResult] = useState(false);
  // Zustände für Feedback
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Neue Funktion zur Ergebnisbewertung
  const getResultFeedback = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { text: "Excellent!", icon: "trophy", color: "#FFD700" };
    if (percentage >= 70) return { text: "Great job!", icon: "star", color: "#4CAF50" };
    if (percentage >= 50) return { text: "Good effort!", icon: "thumbs-up", color: "#2196F3" };
    return { text: "Keep learning!", icon: "book", color: "#FF9800" };
  };

  const handleAnswer = (isCorrect: boolean, index: number) => {
    // Setze ausgewählten Index und Feedback-Zustand
    setSelectedAnswerIndex(index);
    setShowFeedback(true);
    setIsCorrect(isCorrect);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Nach einer kurzen Verzögerung zur nächsten Frage oder zum Ergebnis
    setTimeout(() => {
      if (selectedQuiz && currentQuestion < quizData[selectedQuiz].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswerIndex(null);
        setShowFeedback(false);
      } else {
        setShowResult(true);
      }
    }, 1500); // 1,5 Sekunden Verzögerung
  };

  const startQuiz = (quizType: QuizCategoryKey) => {
    setSelectedQuiz(quizType);
    setScore(0);
    setCurrentQuestion(0);
    setShowResult(false);
    // Zurücksetzen der Feedback-Zustände beim Themenwechsel
    setSelectedAnswerIndex(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setModalVisible(true);
  };

  const resetQuiz = () => {
    if (showResult && selectedQuiz && onQuizComplete) {
      onQuizComplete({
        score,
        total: totalQuestions,
        category: quizData[selectedQuiz].title,
        categoryKey: selectedQuiz
      });
    }
    setModalVisible(false);
    setShowResult(false);
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
  };

  const currentQuestions = selectedQuiz ? quizData[selectedQuiz].questions : [];
  const totalQuestions = currentQuestions.length;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Crypto Quiz</Text>
      <Text style={[styles.score, { color: theme.text }]}>Test your crypto knowledge!</Text>
      
      <View style={styles.themeSelection}>
        <Text style={{ color: theme.text, marginRight: 15 }}>Choose quiz category:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(quizData).map(([key, category]) => (
            <Button
              key={key}
              title={category.title}
              type="primary"
              size="medium"
              icon={category.icon as any}
              iconPosition="left"
              onPress={() => startQuiz(key as QuizCategoryKey)}
              style={{ margin: 8 }}
            />
          ))}
        </View>
      </View>
      
      <CustomModal visible={modalVisible} onClose={resetQuiz}>
        <View style={styles.modalContent}>
          {showResult ? (
            <View style={styles.resultContainer}>
              <Text style={[styles.resultTitle, { color: "white" }]}>
                Quiz Completed!
              </Text>
              
              {/* Ergebnisbewertung */}
              {(() => {
                const feedback = getResultFeedback(score, totalQuestions);
                return (
                  <View style={styles.feedbackContainer}>
                    <Ionicons 
                      name={feedback.icon as any} 
                      size={60} 
                      color={feedback.color} 
                      style={styles.resultIcon}
                    />
                    <Text style={[styles.resultFeedbackText, { color: feedback.color }]}>
                      {feedback.text}
                    </Text>
                  </View>
                );
              })()}
              
              {/* Score mit Prozentanzeige */}
              <Text style={[styles.resultScore, { color: "white" }]}>
                Your Score: {score} of {totalQuestions} ({Math.round((score/totalQuestions)*100)}%)
              </Text>
              
              {/* Fortschrittsbalken */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(score/totalQuestions)*100}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Buttons für Aktionen */}
              <View style={styles.resultButtonsContainer}>
                <Button
                  title="Try Again"
                  type="primary"
                  size="medium"
                  icon="refresh"
                  onPress={() => {
                    if (selectedQuiz) {
                      startQuiz(selectedQuiz);
                    }
                  }}
                  style={{ margin: 8 }}
                />
                <Button
                  title="Choose Another Quiz"
                  type="primary"
                  size="medium"
                  icon="grid"
                  onPress={resetQuiz}
                  style={{ margin: 8 }}
                />
              </View>
            </View>
          ) : selectedQuiz && currentQuestions.length > 0 ? (
            <>
              <Text style={[styles.quizTitle, { color: "white" }]}>
                {quizData[selectedQuiz].title}
              </Text>
              <Text style={[styles.questionCounter, { color: "white" }]}>
                Question {currentQuestion + 1} of {totalQuestions}
              </Text>
              <Text style={[styles.question, { color: "white" }]}>
                {currentQuestions[currentQuestion].question}
              </Text>
              
              {currentQuestions[currentQuestion].answers.map((answer, index) => {
                // Bestimme Button-Stil basierend auf Feedback-Zustand
                const isSelected = selectedAnswerIndex === index && showFeedback;
                
                let buttonType: "primary" | "success" | "danger" | "outline" = "primary";
                if (isSelected) {
                  buttonType = answer.isCorrect ? "success" : "danger";
                } else if (showFeedback && answer.isCorrect) {
                  // Zeige richtige Antwort, wenn Feedback angezeigt wird
                  buttonType = "success";
                }
                
                return (
                  <Button
                    key={index}
                    title={answer.text}
                    type={buttonType}
                    size="medium"
                    disabled={showFeedback} // Deaktiviere während Feedback angezeigt wird
                    onPress={() => handleAnswer(answer.isCorrect, index)}
                    style={[
                      styles.answerButton,
                      isSelected ? styles.selectedAnswer : {}
                    ]}
                    fullWidth
                  />
                );
              })}
              
              {/* Feedback-Text */}
              {showFeedback && (
                <Text style={[
                  styles.feedbackText, 
                  { color: isCorrect ? "#4caf50" : "#ff5252" }
                ]}>
                  {isCorrect ? "Correct! 👍" : "Wrong! 👎"}
                </Text>
              )}
            </>
          ) : (
            <Text style={{ color: theme.text }}>No questions available</Text>
          )}
        </View>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 10
  },
  score: { 
    fontSize: 18, 
    marginBottom: 40
  },
  themeSelection: {
    alignItems: "center",
    marginBottom: 20,
    width: '100%',
  },
  themeButton: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  modalContent: {
    padding: 20,
    alignItems: "center",
    width: '100%',
  },
  quizTitle: {
    fontSize: 24, 
    fontWeight: "bold",
    marginBottom: 10,
  },
  questionCounter: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.7,
  },
  question: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  answerButton: {
    marginVertical: 8,
    width: '100%',
  },
  selectedAnswer: {
    transform: [{ scale: 1.02 }],
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIcon: {
    marginBottom: 10,
  },
  resultFeedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    width: '80%',
    marginVertical: 10,
  },
  progressBackground: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  resultButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default QuizComponent;
