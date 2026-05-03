const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .avif support — Metro does not include it by default
config.resolver.assetExts.push('avif');

module.exports = config;
