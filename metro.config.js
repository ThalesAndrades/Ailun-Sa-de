/**
 * Metro Configuration - AiLun Saúde
 * Configuração otimizada para produção Apple Store
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Configurações específicas do Expo
  isCSSEnabled: true,
});

// Resolver configuração otimizada
config.resolver = {
  ...config.resolver,
  
  // Alias para módulos críticos
  alias: {
    ...config.resolver?.alias,
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
  
  // Node modules paths otimizados
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, '../node_modules'), // Para monorepos
  ],
  
  // Extensões de assets
  assetExts: [
    ...config.resolver.assetExts,
    'bin', 'txt', 'jpg', 'png', 'gif', 'webp', 'bmp', 'psd',
    'svg', 'pdf', 'mp4', 'webm', 'wav', 'mp3', 'm4a', 'aac', 'oga',
    'ttf', 'otf', 'woff', 'woff2', 'eot',
    'zip', 'csv', 'db'
  ],
  
  // Source extensions com prioridade correta
  sourceExts: [
    'expo.ts', 'expo.tsx', 'expo.js', 'expo.jsx',
    'ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs',
    'web.ts', 'web.tsx', 'web.js', 'web.jsx',
    'ios.ts', 'ios.tsx', 'ios.js', 'ios.jsx',
    'android.ts', 'android.tsx', 'android.js', 'android.jsx',
    'native.ts', 'native.tsx', 'native.js', 'native.jsx'
  ],
  
  // Bloquear resolução de módulos problemáticos
  blockList: [
    /\.git\/.*/,
    /node_modules\/.*\/node_modules\/.*/,
  ],
};

// Transformer otimizado para produção
config.transformer = {
  ...config.transformer,
  
  // Configurações de minificação
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    // Preservar nomes críticos
    mangle: {
      ...config.transformer?.minifierConfig?.mangle,
      reserved: [
        'React', 'use', 'useState', 'useEffect', 'useContext', 
        'useCallback', 'useMemo', 'useRef', 'useReducer',
        'NavigationContainer', 'Stack', 'Screen'
      ],
      keep_fnames: true, // Manter nomes de função para debug
    },
    // Configurações de otimização
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.debug'],
    },
  },
  
  // Asset plugins
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  
  // Configurações de transformação
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // Otimização para produção
    },
  }),
  
  // Unstable allow require cycles para compatibilidade
  unstable_allowRequireContext: true,
};

// Serializer otimizado
config.serializer = {
  ...config.serializer,
  
  // Configurações de chunk
  createModuleIdFactory: () => {
    let nextId = 0;
    return () => ++nextId; // IDs sequenciais para melhor caching
  },
  
  // Otimizações de bundle
  getModulesRunBeforeMainModule: () => [
    require.resolve('react-native/Libraries/Core/InitializeCore'),
  ],
  
  // Processamento customizado de módulos
  processModuleFilter: (module) => {
    // Filtrar módulos de teste em produção
    if (process.env.NODE_ENV === 'production') {
      return !/\.test\.(ts|tsx|js|jsx)$/.test(module.path) &&
             !/\.spec\.(ts|tsx|js|jsx)$/.test(module.path) &&
             !/\/__tests__\//.test(module.path) &&
             !/\/test\//.test(module.path);
    }
    return true;
  },
};

// Configurações de servidor (somente para desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  config.server = {
    ...config.server,
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Headers de segurança para desenvolvimento
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        return middleware(req, res, next);
      };
    },
  };
}

// Watcher otimizado
config.watcher = {
  ...config.watcher,
  
  // Arquivos adicionais para watch
  additionalExts: ['cjs', 'mjs'],
  
  // Ignorar arquivos/pastas
  ignored: [
    /node_modules\/(?!(@react-native|react-native|expo|@expo)\/).*/,
    /.git\/.*/,
    /\.expo\/.*/,
    /web-build\/.*/,
    /dist\/.*/,
    /\.next\/.*/,
  ],
  
  // Health check desabilitado para performance
  healthCheck: {
    enabled: false,
  },
  
  // Configurações de watching
  watchman: true,
  useWatchman: true,
};

// Cache otimizado para produção
if (process.env.NODE_ENV === 'production') {
  config.resetCache = false;
  config.cacheVersion = '2.1.0';
} else {
  // Cache desabilitado em desenvolvimento para hot reload
  config.resetCache = true;
}

module.exports = config;