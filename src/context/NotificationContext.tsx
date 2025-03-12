import React, { createContext, useState, useContext, ReactNode } from 'react';

interface NotificationContextType {
    aibotNotificationsEnabled: boolean;
    setAibotNotificationsEnabled: (value: boolean) => void;
}

const defaultContext: NotificationContextType = {
    aibotNotificationsEnabled: true,
    setAibotNotificationsEnabled: () => {},
};

export const NotificationContext = createContext<NotificationContextType>(defaultContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [aibotNotificationsEnabled, setAibotNotificationsEnabled] = useState(true);
    return (
        <NotificationContext.Provider value={{ aibotNotificationsEnabled, setAibotNotificationsEnabled }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
