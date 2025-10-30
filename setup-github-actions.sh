#!/bin/bash

echo "🚀 Configurando GitHub Actions para Build Automático..."
echo ""

# Criar diretório se não existir
mkdir -p .github/workflows

# Copiar workflows
echo "✅ Criando workflow de build..."
cat > .github/workflows/eas-build.yml << 'EOF'
name: EAS Build

on:
  # Trigger automático quando fizer push para estas branches
  push:
    branches:
      - main
      - master
      - production
      - release/*

  # Permite executar manualmente pelo GitHub Actions UI
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build'
        required: true
        default: 'all'
        type: choice
        options:
          - ios
          - android
          - all
      profile:
        description: 'Build profile'
        required: true
        default: 'production'
        type: choice
        options:
          - production
          - preview
          - development

jobs:
  build:
    name: EAS Build - ${{ github.event.inputs.platform || 'all' }}
    runs-on: ubuntu-latest

    steps:
      - name: Checkout código
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Instalar dependências
        run: npm ci

      - name: Build iOS
        if: ${{ github.event.inputs.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == '' }}
        run: eas build --platform ios --profile ${{ github.event.inputs.profile || 'production' }} --non-interactive --no-wait

      - name: Build Android
        if: ${{ github.event.inputs.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == '' }}
        run: eas build --platform android --profile ${{ github.event.inputs.profile || 'production' }} --non-interactive --no-wait

      - name: Comentário de sucesso
        if: success()
        run: |
          echo "✅ Build iniciado com sucesso!"
          echo "📱 Acompanhe o progresso em: https://expo.dev/accounts/ailun/projects/ailun-saude/builds"
EOF

echo "✅ Criando workflow de submit..."
cat > .github/workflows/eas-submit.yml << 'EOF'
name: EAS Submit to App Stores

on:
  # Permite executar manualmente pelo GitHub Actions UI
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to submit'
        required: true
        type: choice
        options:
          - ios
          - android
          - both

jobs:
  submit:
    name: Submit to App Store
    runs-on: ubuntu-latest

    steps:
      - name: Checkout código
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Instalar dependências
        run: npm ci

      - name: Submit para App Store (iOS)
        if: ${{ github.event.inputs.platform == 'ios' || github.event.inputs.platform == 'both' }}
        run: eas submit --platform ios --latest --non-interactive

      - name: Submit para Play Store (Android)
        if: ${{ github.event.inputs.platform == 'android' || github.event.inputs.platform == 'both' }}
        run: eas submit --platform android --latest --non-interactive

      - name: Sucesso
        if: success()
        run: echo "✅ App submetido com sucesso para as lojas!"
EOF

echo ""
echo "✅ Workflows criados com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Adicionar workflows ao git:"
echo "   git add .github/workflows/*.yml"
echo ""
echo "2. Commit:"
echo "   git commit -m 'ci: Adicionar GitHub Actions para build automático'"
echo ""
echo "3. Push para branch production (ou main/master):"
echo "   git checkout -b production"
echo "   git push origin production"
echo ""
echo "4. Configurar EXPO_TOKEN no GitHub:"
echo "   https://github.com/ThalesAndrades/Ailun-Sa-de/settings/secrets/actions"
echo ""
echo "🎉 Depois disso, qualquer push para production/main/master vai fazer build automático!"
