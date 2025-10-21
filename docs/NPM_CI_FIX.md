# Fix: npm ci Peer Dependency Resolution (21 Oct 2025)

## Problem

EAS build environment was failing with:
```
npm error ERESOLVE could not resolve
npm error While resolving: expo-router@3.5.24
```

The error occurred because the EAS build uses `npm ci --include=dev` which enforces **strict** peer dependency resolution (unlike `npm install --legacy-peer-deps` which is more forgiving).

**Specific conflicts:**
- `expo-router@3.5.24` expects `@react-navigation/drawer@^6.5.8` but project has `7.5.10`
- `@radix-ui/react-compose-refs@1.0.0` expects `react@^16.8 || ^17.0 || ^18.0` but project uses `react@19.0.0`
- `@radix-ui/react-slot@1.0.1` has similar React version conflict

## Solution

Created `.npmrc` configuration file in project root with:
```
legacy-peer-deps=true
```

This tells npm to allow legacy peer dependencies without throwing errors, matching the behavior of `npm install --legacy-peer-deps`.

## Why This Works

- **Local development:** `npm install --legacy-peer-deps` already used this flag
- **EAS builds:** Now respects the `.npmrc` configuration and applies same flag during `npm ci`
- **Result:** Dependencies install successfully in both environments

## Verification

```bash
# Before fix:
npm ci --include=dev
# Error: ERESOLVE could not resolve

# After fix:
npm ci --include=dev
# ✅ added 1439 packages, and audited 1440 packages in 38s
```

## Files Changed

- ✅ Created `.npmrc` with `legacy-peer-deps=true`
- ✅ No changes to `package.json` or `package-lock.json` needed
- ✅ Configuration is automatically picked up by EAS

## Next Steps

Now EAS builds should succeed past the "Install dependencies" phase:

```bash
# Try development profile first
eas build -p ios --profile development

# If development succeeds, try production
eas build -p ios --profile production

# Do the same for Android
eas build -p android --profile development
eas build -p android --profile production
```

## Root Cause Analysis

The project uses React 19.0.0 with Expo SDK 53 and several UI packages (@radix-ui, @react-navigation) that have older React peer dependencies. This is a known compatibility issue with React 19, but the packages still work fine in practice (hence `--legacy-peer-deps` is the right approach).

The project had already been built locally successfully with `npm install --legacy-peer-deps`, but the EAS build environment was using strict resolution. This fix aligns the build environments.

## References

- `.npmrc` documentation: https://docs.npmjs.com/cli/v10/configuring-npm/npmrc
- Peer dependencies: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies
- EAS build docs: https://docs.expo.dev/build/setup/
