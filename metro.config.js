const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    "react-native-linear-gradient": require.resolve("expo-linear-gradient"),
  };
  return config;
})();
