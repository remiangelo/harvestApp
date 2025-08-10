export default {
  expo: {
    name: 'Harvest',
    slug: 'harvest',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'harvest',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#A0354E',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.harvest.app',
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        NSCameraUsageDescription: 'Harvest needs access to your camera to take profile photos.',
        NSPhotoLibraryUsageDescription:
          'Harvest needs access to your photo library to select profile photos.',
        NSLocationWhenInUseUsageDescription:
          'Harvest uses your location to show you potential matches nearby.',
      },
      associatedDomains: ['applinks:harvest-app.com'],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#A0354E',
      },
      package: 'com.harvest.app',
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'server',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#A0354E',
          defaultChannel: 'default',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow Harvest to use your location to find matches nearby.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with matches.',
          cameraPermission: 'The app accesses your camera to let you take photos for your profile.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: '4bf484c4-576a-4d5a-8373-1c854bb46ea7', // Replace with your EAS project ID
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    updates: {
      url: 'https://u.expo.dev/4bf484c4-576a-4d5a-8373-1c854bb46ea7', // Replace with your project ID
      fallbackToCacheTimeout: 30000,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
};
