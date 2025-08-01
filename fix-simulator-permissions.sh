#!/bin/bash

echo "Fixing iOS Simulator linking permissions..."

# Find all simulator devices
SIMULATOR_PATH="$HOME/Library/Developer/CoreSimulator/Devices"

# Create the required plist for each simulator
for device_dir in "$SIMULATOR_PATH"/*; do
    if [ -d "$device_dir" ] && [ "$device_dir" != "$SIMULATOR_PATH/device_set.plist" ]; then
        DEVICE_ID=$(basename "$device_dir")
        PREF_DIR="$device_dir/data/Library/Preferences"
        PLIST_FILE="$PREF_DIR/com.apple.launchservices.schemeapproval.plist"
        
        # Create preferences directory if it doesn't exist
        if [ ! -d "$PREF_DIR" ]; then
            echo "Creating preferences directory for device: $DEVICE_ID"
            mkdir -p "$PREF_DIR"
        fi
        
        # Create the plist file if it doesn't exist
        if [ ! -f "$PLIST_FILE" ]; then
            echo "Creating linking permissions for device: $DEVICE_ID"
            cat > "$PLIST_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.CoreSimulator.CoreSimulatorBridge--exp+harvestapp-harvestapp</key>
    <dict>
        <key>LastUsedDate</key>
        <date>2025-01-01T00:00:00Z</date>
    </dict>
</dict>
</plist>
EOF
        fi
    fi
done

# Reset simulator permissions
echo "Resetting simulator permissions..."
xcrun simctl privacy booted reset all 2>/dev/null || true

# Clear Expo cache
echo "Clearing Expo cache..."
rm -rf ~/.expo/ios-simulator-app-cache 2>/dev/null || true

echo "Done! Try running 'expo start' again."
echo ""
echo "If you still have issues:"
echo "1. Close all simulators"
echo "2. Run: xcrun simctl shutdown all"
echo "3. Run: xcrun simctl erase all"
echo "4. Restart your Mac"
echo "5. Launch a fresh simulator and try again"