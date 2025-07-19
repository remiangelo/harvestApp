#!/bin/bash

echo "🔧 Fixing Simulator Issues..."

# Kill any running Metro processes
echo "Stopping Metro bundler..."
pkill -f "metro"
pkill -f "react-native"

# Clear caches
echo "Clearing caches..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf ~/.expo/cache

# Clear watchman
echo "Clearing watchman..."
watchman watch-del-all 2>/dev/null || true

# Reset problematic simulator
echo "Resetting simulator..."
xcrun simctl shutdown all
xcrun simctl erase all

echo "✅ Done! Now try running: npx expo start -c"