import React, { useEffect, useState, useRef } from "react";
import ChatbotButton from "./ChatbotButton";
import ChatModal from "./ChatModal";
import ChatbotNotification from "./ChatbotNotification";

const Chatbot: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const initialTimerCompleted = useRef(false);
  const buttonSize = { width: 60, height: 60 };

  const handleOpenChat = () => {
    setModalVisible(true);
    setNotificationVisible(false);
  };

  const handleCloseChat = () => {
    setModalVisible(false);
  };

  // Notification timing logic
  useEffect(() => {
    // Initial notification after 10 seconds
    const initialTimer = setTimeout(() => {
      if (!modalVisible) {
        setNotificationVisible(true);
        initialTimerCompleted.current = true;
      }
    }, 10000);

    // Recurring notification every minute after the initial one
    let recurringTimer: NodeJS.Timeout;

    if (initialTimerCompleted.current) {
      recurringTimer = setInterval(() => {
        if (!modalVisible) {
          setNotificationVisible(true);

          // Hide notification after 10 seconds
          setTimeout(() => {
            setNotificationVisible(false);
          }, 10000);
        }
      }, 60000); // 1 minute
    }

    return () => {
      clearTimeout(initialTimer);
      if (recurringTimer) clearInterval(recurringTimer);
    };
  }, [modalVisible, initialTimerCompleted.current]);

  // Handle button position updates for the speech bubble placement
  const handleButtonPositionChange = (position: { x: number; y: number }) => {
    setButtonPosition(position);
  };

  return (
    <>
      <ChatbotButton
        onPress={handleOpenChat}
        onPositionChange={handleButtonPositionChange}
      />
      <ChatbotNotification
        buttonPosition={buttonPosition}
        buttonSize={buttonSize}
        visible={notificationVisible}
      />
      <ChatModal visible={modalVisible} onClose={handleCloseChat} />
    </>
  );
};

export default Chatbot;
