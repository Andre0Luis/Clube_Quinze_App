import * as Linking from "expo-linking";
import { SplashScreen, Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import "react-native-reanimated";
import ErrorBoundary from "../components/ErrorBoundary";
import MenuDeNavegao from "../components/MenuDeNavegao";
import { getCurrentUser } from "../services/users";

// Lazy-load expo-notifications so it doesn't crash in Expo Go (SDK 53+)
let Notifications: typeof import("expo-notifications") | null = null;
try {
  Notifications = require("expo-notifications");
} catch {
  console.warn("expo-notifications not available (Expo Go on SDK 53+). Push notifications disabled.");
}

import { usePushNotifications } from "../hooks/usePushNotifications";

// Controls how locally-scheduled notifications appear while the app is in foreground
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [isAdmin, setIsAdmin] = useState(false);

  usePushNotifications();

  useEffect(() => {
    const handleIncomingUrl = (url?: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      const path = parsed.path ?? "";
      if (path.startsWith("reset-password")) {
        const tokenParam = parsed.queryParams?.token;
        const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
        const target = token
          ? `/reset-password?token=${encodeURIComponent(String(token))}`
          : "/reset-password";
        router.replace(target);
      }
    };

    Linking.getInitialURL()
      .then(handleIncomingUrl)
      .catch(() => {});
    const subscription = Linking.addEventListener("url", (event) => {
      handleIncomingUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveRole = async () => {
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/reset-password")
      ) {
        if (isMounted) {
          setIsAdmin(false);
        }
        return;
      }

      try {
        const user = await getCurrentUser();
        if (isMounted) {
          setIsAdmin(user?.role === "CLUB_ADMIN");
        }
      } catch (error) {
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    };

    resolveRole();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const activeKey = useMemo(() => {
    if (pathname.startsWith("/community")) {
      return "community";
    }
    if (pathname.startsWith("/profile")) {
      return "profile";
    }
    if (
      pathname.startsWith("/reserve") ||
      pathname.startsWith("/schedule") ||
      pathname.startsWith("/appointments")
    ) {
      return "reserve";
    }
    return "home";
  }, [pathname]);

  const showNav = useMemo(() => {
    const firstSegment = segments[0];

    // Root index / splash loading: pathname is "/" but NOT inside (tabs)
    if (pathname === "/" && firstSegment !== "(tabs)") return false;
    if (pathname === "/index") return false;
    // On Android, segments may resolve before pathname updates
    if (!firstSegment || firstSegment === "index") return false;

    return !(
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/splash" ||
      pathname.startsWith("/reset-password")
    );
  }, [pathname, segments]);

  const handleSelectTab = (key: string) => {
    switch (key) {
      case "home":
        router.replace("/(tabs)");
        break;
      case "reserve":
        router.replace(isAdmin ? "/admin-agenda" : "/(tabs)/reserve");
        break;
      case "community":
        router.replace("/(tabs)/community");
        break;
      case "profile":
        router.replace("/(tabs)/profile");
        break;
      default:
        router.replace("/(tabs)");
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: showNav ? styles.stackContent : undefined,
          }}
        />
        {showNav ? (
          <View
            style={[styles.navWrapper, { paddingBottom: insets.bottom + 16 }]}
          >
            <MenuDeNavegao activeKey={activeKey} onSelectTab={handleSelectTab} />
          </View>
        ) : null}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContent: {
    paddingBottom: 96,
  },
  navWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "transparent",
  },
});
