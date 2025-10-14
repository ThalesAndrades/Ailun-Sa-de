/**
 * Script de Configuração para Produção
 * Prepara o aplicativo para deploy em produção
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}[${step}]${colors.reset} ${colors.blue}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// Função para remover console.logs de arquivos
function removeConsoleLogs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remover console.log, console.info, console.debug
    const cleanedContent = content
      .replace(/console\.(log|info|debug)\([^)]*\);?\n?/g, '')
      .replace(/console\.(log|info|debug)\([^)]*\);?/g, '')
      // Manter console.warn e console.error
      .replace(/^\s*\/\/.*console\.(log|info|debug).*\n/gm, '');
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    logError(`Erro ao processar ${filePath}: ${error.message}`);
    return false;
  }
}

// Função recursiva para processar diretórios
function processDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let processedFiles = 0;
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Pular node_modules e .expo
      if (!['node_modules', '.expo', '.git', 'dist', 'build'].includes(item)) {
        processedFiles += processDirectory(fullPath, extensions);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        if (removeConsoleLogs(fullPath)) {
          processedFiles++;
        }
      }
    }
  }
  
  return processedFiles;
}

// Função para otimizar app.json
function optimizeAppJson() {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Configurações de produção
    appJson.expo.updates = appJson.expo.updates || {};
    appJson.expo.updates.enabled = true;
    appJson.expo.updates.checkAutomatically = 'ON_LOAD';
    
    // Otimizações
    appJson.expo.optimization = {
      minify: true,
      tree_shake: true
    };
    
    // Permissions mínimas necessárias
    appJson.expo.permissions = appJson.expo.permissions || [];
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    logSuccess('app.json otimizado para produção');
  } catch (error) {
    logError(`Erro ao otimizar app.json: ${error.message}`);
  }
}

// Função para verificar dependências de segurança
function checkSecurityDeps() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const securityDeps = [
      '@expo/vector-icons',
      'expo-secure-store',
      'expo-local-authentication',
      'expo-crypto',
      'react-native-url-polyfill'
    ];
    
    const missing = securityDeps.filter(dep => 
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );
    
    if (missing.length === 0) {
      logSuccess('Todas as dependências de segurança estão instaladas');
    } else {
      logWarning(`Dependências de segurança faltando: ${missing.join(', ')}`);
    }
  } catch (error) {
    logError(`Erro ao verificar dependências: ${error.message}`);
  }
}

// Função para criar arquivo de build info
function createBuildInfo() {
  const buildInfo = {
    buildDate: new Date().toISOString(),
    version: require('../package.json').version,
    environment: 'production',
    features: {
      auditLogs: true,
      biometricAuth: true,
      pushNotifications: true,
      crashReporting: true
    }
  };
  
  const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  logSuccess('Arquivo build-info.json criado');
}

// Função principal
async function setupProduction() {
  log('\n' + '='.repeat(50), 'bold');
  log('🚀 CONFIGURAÇÃO PARA PRODUÇÃO - AILUN SAÚDE', 'bold');
  log('='.repeat(50) + '\n', 'bold');
  
  logStep(1, 'Removendo logs de desenvolvimento');
  const processedFiles = processDirectory(path.join(__dirname, '..'));
  logSuccess(`${processedFiles} arquivos processados`);
  
  logStep(2, 'Otimizando configurações');
  optimizeAppJson();
  
  logStep(3, 'Verificando dependências de segurança');
  checkSecurityDeps();
  
  logStep(4, 'Criando informações de build');
  createBuildInfo();
  
  logStep(5, 'Copiando configuração de produção');
  try {
    const prodEnvPath = path.join(__dirname, '..', '.env.production');
    const envPath = path.join(__dirname, '..', '.env');
    
    if (fs.existsSync(prodEnvPath)) {
      fs.copyFileSync(prodEnvPath, envPath);
      logSuccess('Configuração de produção aplicada');
    } else {
      logWarning('Arquivo .env.production não encontrado');
    }
  } catch (error) {
    logError(`Erro ao copiar configuração: ${error.message}`);
  }
  
  log('\n' + '='.repeat(50), 'bold');
  log('✅ CONFIGURAÇÃO DE PRODUÇÃO CONCLUÍDA!', 'green');
  log('='.repeat(50) + '\n', 'bold');
  
  log('📝 Próximos passos:', 'blue');
  log('1. Executar: expo build:android ou expo build:ios');
  log('2. Testar o aplicativo em dispositivos físicos');
  log('3. Publicar nas lojas de aplicativos');
  log('4. Monitorar logs e métricas\n');
}

// Executar se chamado diretamente
if (require.main === module) {
  setupProduction().catch(error => {
    logError(`Erro na configuração: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setupProduction };