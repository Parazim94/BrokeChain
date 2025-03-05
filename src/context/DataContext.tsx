import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useEffect,
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
  value?: number;
  token?: string;
  amount?: number;
  threshold?: number;
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

  executeTrade: (trade: Trade, mode?: "spot" | "order") => Promise<any>;

  getHistoricalData: (symbol: string, interval: string) => Promise<any[]>;
  getHistoricalCandleData: (symbol: string, interval: string) => Promise<any[]>;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, setUser } = useContext(AuthContext);

  // Zentrale Marktdaten via useFetch
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

  // Sicherstellen, dass wir nur einen gültigen Token für die Positionsabfrage verwenden
  const positionsEndpoint = React.useMemo(() => {
    if (user?.token) {
      console.log("Erstelle Positions-Endpoint mit Token:", user.token.substring(0, 10) + "...");
      return `positions?token=${user.token}`;
    }
    console.log("Kein Token vorhanden für Positions-Abfrage");
    return null; 
  }, [user?.token]);

  // Positionen nur abfragen, wenn ein Endpunkt existiert
  const {
    data: rawPositions,
    loading: loadingPositions,
    error: errorPositions,
    refetch: refreshPositions,
  } = useFetch<Record<string, number>>(
    positionsEndpoint || "", // leerer String wird in useFetch abgefangen
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

  // Aktualisierte executeTrade Funktion mit verbessertem Error-Handling
  const executeTrade = useCallback(
    async (trade: Trade, mode: "spot" | "order" = "spot") => {
      try {
        // Versuche zuerst den Token aus dem Kontext zu bekommen
        let token = user?.token;
        
        // Falls kein Token im Kontext, versuche ihn aus dem AsyncStorage zu laden
        if (!token) {
          try {
            token = await AsyncStorage.getItem('userToken');
            if (!token) {
              throw new Error("Benutzer ist nicht angemeldet - kein Token gefunden");
            }
            console.log("Token aus AsyncStorage geladen:", token.substring(0, 15) + "...");
          } catch (error) {
            console.error("Fehler beim Laden des Tokens:", error);
            throw new Error("Fehler beim Laden des Auth-Tokens");
          }
        } else {
          console.log("Token aus Context verwendet:", token.substring(0, 15) + "...");
        }
        
        // Füge den Token hinzu, falls er nicht bereits im Payload ist
        const payload = { ...trade, token };
        
        // Verwende die richtige Route basierend auf dem Modus
        const endpoint = mode === "order" ? "trade/order" : "trade";
        const result = await fetchPost(endpoint, payload);
        
        // Benutzeraktualisierung
        if (result) {
          console.log("Trade erfolgreich, aktualisiere Benutzer");
          setUser(result);
          
          // Erst nach dem Setzen des Benutzers versuchen, Positionen neu zu laden
          if (result.token) {
            console.log("Lade Positionen neu mit neuem Token");
            await new Promise(resolve => setTimeout(resolve, 500)); // Kurze Verzögerung
            await refreshPositions();
          } else {
            console.warn("Kein Token in der Antwort gefunden!");
          }
        }
        
        return result;
      } catch (error) {
        console.error(`Fehler bei ${mode}-Trade:`, error);
        throw error;
      }
    },
    [user, refreshPositions, setUser]
  );

  // Historische Daten – erstmal von Binance, mit Fallback auf Marktdaten
  const getHistoricalData = useCallback(
    async (symbol: string, interval: string) => {
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`;
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

  // Historische Candlestick Daten abrufen
  const getHistoricalCandleData = useCallback(
    async (symbol: string, interval: string) => {
      try {
        // Erhöhe das Limit z.B. auf 1000, damit mehr Daten vorhanden sind
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=300`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Binance Fehler: ${response.status}`);
        const data = await response.json();
        return data.map((item: any[]) => ({
          timestamp: item[0],
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5]),
        }));
      } catch (error) {
        console.error("Historische Candlestick data fehlgeschlagen:", error);
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
    getHistoricalCandleData,
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
