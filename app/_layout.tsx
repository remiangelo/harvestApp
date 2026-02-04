import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '../stores/useAuthStore';
import { onAuthStateChange, supabase } from '../lib/supabase';
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
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMSerifDisplay_400Regular,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    OrangeSquash: require('../assets/fonts/OrangeSquash.ttf'),
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
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
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
  const { initialize, setSession, setUser, loadProfile } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    initialize();

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange((session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialize, setSession, setUser, loadProfile]);

  // Handle deep links for OAuth callback
  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep link events while app is open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    console.log('Deep link received:', url);

    // Check if this is an OAuth callback
    if (url.includes('harvestapp://auth/callback')) {
      try {
        console.log('Processing OAuth callback...');

        // Supabase uses URL hash fragments for OAuth, not query params
        // Format: harvestapp://auth/callback#access_token=xxx&refresh_token=yyy
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        // Try hash fragment first (most common for OAuth)
        if (url.includes('#')) {
          const hashPart = url.split('#')[1];
          const params = new URLSearchParams(hashPart);
          accessToken = params.get('access_token');
          refreshToken = params.get('refresh_token');
          console.log('Found tokens in hash fragment');
        }

        // Fallback to query params
        if (!accessToken) {
          const urlObj = new URL(url.replace('harvestapp://', 'https://'));
          accessToken = urlObj.searchParams.get('access_token');
          refreshToken = urlObj.searchParams.get('refresh_token');
          console.log('Found tokens in query params');
        }

        console.log('Has access token:', !!accessToken);
        console.log('Has refresh token:', !!refreshToken);

        if (accessToken && refreshToken) {
          console.log('Setting session with OAuth tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session from OAuth:', error);
            // Reset loading state
            setSession(null);
          } else if (data.session && data.user) {
            console.log('OAuth session set successfully!');
            setSession(data.session);
            setUser(data.user);

            // CRITICAL: Ensure profile exists for OAuth user
            try {
              console.log('[OAuth Callback] Ensuring profile exists for user:', data.user.id);
              const { ensureProfileExists } = await import('../lib/profileHelpers');
              await ensureProfileExists(data.user.id);
              console.log('[OAuth Callback] Profile confirmed, loading full profile...');
              await loadProfile(data.user.id);
              console.log('[OAuth Callback] Profile loaded successfully');

              // CRITICAL: Wait for state to propagate to AuthGuard
              // This prevents race condition where AuthGuard checks profile before it's updated
              console.log('[OAuth Callback] Waiting for state propagation...');
              await new Promise((resolve) => setTimeout(resolve, 300));
              console.log('[OAuth Callback] State propagation complete');
            } catch (error) {
              console.error('[OAuth Callback] Failed to ensure profile:', error);
              // Don't block login, but log the error
            }
          }
        } else {
          console.error('No OAuth tokens found in URL');
          // Reset loading state
          setSession(null);
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        // Reset loading state
        setSession(null);
      }
    }
  };

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
              <Stack.Screen name="subscriptions" options={{ headerShown: false }} />
              <Stack.Screen name="help-center" options={{ headerShown: false }} />
              <Stack.Screen name="chat" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </AuthGuard>
      </CustomErrorBoundary>
    </GestureHandlerRootView>
  );
}
