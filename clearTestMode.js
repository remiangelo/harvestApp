// Simple script to clear test mode data
// Run with: node clearTestMode.js

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearTestMode() {
  try {
    await AsyncStorage.removeItem('harvest-test-mode');
    await AsyncStorage.removeItem('harvest-test-user');
    console.log('Test mode data cleared successfully!');
    console.log('You can now use the app normally.');
  } catch (error) {
    console.error('Error clearing test mode:', error);
  }
}

// Note: This script won't work directly with node
// Instead, you can clear test mode by:
// 1. Using the logout button in the app
// 2. Clearing app data in device settings
// 3. Uninstalling and reinstalling the app

console.log(`
To clear test mode:
1. Open the app
2. Go to Settings
3. Tap Logout

OR

Clear app data from your device settings.
`);