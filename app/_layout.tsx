import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '../stores/useAuthStore';
import { onAuthStateChange } from '../lib/supabase';
import { AuthGuard } from '../components/AuthGuard';
import { ErrorBoundary as CustomErrorBoundary } from '../components/ErrorBoundary';
import { notificationService } from '../lib/notifications';
import * as Notifications from 'expo-notifications';
import { useGardenerStore } from '../stores/useGardenerStore';
import { gardenerService } from '../lib/ai/gardenerService';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Keep splash screen visible for 2 seconds
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [loaded]);

  // Initialize Gardener service with saved API key
  useEffect(() => {
    const openAiApiKey = useGardenerStore.getState().openAiApiKey;
    if (openAiApiKey) {
      gardenerService.updateApiKey(openAiApiKey);
    }
  }, []);

  // Set up push notifications
  useEffect(() => {
    // Register for push notifications
    notificationService.registerForPushNotifications();

    // Handle notifications when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // You can show a custom in-app notification here
      }
    );

    // Handle notification response (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const { type, conversationId, matchId } = response.notification.request.content.data as any;

      if (type === 'message' && conversationId) {
        // Navigate to chat screen
        router.push(`/chat?id=${conversationId}`);
      } else if (type === 'match' && matchId) {
        // Navigate to matches screen
        router.push('/_tabs/matches');
      } else if (type === 'super_like') {
        // Navigate to discover screen
        router.push('/_tabs');
      }
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { initialize, setSession } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    initialize();

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange((session) => {
      setSession(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialize, setSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CustomErrorBoundary>
        <AuthGuard>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="_tabs" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
              <Stack.Screen name="filters" options={{ headerShown: false }} />
              <Stack.Screen name="chat" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </AuthGuard>
      </CustomErrorBoundary>
    </GestureHandlerRootView>
  );
}
