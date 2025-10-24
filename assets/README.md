# Assets - Ailun Saúde

**Logo Oficial Redesenhada** - Implementada em 23/10/2025

---

## 📱 Ícones do App

### iOS (App Store)

**icon.png** - 1024x1024px
- Ícone principal do app para iOS
- Usado no App Store
- Formato: PNG, sem transparência
- Tamanho: 1.2 MB

### Android (Play Store)

**adaptive-icon.png** - 1024x1024px
- Ícone adaptativo para Android
- Usado no Google Play Store
- Formato: PNG com transparência
- Tamanho: 1.2 MB

**playstore-icon.png** - 512x512px
- Ícone de alta resolução para Play Store
- Usado em listagens e promoções
- Formato: PNG
- Tamanho: 214 KB

### Web

**favicon.png** - 48x48px
- Ícone para navegadores web
- Usado em abas e favoritos
- Formato: PNG
- Tamanho: 3.6 KB

---

## 🎨 Splash Screen

**splash.png** - 1284x2778px
- Tela de carregamento inicial
- Proporção: iPhone 14 Pro Max
- Fundo: Teal (#00B4DB)
- Logo centralizada (400x400px)
- Tamanho: 158 KB

---

## 🖼️ Logo

**logo-ailun.png** - 1024x1024px
- Logo oficial redesenhada
- Usada dentro do app (login, tutorial, etc.)
- Formato: PNG com transparência
- Fundo: Escuro/transparente
- Tamanho: 1.2 MB

---

## 📐 Especificações Técnicas

### Cores Principais

- **Teal Principal**: #00B4DB
- **Teal Escuro**: #0083B0
- **Verde Saúde**: #00D9A3
- **Fundo Escuro**: #1A2332

### Formato

- **Tipo**: PNG
- **Profundidade**: 8-bit sRGB
- **Compressão**: Otimizada
- **Transparência**: Sim (onde aplicável)

### Tamanhos

| Asset | Dimensões | Uso | Tamanho |
|-------|-----------|-----|---------|
| icon.png | 1024x1024 | iOS App Store | 1.2 MB |
| adaptive-icon.png | 1024x1024 | Android Play Store | 1.2 MB |
| playstore-icon.png | 512x512 | Play Store High-Res | 214 KB |
| favicon.png | 48x48 | Web Browser | 3.6 KB |
| splash.png | 1284x2778 | Splash Screen | 158 KB |
| logo-ailun.png | 1024x1024 | In-App Logo | 1.2 MB |

---

## ✅ Checklist de Implementação

### iOS
- [x] icon.png (1024x1024)
- [x] Atualizado em app.json
- [x] Splash screen atualizada
- [x] Logo em telas (login, tutorial)

### Android
- [x] adaptive-icon.png (1024x1024)
- [x] playstore-icon.png (512x512)
- [x] Atualizado em app.json
- [x] Splash screen atualizada

### Web
- [x] favicon.png (48x48)
- [x] Atualizado em app.json

---

## 🔄 Histórico de Versões

### v2.0 - 23/10/2025
- Logo redesenhada com visual moderno
- Fundo escuro com efeito 3D
- Gradiente teal/verde
- Melhor legibilidade
- Profissional e clean

### v1.0 - 22/10/2025
- Logo original com fundo branco
- Design simples
- Cores teal/azul

---

## 📝 Notas de Design

A nova logo apresenta:

1. **Visual Moderno**: Efeito 3D com sombras e profundidade
2. **Cores Vibrantes**: Gradiente teal para verde saúde
3. **Símbolo Médico**: Cruz médica integrada ao "i"
4. **Tipografia Bold**: Letras grandes e legíveis
5. **Contraste Alto**: Fundo escuro para destaque
6. **Profissionalismo**: Design clean e corporativo

---

## 🚀 Como Usar

### No Código

```typescript
// Login, Splash, Tutorial
<Image
  source={require('../assets/logo-ailun.png')}
  style={styles.logo}
  contentFit="contain"
/>
```

### No app.json

```json
{
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png"
    }
  },
  "web": {
    "favicon": "./assets/favicon.png"
  }
}
```

---

## 📦 Arquivos

```
assets/
├── icon.png              # iOS App Icon (1024x1024)
├── adaptive-icon.png     # Android Adaptive Icon (1024x1024)
├── playstore-icon.png    # Play Store Icon (512x512)
├── favicon.png           # Web Favicon (48x48)
├── splash.png            # Splash Screen (1284x2778)
├── logo-ailun.png        # In-App Logo (1024x1024)
└── logo-ailun-old.png    # Backup da logo antiga
```

---

**Assets criados e otimizados para produção**

**Data**: 23 de outubro de 2025  
**Versão**: 2.0  
**Status**: ✅ Pronto para build

