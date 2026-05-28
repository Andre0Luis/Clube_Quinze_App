import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { registerPushToken } from "../services/notifications";
import { getAccessToken } from "../services/storage";

// Must be registered outside any component — handles FCM when app is killed/background
messaging().setBackgroundMessageHandler(async () => {});

export function usePushNotifications() {
  const router = useRouter();

  useEffect(() => {
    setupAndRegister();

    const unsubRefresh = messaging().onTokenRefresh(syncToken);

    const unsubForeground = messaging().onMessage(async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? "Agendamento";
      const body = remoteMessage.notification?.body ?? "";
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: remoteMessage.data ?? {} },
        trigger: null,
      });
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

async function setupAndRegister() {
  if (Platform.OS === "android") {
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
