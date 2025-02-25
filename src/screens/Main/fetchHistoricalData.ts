const BASE_URL = "https://api.binance.com/api/v3/klines";

/**
 * Ruft historische Daten von Binance für ein bestimmtes Symbol und Intervall ab.
 * @param symbol  z.B. "BTCUSDT"
 * @param interval z.B. "1h", "4h", "1d", "3d", "1w", "1M"
 * @returns Array von Objekten im Format [{ label: string, value: number }]
 */
export async function fetchHistoricalData(symbol: string, interval: string) {
  try {
    // limit=500 → Bis zu 500 Candles
    const response = await fetch(
      `${BASE_URL}?symbol=${symbol}&interval=${interval}&limit=500`
    );
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Ungültige Antwort von Binance API");
    }

    console.log("📊 Binance API Response (erste 5):", data.slice(0, 5)); // Debugging

    // Binance-Kerzen enthalten:
    // entry[0] = Öffnungszeit (Timestamp)
    // entry[4] = Schlusskurs (Close Price)
    return data.map((entry) => ({
      label: new Date(entry[0]).toLocaleDateString("de-DE"), // Datum
      value: parseFloat(entry[4]), // Schlusskurs
    }));
  } catch (error) {
    console.error("Fehler beim Abrufen der historischen Daten:", error);
    return [];
  }
}
