# iOS Signing & Distribution - Next Steps

## Current Status

- **iOS Archive**: ✅ Created successfully at `ios/build/AilunSade.xcarchive`
- **App Bundle**: ✅ Verified (arm64 executable, properly signed with Apple Development identity)
- **Export to IPA**: ❌ **FAILED** - Missing iOS Distribution certificate and provisioning profile

## Error Details

```
error: exportArchive No profiles for 'app.ailun' were found
error: exportArchive No signing certificate "iOS Distribution" found
```

This error occurs when attempting to export the archive for App Store using `xcodebuild -exportArchive`. The archive was created with a Development identity (for local testing), but exporting for App Store requires a Distribution identity.

## Required Credentials

To export to App Store:
1. **iOS Distribution Certificate** — downloaded from Apple Developer account
2. **App Store Provisioning Profile** — for app ID `app.ailun`, including:
   - Push Notifications capability
   - All required entitlements
3. **Apple Developer Account Access** — with appropriate team role (Admin or App Manager)

## Option A: Use Automatic Signing (Recommended)

If you have an Apple Developer account configured on this machine:

1. Open Xcode:
   ```bash
   xcode-select -p  # Verify Xcode path
   open ios/AilunSade.xcworkspace
   ```

2. In Xcode:
   - Select **AilunSade** target
   - Go to **Signing & Capabilities**
   - Enable **Automatically manage signing**
   - Select your Team ID
   - Xcode will auto-create/download provisioning profiles

3. Re-run export with automatic signing:
   ```bash
   npm run build:ios:export
   ```

## Option B: Manual Signing (Advanced)

If you already have distribution certs & profiles:

1. Download from Apple Developer:
   - iOS Distribution certificate (.cer)
   - App Store provisioning profile (.mobileprovision)

2. Install in Keychain:
   ```bash
   security import ~/Downloads/distribution.cer -k ~/Library/Keychains/login.keychain -P yourPassword
   ```

3. Update `exportOptions.plist` to reference your cert/profile:
   ```plist
   <key>signingStyle</key>
   <string>manual</string>
   <key>signingCertificate</key>
   <string>Apple Distribution: Your Name (Team ID)</string>
   <key>provisioningProfileSpecifier</key>
   <string>AppStoreProfileName</string>
   ```

4. Re-run export:
   ```bash
   xcodebuild -exportArchive \
     -archivePath ios/build/AilunSade.xcarchive \
     -exportOptionsPlist ios/exportOptions.plist \
     -exportPath ios/build
   ```

## Option C: Create Test Flight Build (Immediate)

If distribution cert not available but you have development certs:

1. Create ad-hoc export for internal testing:
   ```bash
   xcodebuild -exportArchive \
     -archivePath ios/build/AilunSade.xcarchive \
     -exportOptionsPlist ios/exportOptions-adhoc.plist \
     -exportPath ios/build
   ```

2. Where `exportOptions-adhoc.plist` contains:
   ```plist
   <key>method</key>
   <string>ad-hoc</string>
   ```

## Troubleshooting

### Error: "No profiles for 'app.ailun'"
- Ensure app ID `app.ailun` is registered in Apple Developer portal
- Create/update App Store provisioning profile for this ID
- Include Push Notifications capability in profile

### Error: "No signing certificate 'iOS Distribution'"
- Download iOS Distribution cert from Apple Developer account
- Import to Keychain:
  ```bash
  security import ~/Downloads/iOS_Distribution.cer -k ~/Library/Keychains/login.keychain
  ```

### Multiple certificates
- List available certs:
  ```bash
  security find-identity -v -p codesigning
  ```
- Use exact name in `exportOptions.plist` signingCertificate

## Next Actions

1. **Immediate**: Choose Option A (Automatic) or Option B (Manual)
2. **Quick Test**: Run `npm run test:build:export` to validate signing setup
3. **Final Export**: Run `npm run build:ios:export` to create final .ipa
4. **Upload**: Drag .ipa to App Store Connect or use `xcrun altool`

## Notes

- Archive is preserved at `ios/build/AilunSade.xcarchive` — can re-export with new signing
- TeamID for this app: `UAUX8M9JPN`
- After successful export, .ipa will be at `ios/build/AilunSade.ipa`
