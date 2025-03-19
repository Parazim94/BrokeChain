export type Ticker = {
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
};

export type RootStackParamList = {
  LandingPage: { fromLogo: boolean } | undefined;
  Main: { screen: "Markets" | "Share" | "Trade" | "Discover" | "Portfolio" } | undefined;
  Markets: undefined;
  Share: undefined;
  Trade: { coin: any };
  Discover: undefined;
  Portfolio: undefined;
  Settings: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Verified: undefined;
  NotFound: undefined;
  redirect: { token: string };
  Quiz: undefined; 
  Impressum: undefined;
  PrivacyTermsScreen: undefined;
};

export type StackParamList = {
  Main: { screen: "Markets" | "Share" | "Trade" | "Discover" | "Portfolio" } | undefined;
  Search: undefined;
  Settings: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
};

export {};