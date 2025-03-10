const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Add the root directory to the watchFolders
  config.watchFolders = [
    path.resolve(__dirname, '.'),
  ];

  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    "react-native-linear-gradient": require.resolve("expo-linear-gradient"),
    'react-native-dotenv': path.resolve(__dirname, 'node_modules/react-native-dotenv'),
  };
  
  return config;
})();
