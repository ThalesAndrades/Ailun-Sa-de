@echo off
REM Script para configurar todas as variaveis de ambiente no EAS (Windows)

echo Configurando Variaveis de Ambiente no EAS...
echo.
echo ATENCAO: Este script ira solicitar os valores das variaveis.
echo Tenha o arquivo .env aberto para copiar os valores.
echo.

REM Verificar se esta logado
echo Verificando login no EAS...
call eas whoami >nul 2>&1
if errorlevel 1 (
  echo Voce nao esta logado no EAS.
  echo Execute: eas login
  exit /b 1
)

echo Logado no EAS
echo.

echo Configurando Variaveis do Supabase Cliente...
echo.

set /p SUPABASE_URL="EXPO_PUBLIC_SUPABASE_URL: "
if not "%SUPABASE_URL%"=="" (
  call eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "%SUPABASE_URL%" --type string --force
)

set /p SUPABASE_ANON="EXPO_PUBLIC_SUPABASE_ANON_KEY: "
if not "%SUPABASE_ANON%"=="" (
  call eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "%SUPABASE_ANON%" --type string --force
)

echo.
echo Configurando Variaveis do Supabase Servidor...
echo.

set /p SERVICE_ROLE="SUPABASE_SERVICE_ROLE_KEY: "
if not "%SERVICE_ROLE%"=="" (
  call eas secret:create --scope project --name SUPABASE_SERVICE_ROLE_KEY --value "%SERVICE_ROLE%" --type string --force
)

set /p DB_URL="SUPABASE_DB_URL: "
if not "%DB_URL%"=="" (
  call eas secret:create --scope project --name SUPABASE_DB_URL --value "%DB_URL%" --type string --force
)

echo.
echo Configurando Integracoes Externas...
echo.

set /p ASAAS="ASAAS_API_KEY: "
if not "%ASAAS%"=="" (
  call eas secret:create --scope project --name ASAAS_API_KEY --value "%ASAAS%" --type string --force
)

set /p RESEND="RESEND_API_KEY: "
if not "%RESEND%"=="" (
  call eas secret:create --scope project --name RESEND_API_KEY --value "%RESEND%" --type string --force
)

set /p RAPIDOC_CLIENT="RAPIDOC_CLIENT_ID: "
if not "%RAPIDOC_CLIENT%"=="" (
  call eas secret:create --scope project --name RAPIDOC_CLIENT_ID --value "%RAPIDOC_CLIENT%" --type string --force
)

set /p RAPIDOC_TOKEN="RAPIDOC_TOKEN: "
if not "%RAPIDOC_TOKEN%"=="" (
  call eas secret:create --scope project --name RAPIDOC_TOKEN --value "%RAPIDOC_TOKEN%" --type string --force
)

set /p RAPIDOC_URL="RAPIDOC_BASE_URL (ou Enter para https://api.rapidoc.tech): "
if "%RAPIDOC_URL%"=="" set RAPIDOC_URL=https://api.rapidoc.tech
call eas secret:create --scope project --name RAPIDOC_BASE_URL --value "%RAPIDOC_URL%" --type string --force

echo.
echo Configuracao Concluida!
echo.
echo Proximos passos:
echo 1. Verificar secrets: eas secret:list
echo 2. Fazer build: eas build --platform ios --profile production --clear-cache
echo 3. Testar build: eas build --platform ios --profile preview
echo.

pause
