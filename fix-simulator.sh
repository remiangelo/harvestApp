#!/bin/bash

echo "Fixing iOS Simulator permissions issue..."

# 1. Close all simulators
echo "1. Closing all simulators..."
xcrun simctl shutdown all

# 2. Reset the problematic simulator
echo "2. Resetting simulator..."
xcrun simctl erase B613E81B-F7CA-4ADD-AC16-6F1F60703E05 || echo "Could not reset specific simulator"

# 3. Kill any hanging simulator processes
echo "3. Killing simulator processes..."
killall Simulator 2>/dev/null || echo "No simulator process found"

# 4. Clear Expo cache
echo "4. Clearing Expo cache..."
rm -rf ~/.expo
npx expo start -c

echo "Fix complete! Try running 'npx expo start' again."
echo ""
echo "If the issue persists, try these manual steps:"
echo "1. Open Xcode"
echo "2. Go to Window > Devices and Simulators"
echo "3. Delete the problematic simulator"
echo "4. Create a new simulator"
echo "5. Run 'npx expo start' and press 'i' to open in the new simulator"