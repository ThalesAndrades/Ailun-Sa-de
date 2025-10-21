# Quick Start — Ailun Saúde Build Ready

**Status:** ✅ The project is ready to build and deploy.

---

## 🚀 Start Development (30 seconds)

```bash
cd /Applications/Ailun-Sa-de-1
npm run start
```

Scan the QR code with Expo Go app on your device. Done!

---

## 📱 Build Locally

### iOS (macOS only)
```bash
npm run ios
```

### Android
```bash
npm run android
```

---

## 🏗️ Build for Production (EAS)

### Prerequisites
```bash
which eas                      # Verify EAS CLI is installed
eas whoami                     # Check logged-in account
```

### Build
```bash
eas build -p ios --profile production
eas build -p android --profile production
```

**Issue?** If you see "Entity not authorized":
```bash
eas logout
eas login                      # Log in with the correct account
eas build -p ios --profile production
```

---

## ⚡ Quality Checks

### Fast Type Check (~2 seconds)
```bash
npm run typecheck:app
```

### Full Lint
```bash
npm run lint
npm run lint --fix             # Auto-fix common issues
```

### Full Type Check (with server code)
```bash
npx tsc --noEmit
```

---

## 📚 Documentation

- **Build errors?** → See `docs/BUILD_PLAN.md`
- **TypeScript errors?** → See `docs/TYPECHECK_STATUS.md`
- **EAS issues?** → See `docs/EAS_TROUBLESHOOT.md`
- **General setup?** → See `BUILD_STATUS.md`

---

## 🎯 Before Production Submission

- [ ] Replace placeholder images in `assets/`
- [ ] Fix critical TypeScript errors (see `docs/TYPECHECK_STATUS.md`)
- [ ] Test on real devices
- [ ] Ensure EAS project permissions are correct
- [ ] Review App Store / Play Store requirements

---

## 📞 Troubleshooting

| Issue | Command |
|-------|---------|
| Blank screen? | `npm run start` then reload |
| Type errors? | `npm run typecheck:app` (see `docs/TYPECHECK_STATUS.md`) |
| Build hangs? | `eas logout && eas login` then retry |
| Port 8081 in use? | `lsof -i :8081` and `kill -9 <PID>` |

---

**Ready to go!** 🎉

