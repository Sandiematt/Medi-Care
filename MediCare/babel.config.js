module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        alias: {
          path: 'path-browserify',
          crypto: 'crypto-browserify',
          fs: 'react-native-fs',
          os: 'os-browserify',
          stream: 'stream-browserify',
          string_decoder: 'string_decoder',
          process: 'process/browser',
          buffer: 'buffer',
        },
      },
    ],
    [
      "module:react-native-dotenv",
      {
        "moduleName": "@env",
        "path": ".env",
        "safe": false,
        "allowUndefined": true
      }
    ],
  ],
};
