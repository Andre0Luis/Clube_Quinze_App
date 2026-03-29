import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { registerPushToken } from "../services/notifications";
import { getAccessToken } from "../services/storage";

export function usePushNotifications() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        handleRegisterToken(token);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.appointmentId) {
          router.push(`/appointments/${data.appointmentId}`);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  const handleRegisterToken = async (token: string) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      await registerPushToken(token, Platform.OS);
      console.log("Push token registered successfully");
    } catch (error) {
      console.error("Failed to register push token:", error);
    }
  };
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("agendamentos", {
      name: "Agendamentos",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    // Replace with your actual project ID from app.json
    const projectId = "65023eb1-bfbe-480c-9781-4441576253d9";

    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    return token;
  } else {
    console.log("Must use physical device for Push Notifications");
  }
}
