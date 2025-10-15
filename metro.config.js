const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configurações críticas para React.use polyfill
config.resolver = {
  ...config.resolver,
  
  // Alias crítico para React
  alias: {
    ...config.resolver?.alias,
    'react': path.resolve(__dirname, 'node_modules/react'),
    'react-native': path.resolve(__dirname, 'node_modules/react-native'),
  },
  
  // Plataformas suportadas
  platforms: ['ios', 'android', 'native', 'web'],
  
  // Node modules paths
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
  
  // Asset extensions
  assetExts: [...(config.resolver?.assetExts || []), 'bin'],
  
  // Source extensions com prioridade específica
  sourceExts: [
    'expo.ts', 'expo.tsx', 'expo.js', 'expo.jsx',
    'ts', 'tsx', 'js', 'jsx', 'json', 'wasm', 'svg'
  ],
};

// Configurações de transformação
config.transformer = {
  ...config.transformer,
  
  // Minifier options
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    // Preservar React.use durante minificação
    mangle: {
      ...config.transformer?.minifierConfig?.mangle,
      reserved: ['React', 'use', 'useState', 'useEffect', 'useContext']
    }
  },
  
  // Asset plugins
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// Configurações de servidor metro
config.server = {
  ...config.server,
  
  // Resetar cache em desenvolvimento
  resetCache: process.env.NODE_ENV === 'development',
  
  // Configurações de porta
  port: process.env.EXPO_METRO_PORT ? parseInt(process.env.EXPO_METRO_PORT) : 8081,
};

// Configurações de cache otimizadas
config.cacheStores = [
  {
    name: 'filesystem',
    options: {
      rootDir: path.join(__dirname, 'node_modules', '.cache', 'metro'),
    },
  },
];

// Configurações de watcher
config.watcher = {
  ...config.watcher,
  
  // Ignorar arquivos desnecessários
  additionalExts: ['cjs', 'mjs'],
  
  // Healthcheck
  healthCheck: {
    enabled: true,
    filePrefix: '.metro-health-check',
    timeout: 30000,
  },
};

module.exports = config;