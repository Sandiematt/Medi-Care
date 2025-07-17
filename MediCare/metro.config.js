const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
  watchFolders: [],
  resolver: {
    blockList: [
      /node_modules\/.*\/android\/build\/generated\/source\/codegen\/.*/,
    ],
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);
