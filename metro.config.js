/**
 * Metro Configuration - AiLun Saúde v2.1.0
 * Configuração simplificada e estável para produção
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Configurações específicas do Expo
  isCSSEnabled: true,
});

// Resolver configuração básica
config.resolver = {
  ...config.resolver,
  
  // Alias para módulos críticos
  alias: {
    'react': path.resolve(__dirname, 'node_modules/react'),
    'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    '@components': path.resolve(__dirname, 'components'),
    '@services': path.resolve(__dirname, 'services'),
    '@hooks': path.resolve(__dirname, 'hooks'),
    '@utils': path.resolve(__dirname, 'utils'),
    '@constants': path.resolve(__dirname, 'constants'),
    '@contexts': path.resolve(__dirname, 'contexts'),
    '@types': path.resolve(__dirname, 'types'),
  },
  
  // Plataformas suportadas
  platforms: ['ios', 'android', 'native', 'web'],
  
  // Source extensions com prioridade correta
  sourceExts: [
    'expo.ts', 'expo.tsx', 'expo.js', 'expo.jsx',
    'ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs'
  ],
  
  // Asset extensions
  assetExts: [
    ...config.resolver.assetExts,
    'bin', 'txt', 'jpg', 'png', 'gif', 'webp', 'bmp', 'psd',
    'svg', 'pdf', 'mp4', 'webm', 'wav', 'mp3', 'm4a', 'aac', 'oga',
    'ttf', 'otf', 'woff', 'woff2', 'eot'
  ],
};

// Transformer básico
config.transformer = {
  ...config.transformer,
  
  // Configurações de minificação
  minifierConfig: {
    // Preservar nomes críticos
    mangle: {
      reserved: [
        'React', 'use', 'useState', 'useEffect', 'useContext', 
        'NavigationContainer', 'Stack', 'Screen'
      ],
      keep_fnames: true,
    },
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true,
    },
  },
  
  // Asset plugins
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  
  // Configurações de transformação
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Serializer básico
config.serializer = {
  ...config.serializer,
  
  // Filtrar módulos de teste em produção
  processModuleFilter: (module) => {
    if (process.env.NODE_ENV === 'production') {
      return !/\.test\.(ts|tsx|js|jsx)$/.test(module.path) &&
             !/\.spec\.(ts|tsx|js|jsx)$/.test(module.path) &&
             !/\/__tests__\//.test(module.path);
    }
    return true;
  },
};

// Cache otimizado
if (process.env.NODE_ENV === 'production') {
  config.resetCache = false;
} else {
  config.resetCache = true;
}

module.exports = config;