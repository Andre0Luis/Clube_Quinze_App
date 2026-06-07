import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { registerPushToken } from "../services/notifications";
import { getAccessToken } from "../services/storage";

// Background handler — deve estar fora de qualquer componente.
messaging().setBackgroundMessageHandler(async () => {});

export function usePushNotifications() {
  const router = useRouter();

  useEffect(() => {
    const fcm = messaging();

    // Respeita a preferência do usuário (toggle em Configurações → Notificações).
    SecureStore.getItemAsync("push_notifications_enabled").then((pref) => {
      if (pref !== "false") {
        void registerCurrentPushToken();
      }
    });

    const unsubRefresh = fcm.onTokenRefresh(syncToken);

    const unsubForeground = fcm.onMessage(async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? "Agendamento";
      const body = remoteMessage.notification?.body ?? "";
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: remoteMessage.data ?? {} },
        trigger: null,
      });
    });

    const unsubOpen = fcm.onNotificationOpenedApp((remoteMessage) => {
      const id = remoteMessage.data?.appointmentId;
      if (id) router.push(`/appointments/${id}`);
    });

    fcm.getInitialNotification().then((remoteMessage) => {
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

export async function registerCurrentPushToken(): Promise<boolean> {
  // Android 13+ (API 33+) requer permissão explícita POST_NOTIFICATIONS do sistema
  // antes que qualquer push possa ser exibido. Sem isso, messaging().requestPermission()
  // retorna "authorized" mas as notificações são silenciosamente bloqueadas.
  if (Platform.OS === "android" && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("agendamentos", {
      name: "Agendamentos",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const fcm = messaging();
  const authStatus = await fcm.requestPermission();
  const granted =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!granted) return false;

  try {
    // iOS: é OBRIGATÓRIO registrar o device com APNs antes de getToken().
    // Sem isso, getToken() lança messaging/unregistered e o token nunca é gerado —
    // por isso o push não chegava no iOS (no Android isso não é necessário).
    if (Platform.OS === "ios") {
      if (!fcm.isDeviceRegisteredForRemoteMessages) {
        await fcm.registerDeviceForRemoteMessages();
      }
      // garante que o APNs token já está disponível antes de pedir o FCM token
      await fcm.getAPNSToken();
    }

    const token = await fcm.getToken();
    await syncToken(token);
    return true;
  } catch (error) {
    // No simulador iOS (sem APNs) isso falha — esperado. Em device real, com o
    // APNs key configurado no Firebase, funciona.
    console.warn("FCM getToken falhou (simulador iOS ou APNs ausente):", error);
    return false;
  }
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

export type PushPermissionStatus = "granted" | "denied" | "undetermined" | "unavailable";

/** Status atual da permissão de notificação do SO (sem solicitar). */
export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  try {
    const status = await messaging().hasPermission();
    if (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      return "granted";
    }
    if (status === messaging.AuthorizationStatus.DENIED) return "denied";
    return "undetermined";
  } catch {
    return "undetermined";
  }
}

/** Solicita permissão e, se concedida, registra o token. Retorna true se ativou. */
export async function enablePushNotifications(): Promise<boolean> {
  return registerCurrentPushToken();
}

/** Apaga o token FCM do device (para de receber). */
export async function deleteCurrentPushToken(): Promise<void> {
  try {
    await messaging().deleteToken();
  } catch (error) {
    console.warn("Failed to delete FCM token:", error);
  }
}
