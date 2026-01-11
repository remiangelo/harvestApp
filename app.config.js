export default {
  expo: {
    name: 'Harvest',
    slug: 'harvest',
    version: '1.4.19',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'harvestapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#EB1E66',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.harvest.harvestdating',
      buildNumber: '55',
      appleTeamId: 'L3P46Q9398',
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
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#EB1E66',
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
          color: '#EB1E66',
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
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jutzlxdboayvmcuqwodn.supabase.co',
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dHpseGRib2F5dm1jdXF3b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTg4MTksImV4cCI6MjA2ODQ5NDgxOX0.SpsUKEH_pxCWVqoVYTsVOz9ULS9oAoz40CqMK-WJG4g',
      openAiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
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
