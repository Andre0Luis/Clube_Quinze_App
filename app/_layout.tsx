import * as Linking from "expo-linking";
import { SplashScreen, Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import "react-native-reanimated";
import MenuDeNavegao from "../components/MenuDeNavegao";
import { getCurrentUser } from "../services/users";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isAdmin, setIsAdmin] = useState(false);

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
    SplashScreen.preventAutoHideAsync();
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveRole = async () => {
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
  }, []);

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
    return !(
      pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/reset-password")
    );
  }, [pathname]);

  const handleSelectTab = (key: string) => {
    switch (key) {
      case "home":
        router.replace("/");
        break;
      case "reserve":
        router.replace(isAdmin ? "/admin-agenda" : "/reserve");
        break;
      case "community":
        router.replace("/community");
        break;
      case "profile":
        router.replace("/profile");
        break;
      default:
        router.replace("/");
    }
  };

  return (
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
