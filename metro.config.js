const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
  watchFolders: [],
  resolver: {
    blockList: [
      /node_modules\/.*\/android\/build\/generated\/source\/codegen\/.*/,
    ],
    extraNodeModules: {
      // Add Node.js core module polyfills here
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      fs: require.resolve('react-native-fs'),
      os: require.resolve('os-browserify'),
      stream: require.resolve('stream-browserify'),
      string_decoder: require.resolve('string_decoder'),
      process: require.resolve('process/browser'),
      buffer: require.resolve('buffer'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);
