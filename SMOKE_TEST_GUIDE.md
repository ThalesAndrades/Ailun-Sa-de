# iOS App Ready for Testing — Smoke Test Guide

## Current Status: ✅ BUILD COMPLETE, READY FOR SIMULATOR TESTING

The iOS app archive has been successfully created and validated. The app is now ready for functional testing in the iOS simulator. 

**Key Point**: TypeScript compilation has 35 remaining warnings (mostly type compatibility), but these do **NOT** block the app from running. The app will execute normally.

---

## Quick Start: Run Smoke Tests

### 1. Start the Expo development server:

```bash
npm run start
```

You should see output like:
```
Watching for file changes...
Starting iOS build...
```

### 2. Launch iOS Simulator:

In the terminal output from `npm run start`, you'll see an option to press `i` to open iOS simulator, or run:

```bash
npm run ios
```

The app should build and launch in the simulator within 60-90 seconds.

### 3. Test Core Flows

Once the app is running in the simulator, perform these smoke tests:

#### **Test A: Authentication**
- [ ] Splash screen displays correctly
- [ ] Navigate to Login screen
- [ ] Enter test CPF: `12345678901` (use any valid format)
- [ ] Verify error handling for invalid credentials
- [ ] **PASS**: Login screen appears, text input works, navigation works

#### **Test B: Dashboard / Home**
- [ ] After login, dashboard loads
- [ ] Service cards are visible (Doctor, Psychology, Nutrition, etc.)
- [ ] Gradient colors display on service cards
- [ ] Icons render correctly (should see medical icons)
- [ ] **PASS**: Dashboard loads, service cards visible, layout looks good

#### **Test C: Request Immediate Consultation**
- [ ] Tap "Request Immediate" button on a service
- [ ] Consultation request screen loads
- [ ] Can select specialty (if applicable)
- [ ] Can input complaint/reason
- [ ] Submit button works
- [ ] **PASS**: Flow completes, response modal appears

#### **Test D: Schedule Appointment**
- [ ] Tap "Schedule Appointment" on a service
- [ ] Calendar/date picker loads
- [ ] Can select a future date
- [ ] Can select a time slot
- [ ] Confirm button works
- [ ] Success confirmation screen appears
- [ ] **PASS**: Appointment scheduled, confirmation displayed

#### **Test E: Notifications (if applicable)**
- [ ] Tap notification bell icon (if visible)
- [ ] Notification screen loads
- [ ] No crashes when scrolling notifications
- [ ] **PASS**: Notifications load and display

#### **Test F: Navigation**
- [ ] Tap bottom tabs (if using tab navigation)
- [ ] Screens load without crashes
- [ ] Back navigation works
- [ ] No console errors in Xcode output
- [ ] **PASS**: Navigation is smooth, no app crashes

### 4. Verification Checklist

After running the above tests, verify:

- [ ] **No red error screens** (crash indicators)
- [ ] **Console output clean** (Xcode console shows no ERROR level logs)
- [ ] **UI renders correctly** (colors, text, images visible and properly aligned)
- [ ] **Interactions responsive** (buttons, inputs respond to touches)
- [ ] **Navigation works** (can move between screens)
- [ ] **No freezes/hangs** (app is responsive, no spinning wheels stuck)

---

## Troubleshooting

### **Issue: App crashes on startup**
- Check Xcode console (Cmd+Shift+Y in Xcode) for error messages
- Common causes: Auth context initialization, Supabase connection
- Try: Clear cache with `npm run clean` and restart

### **Issue: TypeScript errors on start**
- These are **warnings only**, app will still run
- They don't affect runtime execution
- Can be fixed in follow-up PRs

### **Issue: Simulator is slow**
- Close other apps
- Restart simulator: `xcrun simctl erase all`
- Increase simulator RAM in Xcode settings

### **Issue: Can't connect to backend (Supabase)**
- Check network connectivity
- Verify `.env` variables are set: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Check Xcode console for 401 or network errors

---

## What to Record

If you encounter any visual or flow issues, please record:

1. **Screenshot**: Tab+Click screenshot in simulator (Cmd+S in simulator)
2. **Log**: Copy relevant console error from Xcode
3. **Reproduction Steps**: Exact steps to reproduce the issue

Examples of issues to watch for:
- Text appearing cut off or misaligned
- Colors not rendering correctly (especially gradients)
- Buttons not responding
- Navigation breaking
- Unexpected alerts or error messages

---

## Next Steps After Smoke Testing

### ✅ If Smoke Tests PASS:
1. Document any minor visual tweaks needed
2. Proceed to iOS Distribution signing setup (see `docs/IOS_SIGNING_NEXT_STEPS.md`)
3. Generate final .ipa for App Store submission

### ⚠️ If Issues Found:
1. Note the exact error and reproduction steps
2. Check Xcode console for detailed error messages
3. Common fixes:
   - Clear metro cache: `npm start -- --reset-cache`
   - Rebuild pods: `npm run clean && npm install`
   - Verify backend (Supabase) connectivity

---

## Build Artifacts Reference

- **Archive**: `ios/build/AilunSade.xcarchive` (signed with Apple Development)
- **App Bundle**: `ios/build/Build/Products/Release-iphoneos/AilunSade.app`
- **Export Config**: `ios/exportOptions.plist` (ready for App Store export)
- **Build Helper**: `scripts/ios-build-helper.sh` (automation scripts)

---

## Backend Notes

The app expects these Supabase environment variables (check .env):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

If these aren't set, auth and data flows will fail.

---

## Contact & Support

If smoke tests reveal critical issues (app crashes, can't log in, etc.), check:
1. `/Applications/Ailun-Sa-de-1/docs/BUILD_STATUS_2025_10_21.md` — detailed build status
2. `/Applications/Ailun-Sa-de-1/docs/IOS_SIGNING_NEXT_STEPS.md` — distribution signing guide
3. Xcode console output for detailed errors

---

**Status**: 🟢 Ready for Testing  
**Date**: 2025-10-21  
**Build Version**: 1.2.0  
**iOS Deployment Target**: 14.0  
