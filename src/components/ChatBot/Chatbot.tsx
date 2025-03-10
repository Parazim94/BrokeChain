import React, { useState } from "react";
import ChatbotButton from "./ChatbotButton";
import ChatModal from "./ChatModal";

const Chatbot: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenChat = () => {
    setModalVisible(true);
  };

  const handleCloseChat = () => {
    setModalVisible(false);
  };

  return (
    <>
      <ChatbotButton onPress={handleOpenChat} />
      <ChatModal visible={modalVisible} onClose={handleCloseChat} />
    </>
  );
};

export default Chatbot;
