const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .avif support — Metro does not include it by default
config.resolver.assetExts.push('avif');

// Remove deprecated watcher option injected by Expo's default config.
// Metro renamed unstable_workerThreads → workerThreads; suppress the warning.
if (config.watcher?.unstable_workerThreads !== undefined) {
  const { unstable_workerThreads, ...rest } = config.watcher;
  config.watcher = rest;
}

module.exports = config;
