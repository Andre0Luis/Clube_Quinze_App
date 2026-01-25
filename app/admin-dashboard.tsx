import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Border,
  Color,
  FontFamily,
  FontSize,
  Gap,
  Padding,
  StyleVariable,
} from "../GlobalStyles";
import { getAdminDashboardMetrics } from "../services/dashboard";
import { getCurrentUser } from "../services/users";
import type {
  AdminDashboardResponse,
  UserProfileResponse,
} from "../types/api";

const AdminDashboardScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    const clearStoredTokens = async () => {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    };

    try {
      const current = await getCurrentUser();
      if (!current || current.role !== "CLUB_ADMIN") {
        router.replace("/");
        return false;
      }

      setProfile(current);

      const dashboardData = await getAdminDashboardMetrics();

      setDashboard(dashboardData);
      setErrorMessage(null);
      return true;
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 401) {
        await clearStoredTokens();
        router.replace("/login");
        return false;
      }

      console.error("Failed to load admin dashboard", error);
      setErrorMessage("Nao foi possivel carregar os dados do dashboard.");
      setDashboard(null);
      return true;
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setIsLoading(true);
      const stayOnPage = await loadDashboard();
      if (!isMounted || !stayOnPage) {
        return;
      }
      setIsLoading(false);
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [loadDashboard]);

  const metricValue = useCallback(
    (id: string, fallback = 0) => dashboard?.metrics?.find((metric) => metric.id === id)?.value ?? fallback,
    [dashboard?.metrics],
  );

  const membersStandard = useMemo(() => {
    const total = dashboard?.totalMembers ?? 0;
    return metricValue("members_standard", Math.max(0, Math.round(total * 0.7)));
  }, [dashboard?.totalMembers, metricValue]);

  const membersSelect = useMemo(() => {
    const total = dashboard?.totalMembers ?? 0;
    const fromMetric = dashboard?.metrics?.find((metric) => metric.id === "members_select")?.value;
    if (typeof fromMetric === "number" && !Number.isNaN(fromMetric)) {
      return fromMetric;
    }
    const fallback = total - membersStandard;
    return Math.max(0, fallback);
  }, [dashboard?.metrics, dashboard?.totalMembers, membersStandard]);

  const upcomingPayments = useMemo(
    () => metricValue("payments_upcoming", metricValue("payments_due", 0)),
    [metricValue],
  );

  const handleManageMembers = useCallback(
    (tier: "CLUB_15" | "QUINZE_SELECT") => {
      router.push({ pathname: "/admin-members", params: { tier } });
    },
    [router],
  );

  const handleNavigateToMemberArea = useCallback(() => {
    router.replace("/");
  }, [router]);

  useEffect(() => {
    const onBackPress = () => {
      handleNavigateToMemberArea();
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => {
      subscription.remove();
    };
  }, [handleNavigateToMemberArea]);

  const greetingName = useMemo(() => {
    if (profile?.name && profile.name.trim().length > 0) {
      return profile.name.split(" ")[0];
    }
    return "Quinze";
  }, [profile?.name]);

  const navItems = useMemo(
    () => [
      { id: "home", label: "Home", icon: "home" as const, path: "/admin-dashboard" },
      {
        id: "agenda",
        label: "Agenda",
        icon: "calendar-outline" as const,
        path: "/admin-agenda",
      },
      { id: "community", label: "Comunidade", icon: "people-outline" as const, path: "/community" },
      { id: "profile", label: "Perfil", icon: "person-outline" as const, path: "/(tabs)/profile" },
    ],
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.brandCluster}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleNavigateToMemberArea}
              accessibilityRole="button"
              accessibilityLabel="Voltar para inicio"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={20} color={Color.hit} />
            </TouchableOpacity>
            <View style={styles.brandLeft}>
              <View style={styles.brandLogo}>
                <Text style={styles.brandLogoText}>CQ</Text>
              </View>
              <Text style={styles.brandName}>Clube Quinze</Text>
            </View>
          </View>
          <Ionicons name="notifications-outline" size={20} color={Color.hit} />
        </View>

        <Text style={styles.greeting}>Ola, {greetingName} 👋</Text>

        {isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color={Color.piccolo} />
          </View>
        ) : null}

        {errorMessage ? (
          <View style={[styles.feedbackBanner, styles.feedbackError]}>
            <Ionicons name="alert-circle-outline" size={18} color={Color.supportiveChichi} />
            <Text style={styles.feedbackText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.9}
            onPress={() => handleManageMembers("CLUB_15")}
          >
            <View style={styles.metricHeader}>
              <View style={styles.metricPillPrimary}>
                <Ionicons name="people-outline" size={16} color={Color.mainGoten} />
                <Text style={styles.metricPillText}>Plano Standard</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{membersStandard.toLocaleString("pt-BR")}</Text>
            <Text style={styles.metricSubtitle}>Membros ativos</Text>
            <View style={styles.metricFooter}>
              <Text style={styles.metricLink}>Ver membros</Text>
              <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.9}
            onPress={() => handleManageMembers("QUINZE_SELECT")}
          >
            <View style={styles.metricHeader}>
              <View style={styles.metricPillAccent}>
                <Ionicons name="star-outline" size={16} color={"#0E1D2F"} />
                <Text style={styles.metricPillTextDark}>Quinze Select</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{membersSelect.toLocaleString("pt-BR")}</Text>
            <Text style={styles.metricSubtitle}>Membros ativos</Text>
            <View style={styles.metricFooter}>
              <Text style={styles.metricLink}>Ver membros</Text>
              <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.9}
            onPress={() => router.push("/admin-agenda")}
          >
            <View style={styles.metricHeader}>
              <View style={styles.metricPillNeutral}>
                <Ionicons name="calendar-outline" size={16} color={Color.piccolo} />
                <Text style={styles.metricPillTextNeutral}>Meus agendamentos</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{(dashboard?.upcomingAppointments ?? 0).toLocaleString("pt-BR")}</Text>
            <Text style={styles.metricSubtitle}>Atendimentos proximos</Text>
            <View style={styles.metricFooter}>
              <Text style={styles.metricLink}>Gerenciar agenda</Text>
              <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.9}
            onPress={() => router.push("/profile/plans")}
          >
            <View style={styles.metricHeader}>
              <View style={styles.metricPillNeutral}>
                <Ionicons name="card-outline" size={16} color={Color.piccolo} />
                <Text style={styles.metricPillTextNeutral}>Proximos pagamentos</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{upcomingPayments.toLocaleString("pt-BR")}</Text>
            <Text style={styles.metricSubtitle}>Cobrancas previstas</Text>
            <View style={styles.metricFooter}>
              <Text style={styles.metricLink}>Ver detalhes</Text>
              <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <Ionicons name="people-outline" size={22} color={Color.hit} />
            <Text style={styles.communityTitle}>Comunidade Quinze</Text>
          </View>
          <Text style={styles.communitySubtitle}>Descubra as ultimas novidades agora</Text>
          <TouchableOpacity
            style={styles.communityCta}
            onPress={() => router.push("/community")}
            activeOpacity={0.85}
          >
            <Text style={styles.communityCtaText}>Entrar</Text>
            <Ionicons name="arrow-forward" size={16} color={Color.hit} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.navbar}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() =>
                item.params
                  ? router.replace({ pathname: item.path, params: item.params })
                  : router.replace(item.path)
              }
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? Color.piccolo : Color.mainTrunks}
              />
              <Text style={[styles.navLabel, isActive ? styles.navLabelActive : null]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingVertical: Padding.padding_24,
    paddingBottom: 120,
    gap: Gap.gap_20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Border.br_24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    marginRight: Gap.gap_8,
  },
  brandLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_12,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: Border.br_24,
    backgroundColor: "#0E1D2F",
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogoText: {
    color: Color.mainGoten,
    fontFamily: FontFamily.dMSansBold,
    fontSize: FontSize.fs_12,
  },
  brandName: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  greeting: {
    fontSize: FontSize.fs_20,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
    borderRadius: Border.br_16,
    borderWidth: 1,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
  },
  feedbackError: {
    borderColor: Color.supportiveChichi,
    backgroundColor: "rgba(255, 78, 100, 0.08)",
  },
  feedbackText: {
    flex: 1,
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  loadingWrapper: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py3,
    alignItems: "center",
    gap: Gap.gap_8,
  },
  gridRow: {
    flexDirection: "row",
    gap: Gap.gap_12,
  },
  metricCard: {
    flex: 1,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_6,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricPillPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_58,
    backgroundColor: Color.piccolo,
  },
  metricPillAccent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_58,
    backgroundColor: "#F4D35E",
  },
  metricPillNeutral: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_58,
    backgroundColor: "#EEF5FF",
  },
  metricPillText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  metricPillTextDark: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: "#0E1D2F",
  },
  metricPillTextNeutral: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  metricValue: {
    fontSize: FontSize.fs_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  metricSubtitle: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  metricFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
    marginTop: Gap.gap_6,
  },
  metricLink: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
    textDecorationLine: "underline",
  },
  communityCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_8,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  communityTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  communitySubtitle: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  communityCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
  },
  communityCtaText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
    textDecorationLine: "underline",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderTopWidth: 1,
    borderTopColor: "#E6EAF1",
    backgroundColor: Color.mainGoten,
  },
  navItem: {
    alignItems: "center",
    gap: Gap.gap_4,
  },
  navLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  navLabelActive: {
    color: Color.piccolo,
    fontFamily: FontFamily.dMSansBold,
  },
});

export default AdminDashboardScreen;
