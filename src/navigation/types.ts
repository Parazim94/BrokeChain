export type RootStackParamList = {
  Markets: undefined;
  Share: undefined;
  Trade: undefined;
  Discover: undefined;
  Portfolio: undefined;
  Login: undefined;
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