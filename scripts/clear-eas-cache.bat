@echo off
REM Script para limpar completamente o cache do EAS Build (Windows)

echo Limpando cache do EAS Build...

REM 1. Remover arquivos de cache do Expo
echo Removendo cache do Expo...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM 2. Remover configuracoes locais do EAS
echo Removendo configuracoes locais do EAS...
if exist .eas rmdir /s /q .eas

REM 3. Limpar node_modules
echo Limpando node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json
if exist yarn.lock del /f yarn.lock
if exist pnpm-lock.yaml del /f pnpm-lock.yaml

REM 4. Reinstalar dependencias
echo Reinstalando dependencias...
call npm install

REM 5. Limpar build cache do Expo
echo Limpando build cache...
call npx expo start --clear

echo.
echo Cache limpo com sucesso!
echo.
echo Proximos passos:
echo 1. Execute: eas login
echo 2. Execute: eas init --force
echo 3. Execute: eas build --platform ios --profile development

pause
