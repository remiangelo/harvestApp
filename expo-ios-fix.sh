#!/bin/bash

echo "Alternative Expo iOS fix..."

# 1. Kill any existing Expo processes
pkill -f expo || true
pkill -f "react-native" || true

# 2. Clear all caches
rm -rf ~/.expo
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf node_modules/.cache
rm -rf .expo

# 3. Open simulator manually first
open -a Simulator

# 4. Wait for simulator to fully boot
echo "Waiting for simulator to boot..."
sleep 5

# 5. Install Expo Go directly
echo "Installing Expo Go on simulator..."
xcrun simctl install booted ~/.expo/ios-simulator-app-cache/Exponent-*.app 2>/dev/null || {
    echo "Expo Go not cached. Starting Expo to download it..."
    npx expo start --ios
}

echo ""
echo "If you still see errors:"
echo "1. Open Simulator app manually"
echo "2. Go to Device > Erase All Content and Settings"
echo "3. Wait for simulator to restart"
echo "4. Run: npx expo start --ios"