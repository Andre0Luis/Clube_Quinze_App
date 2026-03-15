import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

let hasConfiguredNotificationHandler = false;

function ensureNotificationHandlerConfigured() {
  if (hasConfiguredNotificationHandler) {
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        // Keep both legacy and modern keys for cross-version compatibility.
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    hasConfiguredNotificationHandler = true;
  } catch (error) {
    console.warn('Falha ao configurar NotificationHandler', error);
  }
}

const isDevice = Constants?.isDevice ?? false;

// Passive: only checks current permission status, never prompts the user.
async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!isDevice) return null;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return null;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

// Active: explicitly requests permission then retrieves the push token.
// Attach this to a UI button; never call it on app startup.
export async function requestPushPermissions(): Promise<string | null> {
  if (!isDevice) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  const [lastResponse, setLastResponse] = useState<Notifications.NotificationResponse | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        ensureNotificationHandlerConfigured();
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      try {
        const token = await registerForPushNotificationsAsync();
        if (isMounted) {
          setExpoPushToken(token);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Falha ao registrar notificações');
        }
      }
    };

    setup();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setLastNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      setLastResponse(response);
    });

    return () => {
      isMounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const appVersion = Constants?.expoConfig?.version ?? Constants?.manifest?.version ?? undefined;

  return { expoPushToken, lastNotification, lastResponse, error, appVersion } as const;
}

