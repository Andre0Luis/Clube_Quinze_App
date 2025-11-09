
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../components/Card";
import Card1 from "../../components/Card1";
import FrameComponent from "../../components/FrameComponent";
import FrameComponent1 from "../../components/FrameComponent1";
import {
  Border,
  Color,
  FontFamily,
  FontSize,
  Gap,
  Padding,
  StyleVariable,
} from "../../GlobalStyles";
import api from "../../services/api";
import { logout as logoutService } from "../../services/auth";

interface DecodedToken {
  name: string;
}

interface UserProfile {
  name?: string;
}

const quickActions = [
  { label: "Agendar horário", icon: "calendar-outline", href: "/schedule" },
  {
    label: "Meus agendamentos",
    icon: "list-outline",
    href: "/appointments",
  },
] as const;

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        return;
      }

      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken?.name && isMounted) {
          setUserName(decodedToken.name);
        }

        const { data } = await api.get<UserProfile>("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data?.name && isMounted) {
          setUserName(data.name);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (refreshToken) {
        await logoutService(refreshToken);
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      setUserName("");
      router.replace("/login");
    }
  }, [router]);

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
  );

  const displayName = useMemo(() => userName || "Convidado", [userName]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <FrameComponent1 userName={displayName} onPressNotifications={() => handleNavigate("/notifications")} />

        <View style={styles.section}>
          <FrameComponent />
        </View>

        <View style={styles.quickActionsWrapper}>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickActionCard}
                activeOpacity={0.9}
                onPress={() => handleNavigate(action.href)}
              >
                <Card
                  buttonText={action.label}
                  size="32px"
                  time="calendar"
                  type="stroke"
                  calendar={
                    <Ionicons
                      name={action.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={Color.piccolo}
                    />
                  }
                  timePosition="relative"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Card1 onPress={() => handleNavigate("/community")} />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Sair do aplicativo"
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={Color.mainGoten} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  content: {
    paddingVertical: Padding.padding_24,
    paddingHorizontal: Padding.padding_24,
    gap: Gap.gap_24,
    paddingBottom: 120,
  },
  section: {
    alignItems: "center",
    gap: Gap.gap_16,
  },
  sectionTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  quickActionsWrapper: {
    marginTop: Gap.gap_8,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    columnGap: Gap.gap_16,
    marginHorizontal: Padding.padding_8,
  },
  quickActionCard: {
    width: "47%",
    marginHorizontal: Gap.gap_4 / 2,
    borderRadius: Border.br_16,
    overflow: "visible",
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: Color.mainGohan,
  },
  logoutButton: {
    position: "absolute",
    right: Padding.padding_24,
    top: Padding.padding_24,
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_24,
    backgroundColor: Color.piccolo,
  },
  logoutText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
