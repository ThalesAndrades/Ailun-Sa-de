#!/bin/bash
# Corrigir imports do Alert, Linking e Clipboard

# Lista de arquivos com Alert incorreto
files_with_alert=$(grep -r "import.*Alert.*from 'react-native'" app/ --include="*.tsx" --include="*.ts" -l 2>/dev/null)

for file in $files_with_alert; do
  echo "Corrigindo Alert em: $file"
  # Remover Alert do import do react-native
  sed -i "s/Alert,\s*//g" "$file"
  sed -i "s/,\s*Alert//g" "$file"
  # Adicionar import correto do Alert
  if ! grep -q "import { Alert } from 'react-native';" "$file"; then
    sed -i "/from 'react-native';/a import { Alert } from 'react-native';" "$file"
  fi
done

echo "Correções aplicadas!"
