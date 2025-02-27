import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { useFetch, fetchPost } from "../hooks/useFetch";
import { AuthContext } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MarketData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  image: string;
  sparkline: { price: number[] };
}

export interface Position {
  coinId: string;
  amount: number;
  marketInfo?: MarketData;
}

export interface Trade {
  symbol: string;
  value: number;
}

interface DataContextType {
  marketData: MarketData[];
  loadingMarketData: boolean;
  errorMarketData: Error | null;
  refreshMarketData: () => Promise<any>;

  positions: Position[];
  loadingPositions: boolean;
  errorPositions: Error | null;
  refreshPositions: () => Promise<any>;

  executeTrade: (trade: Trade) => Promise<any>;

  getHistoricalData: (symbol: string, interval: string) => Promise<any[]>;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, setUser } = useContext(AuthContext); // Erweiterung: Wir holen setUser

  // Zentrale Marktdaten via useFetch – hier rufen wir alle Daten (inkl. Bilder & Sparkline) von unserem Backend ab
  const {
    data: marketData,
    loading: loadingMarketData,
    error: errorMarketData,
    refetch: refreshMarketData,
  } = useFetch<MarketData[]>("marketData", {
    autoRefetch: true,
    refetchInterval: 300000,
    expectJson: true,
  });

  // Positionen, abhängig vom Token
  const {
    data: rawPositions,
    loading: loadingPositions,
    error: errorPositions,
    refetch: refreshPositions,
  } = useFetch<Record<string, number>>(
    user?.token ? `positions?token=${user.token}` : "",
    { expectJson: true }
  );

  // Umwandlung in Positionen-Array
  const positions = React.useMemo(() => {
    if (!rawPositions || !Array.isArray(marketData)) return [];
    return Object.entries(rawPositions).map(([coinId, amt]) => {
      const normalized = coinId.toLowerCase().replace(/usdt$/, "");
      const marketInfo = marketData.find(
        (m) => m.symbol.toLowerCase() === normalized
      );
      return { coinId, amount: Number(amt), marketInfo };
    });
  }, [rawPositions, marketData]);

  // Trade-Funktion
  const executeTrade = useCallback(
    async (trade: Trade) => {
      // Versuche zuerst den Token aus dem Kontext zu bekommen
      let token = user?.token;
      
      // Falls kein Token im Kontext, versuche ihn aus dem AsyncStorage zu laden
      if (!token) {
        try {
          token = await AsyncStorage.getItem('userToken');
          console.log("Token aus AsyncStorage geladen:", token ? token.substring(0, 15) + "..." : "nicht gefunden");
        } catch (error) {
          console.error("Fehler beim Laden des Tokens:", error);
        }
      } else {
        console.log("Token aus Context verwendet:", token.substring(0, 15) + "...");
      }

      if (!token) throw new Error("Benutzer ist nicht angemeldet");
      
      const payload = { ...trade, token };
      const result = await fetchPost("trade", payload);
      
      // Neue Zeile: Aktualisierung des Users (State & AsyncStorage) anhand des Ergebnisses
      if(result.user) {
        setUser(result.user);
      }
      
      // Nach erfolgreichem Trade werden Positionen neu geladen:
      await refreshPositions();
      return result;
    },
    [user, refreshPositions, setUser]
  );

  // Historische Daten – erstmal von Binance, mit Fallback auf Marktdaten
  const getHistoricalData = useCallback(
    async (symbol: string, interval: string) => {
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Binance Fehler: ${response.status}`);
        const data = await response.json();
        return data.map((item: any[]) => ({
          label: new Date(item[0]).toISOString(),
          value: parseFloat(item[4]),
        }));
      } catch (error) {
        console.error("Historische Daten von Binance fehlgeschlagen:", error);
        return [];
      }
    },
    []
  );

  const value: DataContextType = {
    marketData: Array.isArray(marketData) ? marketData : [],
    loadingMarketData,
    errorMarketData,
    refreshMarketData,

    positions,
    loadingPositions,
    errorPositions,
    refreshPositions,

    executeTrade,
    getHistoricalData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context)
    throw new Error(
      "useData muss innerhalb eines DataProviders verwendet werden"
    );
  return context;
};
