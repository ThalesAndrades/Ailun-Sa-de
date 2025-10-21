#!/usr/bin/env bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
set -euo pipefail

# iOS build helper for AilunSade
# - Installs pods
# - Builds the Xcode workspace for Simulator or Device
#
# Usage examples:
#   ./build.sh                        # Debug build for iPhone 15 Simulator
#   ./build.sh -c Release             # Release build for iPhone 15 Simulator
#   ./build.sh -s AilunSade           # Explicit scheme
#   ./build.sh -d "platform=iOS,name=iPhone SE (3rd generation)"   # Custom destination
#   ./build.sh -k iphoneos            # Build for device (requires signing)

SCHEME="AilunSade"
CONFIGURATION="Debug"
SDK="iphonesimulator"
DESTINATION="platform=iOS Simulator,name=iPhone Air"
CLEAN=0
DERIVED_DATA="$(pwd)/build/DerivedData"

while getopts "s:c:k:d:Ch" opt; do
  case "$opt" in
    s) SCHEME="$OPTARG" ;;
    c) CONFIGURATION="$OPTARG" ;;
    k) SDK="$OPTARG" ;;
    d) DESTINATION="$OPTARG" ;;
    C) CLEAN=1 ;;
    h)
      echo "Usage: $0 [-s scheme] [-c Debug|Release] [-k iphonesimulator|iphoneos] [-d destination] [-C]"
      exit 0
      ;;
  esac
done

# Ensure we're in ios directory regardless of invocation location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure Node path is exported for Xcode scripts
if [[ -f .xcode.env ]]; then
  # shellcheck disable=SC1091
  source .xcode.env
fi
if [[ -f .xcode.env.local ]]; then
  # shellcheck disable=SC1091
  source .xcode.env.local
fi

# Install pods (without repo update to be fast)
echo "[build.sh] Running pod install..."
pod install --no-repo-update

# Create derived data folder if needed
mkdir -p "$DERIVED_DATA"

# Choose command formatter
FORMATTER="cat"
if command -v xcpretty >/dev/null 2>&1; then
  FORMATTER="xcpretty"
fi

# Clean if requested
if [[ "$CLEAN" -eq 1 ]]; then
  echo "[build.sh] Cleaning..."
  set -x
  xcodebuild \
    -workspace AilunSade.xcworkspace \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -sdk "$SDK" \
    -destination "$DESTINATION" \
    -derivedDataPath "$DERIVED_DATA" \
    clean | $FORMATTER
  set +x
fi

# If targeting device, we won't set a simulator destination
XCB_DEST_ARGS=( -destination "$DESTINATION" )
if [[ "$SDK" == "iphoneos" ]]; then
  XCB_DEST_ARGS=()
fi

# Build
echo "[build.sh] Building scheme=$SCHEME config=$CONFIGURATION sdk=$SDK destination=${XCB_DEST_ARGS[*]:-device}"
set -x
xcodebuild \
  -workspace AilunSade.xcworkspace \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -sdk "$SDK" \
  -derivedDataPath "$DERIVED_DATA" \
  "${XCB_DEST_ARGS[@]}" \
  build | $FORMATTER
set +x

echo "[build.sh] Build finished. Products in: $DERIVED_DATA/Build/Products/$CONFIGURATION-$SDK"
