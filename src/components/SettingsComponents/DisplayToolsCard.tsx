import React from "react";
import { View, Text, Switch, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/UiComponents/Button";
import Card from "@/src/components/UiComponents/Card";

interface DisplayToolsCardProps {
  displayTools: {
    chatAi: boolean;
    tutorial: boolean;
    quiz: boolean;
  };
  toggleChatAi: () => void;
  toggleTutorial: () => void;
  toggleQuiz: () => void;
  handleDisplayToolsUpdate: () => Promise<void>;
  isUpdatingDisplayTools: boolean;
  theme: any;
  styles: any;
  defaultText: any;
}

export default function DisplayToolsCard({
  displayTools,
  toggleChatAi,
  toggleTutorial,
  toggleQuiz,
  handleDisplayToolsUpdate,
  isUpdatingDisplayTools,
  theme,
  styles,
  defaultText,
}: DisplayToolsCardProps) {
  const isAndroid = Platform.OS === "android";
  
  return (
    <Card style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="options" size={22} color={theme.accent} />
        <Text style={[defaultText, { backgroundColor: "transparent" }, styles.sectionTitle]}>
          Display Tools
        </Text>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.row}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
            Show Chat AI
          </Text>
          <View style={styles.control}>
            <Switch
              value={displayTools.chatAi}
              onValueChange={toggleChatAi}
              trackColor={{ false: "#767577", true: theme.accent }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>
        
        {!isAndroid && (
          <View style={styles.row}>
            <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
              Show Tutorial
            </Text>
            <View style={styles.control}>
              <Switch
                value={displayTools.tutorial}
                onValueChange={toggleTutorial}
                trackColor={{ false: "#767577", true: theme.accent }}
                thumbColor="#f4f3f4"
              />
            </View>
          </View>
        )}
        
        <View style={styles.row}>
          <Text style={[defaultText, { backgroundColor: "transparent" }, styles.label]}>
            Show Quiz
          </Text>
          <View style={styles.control}>
            <Switch
              value={displayTools.quiz}
              onValueChange={toggleQuiz}
              trackColor={{ false: "#767577", true: theme.accent }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>
        
        <View style={styles.buttonRow}>
          <Button
            onPress={handleDisplayToolsUpdate}
            title="Update Display Settings"
            loading={isUpdatingDisplayTools}
            type="primary"
            size="small"
            icon="options"
            iconPosition="left"
          />
        </View>
      </View>
    </Card>
  );
}
