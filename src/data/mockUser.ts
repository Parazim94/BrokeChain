export const mockUser = {
  userName: "Max Mustermann",
  email: "max@example.com",
  password: "plain-text", // nur zu Demonstrationszwecken
  age: 30,
  isVerified: true,
  hashedPW: "abcdef123456",
  cash: 14200,
  history: [12000, 12500, 12300, 12750, 13000, 12900, 13150, 13500, 13200, 13350, 13800, 14000, 13750, 14211], // 14 Tage Daten
  positions: [
    { coinId: "Bitcoin", amount: 0.14512 },
    { coinId: "Ethereum", amount: 0.542 },
    { coinId: "XRP", amount: 100 },
    
  ],
  favorites: ["bitcoin", "ethereum"],
  token: "sample.token.123"
};
