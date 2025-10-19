// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for additional asset types
config.resolver.assetExts.push(
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'bmp',
  'svg',
  // Fonts
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Audio/Video
  'mp3',
  'mp4',
  'wav',
  'm4a'
);

// Exclude certain modules to reduce bundle size
config.resolver.blockList = [
  /node_modules\/react-native\/Libraries\/Renderer\/implementations\/ReactNativeRenderer-dev\.js/,
  /node_modules\/react-native\/Libraries\/Renderer\/implementations\/ReactNativeRenderer-profiling\.js/
];

module.exports = config;
