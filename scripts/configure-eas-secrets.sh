#!/bin/bash

# Script para configurar todas as variáveis de ambiente no EAS
# ATENÇÃO: Você precisará ter os valores corretos do arquivo .env

echo "🔐 Configurando Variáveis de Ambiente no EAS..."
echo ""
echo "⚠️  ATENÇÃO: Este script irá solicitar os valores das variáveis."
echo "📋 Tenha o arquivo .env aberto para copiar os valores."
echo ""

# Verificar se está logado
echo "1️⃣  Verificando login no EAS..."
if ! eas whoami > /dev/null 2>&1; then
  echo "❌ Você não está logado no EAS."
  echo "Execute: eas login"
  exit 1
fi

echo "✅ Logado no EAS"
echo ""

# Função para criar secret
create_secret() {
  local name=$1
  local description=$2
  
  echo "📝 Configurando: $name"
  echo "   Descrição: $description"
  read -p "   Valor: " value
  
  if [ -z "$value" ]; then
    echo "⚠️  Valor vazio - pulando $name"
    echo ""
    return
  fi
  
  eas secret:create --scope project --name "$name" --value "$value" --type string --force
  
  if [ $? -eq 0 ]; then
    echo "✅ $name configurado"
  else
    echo "❌ Erro ao configurar $name"
  fi
  echo ""
}

echo "2️⃣  Configurando Variáveis do Supabase (Cliente)..."
echo ""

create_secret "EXPO_PUBLIC_SUPABASE_URL" "URL do projeto Supabase"
create_secret "EXPO_PUBLIC_SUPABASE_ANON_KEY" "Chave anônima do Supabase (pública)"

echo "3️⃣  Configurando Variáveis do Supabase (Servidor)..."
echo ""

create_secret "SUPABASE_SERVICE_ROLE_KEY" "Chave de serviço do Supabase (SENSÍVEL)"
create_secret "SUPABASE_DB_URL" "URL do banco de dados PostgreSQL"

echo "4️⃣  Configurando Integrações Externas..."
echo ""

create_secret "ASAAS_API_KEY" "API Key do Asaas (pagamentos)"
create_secret "RESEND_API_KEY" "API Key do Resend (emails)"
create_secret "RAPIDOC_CLIENT_ID" "Client ID do RapiDoc"
create_secret "RAPIDOC_TOKEN" "Token de autenticação do RapiDoc"
create_secret "RAPIDOC_BASE_URL" "URL base da API RapiDoc"

echo ""
echo "✅ Configuração Concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verificar secrets: eas secret:list"
echo "2. Fazer build: eas build --platform ios --profile production --clear-cache"
echo "3. Testar build: eas build --platform ios --profile preview"
echo ""
