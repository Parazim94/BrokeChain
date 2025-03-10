module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module:react-native-dotenv", {
        "envName": "", // Leerer String, damit keine umgebungsspezifischen Dateien gesucht werden
        "moduleName": "@env",
        "path": "./src/.env",
        "safe": false,
        "allowUndefined": true,
        "verbose": false, // Verbose wieder deaktivieren
      }],
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
      "react-native-reanimated/plugin",
    ],
  };
};
