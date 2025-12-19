import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from './api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token obtained:', token);
    
    // Send token to backend
    try {
      await api.updatePushToken(token);
      console.log('Push token sent to backend successfully');
    } catch (error) {
      console.error('Failed to update push token:', error);
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3AFF6E',
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

// Listen for notifications when app is in foreground
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
) {
  // Handle notifications received while app is foregrounded
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received in foreground:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    },
  );

  // Handle notification taps
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // Navigate to event if it's an invitation
      // Note: Router navigation should be handled in the component that uses this
      if (data?.type === 'invitation' && data?.eventId) {
        console.log('Should navigate to event:', data.eventId);
      }
    },
  );

  return {
    foregroundSubscription,
    responseSubscription,
    remove: () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    },
  };
}

