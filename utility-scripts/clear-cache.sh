#!/bin/bash

echo "🧹 Clearing all React Native and Expo caches..."

# Kill any running Metro bundler processes
echo "Killing Metro bundler..."
pkill -f "metro" || true

# Clear watchman watches
echo "Clearing watchman..."
watchman watch-del-all 2>/dev/null || true

# Clear React Native caches
echo "Clearing React Native caches..."
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear Expo cache
echo "Clearing Expo cache..."
expo doctor --fix-dependencies || true
rm -rf .expo 2>/dev/null || true

# Clear iOS build artifacts (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Clearing iOS build artifacts..."
    cd ios 2>/dev/null && pod cache clean --all 2>/dev/null || true
    cd ..
    rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
fi

# Clear Android build artifacts
echo "Clearing Android build artifacts..."
cd android 2>/dev/null && ./gradlew clean 2>/dev/null || true
cd ..

# Remove node_modules and reinstall
echo "Removing node_modules..."
rm -rf node_modules

echo "Reinstalling dependencies..."
npm install

echo "✅ All caches cleared! Now run: expo start --clear"