import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { AuthContext } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAlert } from "./AlertContext"; 
import { useFetch, fetchPost } from "../hooks/useFetch";

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

  getHistoricalData: (symbol: string, interval: string, limit?: number) => Promise<any[]>;
  getHistoricalCandleData: (symbol: string, interval: string, limit?: number) => Promise<any[]>;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, setUser } = useContext(AuthContext);
  const { showAlert } = useAlert(); // Hook für Custom Alerts

  // Zentrale Marktdaten via useFetch
  const {
    data: marketData,
    loading: loadingMarketData,
    error: errorMarketData,
    refetch: refreshMarketData,
  } = useFetch<MarketData[]>("marketData", {
    autoRefetch: true,
    refetchInterval: 30000,
    expectJson: true,
  });

  // Neuer State für Fallback-MarketData
  const [fallbackMarketData, setFallbackMarketData] = React.useState<MarketData[]>([]);

  // Speichere aktuelle Marktdaten in AsyncStorage als Cache
  React.useEffect(() => {
    if (Array.isArray(marketData) && marketData.length > 0) {
      AsyncStorage.setItem('marketDataCache', JSON.stringify(marketData));
    }
  }, [marketData]);

  // Lade gecachte Marktdaten, falls Fetch fehlschlägt oder keine Daten liefert
  React.useEffect(() => {
    const loadCachedData = async () => {
      if ((!marketData || !Array.isArray(marketData) || marketData.length === 0) && errorMarketData) {
        const cached = await AsyncStorage.getItem('marketDataCache');
        if (cached) {
          setFallbackMarketData(JSON.parse(cached));
        }
      }
    };
    loadCachedData();
  }, [errorMarketData, marketData]);

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
    positionsEndpoint || "",
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
  const executeTrade = 
    async (trade: Trade, mode: "spot" | "order" = "spot") => {
      try {
        // Versuche zuerst den Token aus dem Kontext zu bekommen
        let token = user?.token;
        
        // Falls kein Token im Kontext, versuche ihn aus dem AsyncStorage zu laden
        if (!token) {
          try {
            token = await AsyncStorage.getItem('userToken');
            if (!token) {
              throw new Error("User not logged in - no token found");
            }
            console.log("Token loaded from AsyncStorage:", token.substring(0, 15) + "...");
          } catch (error) {
            console.error("Error loading token:", error);
            throw new Error("Error loading auth token");
          }
        } else {
          console.log("Using token from context:", token.substring(0, 15) + "...");
        }
        
        // Füge den Token hinzu, falls er nicht bereits im Payload ist
        const payload = { ...trade, token };
        
        // Verwende die richtige Route basierend auf dem Modus
        const endpoint = mode === "order" ? "trade/order" : "trade";
        const result = await fetchPost(endpoint, payload);
        console.log("payload:", payload);
        console.log("endpoint:", endpoint);
        console.log("trade:", trade);
        
                

        // Logge die Serverantwort nach jedem Trade
        console.log("Server response after trade:", result);

        // Benutzeraktualisierung
        if (result) {
          console.log("Trade successful, updating user");
          setUser(result);
          
          // Erst nach dem Setzen des Benutzers versuchen, Positionen neu zu laden
          if (result.token) {
            console.log("Reloading positions with new token");
            await new Promise(resolve => setTimeout(resolve, 500)); // Kurze Verzögerung
            await refreshPositions();
          } else {
            console.warn("No token found in response!");
          }
        }
        
        return result;
      } catch (error) {
        console.error(`Error in ${mode}-trade:`, error);
        
        // Zeige den Fehler als modalen Dialog an
        showAlert({
          type: "error",
          title: `${mode === "order" ? "Order" : "Trade"} Error`,
          message: error instanceof Error ? error.message : "Unexpected error during trade execution"
        });
        
        throw error;
      }
    }
   

  // Historische Daten – erstmal von Binance, mit Fallback auf Marktdaten
  const getHistoricalData = useCallback(
    async (symbol: string, interval: string, limit?: number) => {
      try {
        const adjustedInterval = interval.endsWith("s") ? "1s" : interval;
        const limitVal = limit || 100;
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${adjustedInterval}&limit=${limitVal}`;
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

  const getHistoricalCandleData = useCallback(
    async (symbol: string, interval: string, limit?: number) => {
      try {
        const adjustedInterval = interval.endsWith("s") ? "1s" : interval;
        const limitVal = limit || 100;
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${adjustedInterval}&limit=${limitVal}`;
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
    marketData: Array.isArray(marketData) && marketData.length > 0 ? marketData : fallbackMarketData,
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
