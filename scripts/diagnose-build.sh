#!/bin/bash

# Script de diagnóstico completo para builds EAS
echo "🔍 Diagnóstico Completo - Ailun Saúde Build"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar EAS CLI
echo "1️⃣  Verificando EAS CLI..."
if command -v eas &> /dev/null; then
  EAS_VERSION=$(eas --version)
  echo -e "${GREEN}✅ EAS CLI instalado: $EAS_VERSION${NC}"
else
  echo -e "${RED}❌ EAS CLI não encontrado${NC}"
  echo "   Instale com: npm install -g eas-cli"
  exit 1
fi
echo ""

# 2. Verificar login
echo "2️⃣  Verificando autenticação..."
if eas whoami &> /dev/null; then
  WHOAMI=$(eas whoami)
  echo -e "${GREEN}✅ Logado como: $WHOAMI${NC}"
else
  echo -e "${RED}❌ Não autenticado${NC}"
  echo "   Execute: eas login"
  exit 1
fi
echo ""

# 3. Verificar app.json
echo "3️⃣  Verificando app.json..."
if [ -f "app.json" ]; then
  echo -e "${GREEN}✅ app.json encontrado${NC}"
  
  # Verificar projectId
  if grep -q "projectId" app.json; then
    PROJECT_ID=$(grep -A 2 '"eas"' app.json | grep "projectId" | cut -d'"' -f4)
    echo -e "${GREEN}✅ projectId configurado: $PROJECT_ID${NC}"
  else
    echo -e "${RED}❌ projectId não encontrado em app.json${NC}"
  fi
  
  # Verificar owner
  if grep -q '"owner"' app.json; then
    OWNER=$(grep '"owner"' app.json | cut -d'"' -f4)
    echo -e "${GREEN}✅ owner configurado: $OWNER${NC}"
  else
    echo -e "${YELLOW}⚠️  owner não configurado em app.json${NC}"
  fi
else
  echo -e "${RED}❌ app.json não encontrado${NC}"
fi
echo ""

# 4. Verificar app.config.js
echo "4️⃣  Verificando app.config.js..."
if [ -f "app.config.js" ]; then
  echo -e "${GREEN}✅ app.config.js encontrado${NC}"
  
  if grep -q "projectId" app.config.js; then
    echo -e "${GREEN}✅ projectId configurado em app.config.js${NC}"
  else
    echo -e "${RED}❌ projectId não encontrado em app.config.js${NC}"
  fi
  
  if grep -q "owner" app.config.js; then
    echo -e "${GREEN}✅ owner configurado em app.config.js${NC}"
  else
    echo -e "${YELLOW}⚠️  owner não configurado em app.config.js${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  app.config.js não encontrado${NC}"
fi
echo ""

# 5. Verificar eas.json
echo "5️⃣  Verificando eas.json..."
if [ -f "eas.json" ]; then
  echo -e "${GREEN}✅ eas.json encontrado${NC}"
  
  # Verificar profiles
  if grep -q '"production"' eas.json; then
    echo -e "${GREEN}✅ Profile 'production' configurado${NC}"
  fi
  
  if grep -q '"preview"' eas.json; then
    echo -e "${GREEN}✅ Profile 'preview' configurado${NC}"
  fi
else
  echo -e "${RED}❌ eas.json não encontrado${NC}"
fi
echo ""

# 6. Verificar secrets
echo "6️⃣  Verificando secrets no EAS..."
SECRETS=$(eas secret:list 2>&1)

if echo "$SECRETS" | grep -q "EXPO_PUBLIC_SUPABASE_URL"; then
  echo -e "${GREEN}✅ EXPO_PUBLIC_SUPABASE_URL configurado${NC}"
else
  echo -e "${RED}❌ EXPO_PUBLIC_SUPABASE_URL NÃO configurado${NC}"
fi

if echo "$SECRETS" | grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY"; then
  echo -e "${GREEN}✅ EXPO_PUBLIC_SUPABASE_ANON_KEY configurado${NC}"
else
  echo -e "${RED}❌ EXPO_PUBLIC_SUPABASE_ANON_KEY NÃO configurado${NC}"
fi

if echo "$SECRETS" | grep -q "ASAAS_API_KEY"; then
  echo -e "${GREEN}✅ ASAAS_API_KEY configurado${NC}"
else
  echo -e "${YELLOW}⚠️  ASAAS_API_KEY NÃO configurado${NC}"
fi
echo ""

# 7. Verificar projeto EAS
echo "7️⃣  Verificando projeto no EAS..."
PROJECT_INFO=$(eas project:info 2>&1)

if echo "$PROJECT_INFO" | grep -q "Project ID"; then
  echo -e "${GREEN}✅ Projeto vinculado ao EAS${NC}"
  echo "$PROJECT_INFO" | grep "Project ID"
  echo "$PROJECT_INFO" | grep "Owner"
  echo "$PROJECT_INFO" | grep "Slug"
else
  echo -e "${RED}❌ Projeto não vinculado ao EAS${NC}"
fi
echo ""

# 8. Verificar status do Expo
echo "8️⃣  Verificando status dos serviços Expo..."
echo "   Acesse: https://status.expo.dev/"
echo ""

# 9. Resumo
echo "=========================================="
echo "📊 RESUMO DO DIAGNÓSTICO"
echo "=========================================="
echo ""

# Contar problemas
PROBLEMS=0

if ! command -v eas &> /dev/null; then
  PROBLEMS=$((PROBLEMS+1))
fi

if ! eas whoami &> /dev/null; then
  PROBLEMS=$((PROBLEMS+1))
fi

if ! grep -q "projectId" app.json 2>/dev/null; then
  PROBLEMS=$((PROBLEMS+1))
fi

if ! echo "$SECRETS" | grep -q "EXPO_PUBLIC_SUPABASE_URL"; then
  PROBLEMS=$((PROBLEMS+1))
fi

if [ $PROBLEMS -eq 0 ]; then
  echo -e "${GREEN}✅ Configuração parece estar correta!${NC}"
  echo ""
  echo "📋 Próximos passos:"
  echo "1. Tentar build preview: eas build --platform ios --profile preview"
  echo "2. Se preview funcionar, tentar production: eas build --platform ios --profile production"
else
  echo -e "${RED}❌ Encontrados $PROBLEMS problemas${NC}"
  echo ""
  echo "📋 Ações necessárias:"
  echo "1. Corrija os itens marcados com ❌"
  echo "2. Execute este script novamente para verificar"
fi

echo ""
echo "=========================================="
