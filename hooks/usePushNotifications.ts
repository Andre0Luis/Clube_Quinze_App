import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { registerPushToken } from "../services/notifications";
import { getAccessToken } from "../services/storage";

// Lazy-load Firebase and expo-notifications so the module doesn't crash in
// environments where they are unavailable (e.g. Expo Go on SDK 53+).
let messaging: typeof import("@react-native-firebase/messaging").default | null = null;
let Notifications: typeof import("expo-notifications") | null = null;

try {
  messaging = require("@react-native-firebase/messaging").default;
} catch {
  console.warn("@react-native-firebase/messaging not available. Push notifications disabled.");
}

try {
  Notifications = require("expo-notifications");
} catch {
  console.warn("expo-notifications not available. Local notifications disabled.");
}

// Must be registered outside any component — handles FCM when app is killed/background
try {
  messaging?.().setBackgroundMessageHandler(async () => {});
} catch {
  // Silently ignore if messaging is unavailable
}

export function usePushNotifications() {
  const router = useRouter();

  useEffect(() => {
    if (!messaging) return;

    registerCurrentPushToken();

    const unsubRefresh = messaging().onTokenRefresh(syncToken);

    const unsubForeground = messaging().onMessage(async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? "Agendamento";
      const body = remoteMessage.notification?.body ?? "";
      if (Notifications) {
        await Notifications.scheduleNotificationAsync({
          content: { title, body, data: remoteMessage.data ?? {} },
          trigger: null,
        });
      }
    });

    const unsubOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
      const id = remoteMessage.data?.appointmentId;
      if (id) router.push(`/appointments/${id}`);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (!remoteMessage) return;
        const id = remoteMessage.data?.appointmentId;
        if (id) router.push(`/appointments/${id}`);
      });

    return () => {
      unsubRefresh();
      unsubForeground();
      unsubOpen();
    };
  }, [router]);
}

export async function registerCurrentPushToken() {
  if (!messaging) return;

  if (Platform.OS === "android" && Notifications) {
    await Notifications.setNotificationChannelAsync("agendamentos", {
      name: "Agendamentos",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const authStatus = await messaging().requestPermission();
  const granted =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!granted) return;

  const token = await messaging().getToken();
  await syncToken(token);
}

async function syncToken(token: string) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return;
    await registerPushToken(token, Platform.OS);
  } catch (error) {
    console.error("Failed to register FCM token:", error);
  }
}
