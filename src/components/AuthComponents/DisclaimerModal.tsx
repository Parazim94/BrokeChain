import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { createStyles } from "../../styles/style";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/UiComponents/Button";

interface DisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function DisclaimerModal({ visible, onAccept, onDecline }: DisclaimerModalProps) {
  const styles = createStyles();
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onDecline}
    >
      <View style={modalStyles.centeredView}>
        <View style={[modalStyles.modalView, { backgroundColor: styles.body.backgroundColor }]}>
          <View style={modalStyles.header}>
            <Text style={[modalStyles.title, { color: styles.defaultText.color }]}>
              Terms of Use & Disclaimer
            </Text>
            <TouchableOpacity onPress={onDecline} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color={styles.defaultText.color} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={modalStyles.contentContainer}>
            <Text style={[modalStyles.sectionTitle, { color: styles.defaultText.color }]}>
              Demo Trading Account
            </Text>
            <Text style={[modalStyles.text, { color: styles.defaultText.color }]}>
              This is a demo trading account. All displayed values, holdings, and transactions are virtual data and do not represent real money or actual assets.
            </Text>
            
            <Text style={[modalStyles.sectionTitle, { color: styles.defaultText.color }]}>
              Educational and Demonstration Purposes
            </Text>
            <Text style={[modalStyles.text, { color: styles.defaultText.color }]}>
              The platform is for educational and demonstration purposes only. All market data, prices, and information should not be understood as financial advice or investment recommendations.
            </Text>
            
            <Text style={[modalStyles.sectionTitle, { color: styles.defaultText.color }]}>
              Disclaimer of Liability
            </Text>
            <Text style={[modalStyles.text, { color: styles.defaultText.color }]}>
              The operator of this platform assumes no liability for decisions made based on the information provided here. Use is at your own risk.
            </Text>
            
            <Text style={[modalStyles.text, { color: styles.defaultText.color }]}>
              By using this platform, you confirm that you understand this is a demo account and that you cannot make any legal claims against the operator.
            </Text>
          </ScrollView>
          
          <View style={modalStyles.buttonsContainer}>
            <Button 
              onPress={onDecline} 
              title="Decline" 
              type="danger" 
              style={modalStyles.button} 
              size="small"
            />
            <Button 
              onPress={onAccept} 
              title="Accept" 
              type="success" 
              style={modalStyles.button}
              size="small"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalView: {
    width: Platform.OS === "web" ? "80%" : "100%",
    maxWidth: 500,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc5",
    paddingBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  contentContainer: {
    maxHeight: 400,
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    margin: 5,
  }
});
