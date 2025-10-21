# 🚀 Build direto no Xcode — macOS

## ✅ Status

O projeto foi preparado com sucesso para build direto no Xcode!

- ✅ Prebuild concluído (`ios/` e `android/` gerados)
- ✅ CocoaPods instalado
- ✅ Assets criados com tamanhos corretos
- ✅ `.npmrc` configurado para `legacy-peer-deps`
- ✅ `tsconfig.json` corrigido

---

## 🎯 Próximos Passos no Xcode

### 1. **Xcode já deve estar aberto**
   - Arquivo: `ios/AilunSade.xcworkspace`
   - Verifique se está no modo "Workspace" (não "Project")

### 2. **Selecionar Target e Device**
   - Left panel: Selecione "AilunSade"
   - Device selector (topo): Escolha:
     - `iPhone 15 Simulator` (para teste no simulador)
     - OU um device físico conectado

### 3. **Fazer Build**
   - Pressione: **Cmd + B** (build)
   - Ou: Menu → Product → Build

### 4. **Executar**
   - Pressione: **Cmd + R** (run na seleção)
   - Ou: Menu → Product → Run
   - Xcode abrirá automaticamente no simulador ou device

---

## 🔧 Se Precisar Limpar Build

```bash
cd /Applications/Ailun-Sa-de-1

# Limpar build
xcodebuild clean -workspace ios/AilunSade.xcworkspace -scheme AilunSade

# Ou via Xcode:
# Menu → Product → Clean Build Folder (Shift + Cmd + K)
```

---

## 📱 Simulador iOS

Se quiser executar sem device físico:

```bash
# Listar simuladores disponíveis
xcrun simctl list devices

# Abrir simulador
open /Applications/Simulator.app

# Build para simulador
xcodebuild -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Debug \
  -derivedDataPath ios/build \
  -sdk iphonesimulator
```

---

## ⚠️ Possíveis Erros e Soluções

### Erro: "No provisioning profile found"
- **Solução:** Xcode → Preferences → Accounts → Add Apple ID
- Ou: Selecione target → Build Settings → Search "Provisioning"

### Erro: "CocoaPods not found"
- **Solução:**
  ```bash
  cd ios
  pod install
  cd ..
  ```

### Erro: "Pod install failed"
- **Solução:**
  ```bash
  cd ios
  rm Podfile.lock
  pod install
  cd ..
  ```

### Build muito lento
- **Solução:** Reducir simulador ou usar device físico
- Ou: Product → Build For → Running (pré-compila)

---

## 📊 Estrutura dos Arquivos Gerados

```
ios/
├── AilunSade.xcworkspace/      ← Abrir ESTE arquivo no Xcode
├── AilunSade.xcodeproj/         (não use direto)
├── Podfile                        (dependências CocoaPods)
├── Podfile.lock
├── AilunSade/                    (source code)
└── Pods/                         (dependências)

android/                          (também gerado, para Android Studio)
├── app/
├── build.gradle
└── gradle.properties
```

---

## ✅ Checklist Antes de Submeter

- [ ] Build funciona no simulator
- [ ] Build funciona em device físico
- [ ] Assets aparecem corretamente (icon + splash)
- [ ] Aplicativo inicia sem crashes
- [ ] Testes básicos funcionam
- [ ] Substituir assets placeholders com imagens finais

---

## 🎓 Próximas Etapas

### Se Build Funcionar no Xcode
1. **Testar no device físico** (ou simulator avançado)
2. **Gerar IPA para distribuição**
   ```bash
   # Via Xcode:
   # Product → Archive
   # Window → Organizer → Distribute App
   ```
3. **Submeter à App Store** via App Store Connect

### Se Preferir Usar EAS (Cloud Build)
```bash
# Retry EAS build agora que .npmrc foi criado
eas build -p ios --profile production
eas build -p android --profile production
```

---

## 📞 Referências

- [Expo Prebuild docs](https://docs.expo.dev/workflow/prebuild/)
- [Xcode Build System](https://developer.apple.com/documentation/xcode)
- [CocoaPods Guide](https://cocoapods.org/)
- [Apple Developer](https://developer.apple.com)

---

**O projeto está pronto para build! Abra o Xcode e pressione Cmd+B para começar.** 🎉
