import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Register for push notifications
  async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: '4bf484c4-576a-4d5a-8373-1c854bb46ea7', // Replace with your project ID
        })
      ).data;

      this.pushToken = token;
      await this.savePushToken(token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Save push token to database
  private async savePushToken(token: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({ push_token: token })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving push token:', error);
      }
    } catch (error) {
      console.error('Error in savePushToken:', error);
    }
  }

  // Send local notification for new match
  async sendMatchNotification(matchName: string, profileImage?: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "It's a Match! 🎉",
        body: `You and ${matchName} liked each other!`,
        data: { type: 'match', matchName },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  }

  // Send local notification for new message
  async sendMessageNotification(senderName: string, message: string, conversationId: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: senderName,
        body: message,
        data: { type: 'message', conversationId },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  }

  // Send local notification for super like
  async sendSuperLikeNotification(userName: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Someone Super Liked You! 💝',
        body: `${userName} really wants to connect with you!`,
        data: { type: 'super_like', userName },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  }

  // Handle notification response (when user taps notification)
  setupNotificationListeners(navigation: any) {
    // This listener is fired whenever a notification is received while the app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const { type, conversationId } = response.notification.request.content.data;

      if (type === 'message' && conversationId) {
        // Navigate to chat screen
        navigation.navigate('chat', { id: conversationId });
      } else if (type === 'match') {
        // Navigate to matches screen
        navigation.navigate('_tabs/matches');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  // Get push token
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Request notification permissions
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  // Get notification permissions status
  async getPermissionsStatus() {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Schedule a reminder notification
  async scheduleReminder(title: string, body: string, seconds: number) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: seconds,
    });
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get badge count
  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  // Set badge count
  async setBadgeCount(count: number) {
    return await Notifications.setBadgeCountAsync(count);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
