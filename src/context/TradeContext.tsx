import React, { createContext, useState, useContext } from "react";

interface TradeContextType {
  selectedCoin: any;
  setSelectedCoin: (coin: any) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  return (
    <TradeContext.Provider value={{ selectedCoin, setSelectedCoin }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (!context) throw new Error("useTrade must be used within a TradeProvider");
  return context;
};
