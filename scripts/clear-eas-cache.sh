#!/bin/bash

# Script para limpar completamente o cache do EAS Build
# Execute este script antes de tentar fazer build novamente

echo "🧹 Limpando cache do EAS Build..."

# 1. Remover arquivos de cache do Expo
echo "📦 Removendo cache do Expo..."
rm -rf .expo
rm -rf node_modules/.cache

# 2. Remover configurações locais do EAS
echo "🗑️  Removendo configurações locais do EAS..."
rm -rf .eas

# 3. Limpar node_modules (opcional mas recomendado)
echo "🔄 Limpando node_modules..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# 4. Reinstalar dependências
echo "📥 Reinstalando dependências..."
npm install

# 5. Limpar build cache do Expo
echo "🗑️  Limpando build cache..."
npx expo start --clear

echo "✅ Cache limpo com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Execute: eas login"
echo "2. Execute: eas init --force"
echo "3. Execute: eas build --platform ios --profile development"
