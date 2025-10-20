@echo off
REM Script de diagnostico completo para builds EAS (Windows)

echo Diagnostico Completo - Ailun Saude Build
echo ==========================================
echo.

set PROBLEMS=0

REM 1. Verificar EAS CLI
echo Verificando EAS CLI...
where eas >nul 2>&1
if %errorlevel% equ 0 (
  echo [OK] EAS CLI instalado
) else (
  echo [ERRO] EAS CLI nao encontrado
  echo    Instale com: npm install -g eas-cli
  set /a PROBLEMS+=1
)
echo.

REM 2. Verificar login
echo Verificando autenticacao...
call eas whoami >nul 2>&1
if %errorlevel% equ 0 (
  echo [OK] Autenticado no EAS
) else (
  echo [ERRO] Nao autenticado
  echo    Execute: eas login
  set /a PROBLEMS+=1
)
echo.

REM 3. Verificar app.json
echo Verificando app.json...
if exist app.json (
  echo [OK] app.json encontrado
  
  findstr /C:"projectId" app.json >nul
  if %errorlevel% equ 0 (
    echo [OK] projectId configurado em app.json
  ) else (
    echo [ERRO] projectId NAO encontrado em app.json
    set /a PROBLEMS+=1
  )
  
  findstr /C:"\"owner\"" app.json >nul
  if %errorlevel% equ 0 (
    echo [OK] owner configurado em app.json
  ) else (
    echo [AVISO] owner NAO configurado em app.json
  )
) else (
  echo [ERRO] app.json nao encontrado
  set /a PROBLEMS+=1
)
echo.

REM 4. Verificar app.config.js
echo Verificando app.config.js...
if exist app.config.js (
  echo [OK] app.config.js encontrado
  
  findstr /C:"projectId" app.config.js >nul
  if %errorlevel% equ 0 (
    echo [OK] projectId configurado em app.config.js
  ) else (
    echo [ERRO] projectId NAO encontrado em app.config.js
  )
) else (
  echo [AVISO] app.config.js nao encontrado
)
echo.

REM 5. Verificar eas.json
echo Verificando eas.json...
if exist eas.json (
  echo [OK] eas.json encontrado
  
  findstr /C:"production" eas.json >nul
  if %errorlevel% equ 0 (
    echo [OK] Profile production configurado
  )
  
  findstr /C:"preview" eas.json >nul
  if %errorlevel% equ 0 (
    echo [OK] Profile preview configurado
  )
) else (
  echo [ERRO] eas.json nao encontrado
  set /a PROBLEMS+=1
)
echo.

REM 6. Verificar secrets
echo Verificando secrets no EAS...
call eas secret:list > temp_secrets.txt 2>&1

findstr /C:"EXPO_PUBLIC_SUPABASE_URL" temp_secrets.txt >nul
if %errorlevel% equ 0 (
  echo [OK] EXPO_PUBLIC_SUPABASE_URL configurado
) else (
  echo [ERRO] EXPO_PUBLIC_SUPABASE_URL NAO configurado
  set /a PROBLEMS+=1
)

findstr /C:"EXPO_PUBLIC_SUPABASE_ANON_KEY" temp_secrets.txt >nul
if %errorlevel% equ 0 (
  echo [OK] EXPO_PUBLIC_SUPABASE_ANON_KEY configurado
) else (
  echo [ERRO] EXPO_PUBLIC_SUPABASE_ANON_KEY NAO configurado
  set /a PROBLEMS+=1
)

del temp_secrets.txt
echo.

REM 7. Verificar projeto EAS
echo Verificando projeto no EAS...
call eas project:info > temp_project.txt 2>&1

findstr /C:"Project ID" temp_project.txt >nul
if %errorlevel% equ 0 (
  echo [OK] Projeto vinculado ao EAS
  type temp_project.txt | findstr /C:"Project ID"
  type temp_project.txt | findstr /C:"Owner"
) else (
  echo [ERRO] Projeto NAO vinculado ao EAS
  set /a PROBLEMS+=1
)

del temp_project.txt
echo.

REM 8. Resumo
echo ==========================================
echo RESUMO DO DIAGNOSTICO
echo ==========================================
echo.

if %PROBLEMS% equ 0 (
  echo [OK] Configuracao parece estar correta!
  echo.
  echo Proximos passos:
  echo 1. Tentar build preview: eas build --platform ios --profile preview
  echo 2. Se preview funcionar, tentar production: eas build --platform ios --profile production
) else (
  echo [ERRO] Encontrados %PROBLEMS% problemas
  echo.
  echo Acoes necessarias:
  echo 1. Corrija os itens marcados com [ERRO]
  echo 2. Execute este script novamente para verificar
)

echo.
echo ==========================================
echo.

pause
