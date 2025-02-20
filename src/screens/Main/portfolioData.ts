export interface PortfolioItem {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: number;
  profit: string;
  category: string;
}

// Dummy-Daten für das Portfolio
export const portfolioData: PortfolioItem[] = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    amount: "0.5 BTC",
    value: 25000,
    profit: "+5.4%",
    category: "Coins",
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    amount: "2 ETH",
    value: 3400,
    profit: "-2.1%",
    category: "Coins",
  },
  {
    id: "3",
    name: "Solana",
    symbol: "SOL",
    amount: "10 SOL",
    value: 1000,
    profit: "+8.7%",
    category: "Coins",
  },
  {
    id: "4",
    name: "DogeCoin",
    symbol: "DOGE",
    amount: "5000 DOGE",
    value: 200,
    profit: "+3.2%",
    category: "Meme",
  },
  {
    id: "5",
    name: "Bored Ape NFT",
    symbol: "BAYC",
    amount: "1 NFT",
    value: 50000,
    profit: "-1.4%",
    category: "NFT",
  },
];

// Kategorien für Coins
export const coinCategories = ["Coins", "Meme", "NFT"];

// Filteroptionen für die Navigation
export const filterOptions = [
  "Holding",
  "Hot",
  "New Listing",
  "Favorite",
  "Top Gainer",
];
