const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");
const { fileURLToPath } = require("url");

// FIX for Windows + ESM issues
const projectRoot = path.resolve(process.cwd());

const config = getDefaultConfig(projectRoot);

config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);

config.resolver.sourceExts.push("svg");

module.exports = config;
