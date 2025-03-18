import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";
import { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { createStyles } from "@/src/styles/style";
import QuizComponent from "../../components/QuizComponent";
import Card from "@/src/components/Card";
import { QuizCategoryKey } from "@/src/data/quizData";

interface QuizResult {
  score: number;
  total: number;
  category: string;
  categoryKey: QuizCategoryKey;
  date: Date;
}

export default function QuizScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // Callback-Funktion, um Ergebnisse vom Quiz zu erhalten
  const handleQuizComplete = (result: { 
    score: number; 
    total: number; 
    category: string;
    categoryKey: QuizCategoryKey;
  }) => {
    const newResult: QuizResult = {
      ...result,
      date: new Date()
    };
    
    // Neue Ergebnisse an den Anfang der Liste setzen
    setQuizResults(prevResults => [newResult, ...prevResults].slice(0, 5));
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return { name: 'trophy', color: '#FFD700' };
    if (percentage >= 60) return { name: 'star', color: '#4CAF50' };
    if (percentage >= 40) return { name: 'thumbs-up', color: '#2196F3' };
    return { name: 'school', color: '#FF9800' };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[headerStyles.header, { backgroundColor: theme.background, borderBottomColor: theme.accent }]}>
        <Text style={[headerStyles.title, { color: theme.text }]}>Quiz</Text>
      </View>
      <ScrollView contentContainerStyle={pageStyles.content}>
        {/* Results History */}
        {quizResults.length > 0 && (
          <View style={pageStyles.resultsSection}>
            <Text style={[pageStyles.sectionTitle, { color: theme.text }]}>
              Your Recent Results
            </Text>
            {quizResults.map((result, index) => {
              const percentage = Math.round((result.score / result.total) * 100);
              const performance = getPerformanceIcon(percentage);
              return (
                <Card key={index} style={pageStyles.resultCard}>
                  <View style={pageStyles.resultCardHeader}>
                    <View style={pageStyles.resultCategoryContainer}>
                      <Ionicons name={performance.name as any} size={24} color={performance.color} />
                      <Text style={[pageStyles.resultCategory, { color: theme.text }]}>
                        {result.category}
                      </Text>
                    </View>
                    <Text style={pageStyles.resultDate}>
                      {formatDate(result.date)}
                    </Text>
                  </View>
                  <Text style={[pageStyles.resultScore, { color: theme.text }]}>
                    Score: {result.score} of {result.total} ({percentage}%)
                  </Text>
                  {/* Progress bar */}
                  <View style={pageStyles.progressContainer}>
                    <View style={pageStyles.progressBackground}>
                      <View 
                        style={[
                          pageStyles.progressFill, 
                          { width: `${percentage}%`, backgroundColor: performance.color }
                        ]}
                      />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
        {/* Quiz Component */}
        <QuizComponent onQuizComplete={handleQuizComplete} />
      </ScrollView>
    </SafeAreaView>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

const pageStyles = StyleSheet.create({
  content: {
    padding: 16,
  },
  resultsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultCard: {
    marginBottom: 12,
    padding: 16,
  },
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  resultScore: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    marginTop: 4,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  }
});
