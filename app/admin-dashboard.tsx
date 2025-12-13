import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
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
import { getAdminDashboardMetrics, getUserPerformanceSummary } from "../services/dashboard";
import { getCurrentUser } from "../services/users";
import type {
    AdminDashboardResponse,
    AppointmentResponse,
    DashboardMetric,
    DashboardServiceRating,
    UserPerformanceSummary,
    UserProfileResponse,
} from "../types/api";

const formatRelativeDate = (input?: string | null) => {
  if (!input) {
    return "Sem feedback recente";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "Sem feedback recente";
  }

  const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
};

const formatDateTime = (input: string) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} • ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

const formatTrend = (value?: number) => {
  if (typeof value !== "number") {
    return null;
  }
  return `${Math.abs(value).toFixed(1)}%`;
};

const AdminDashboardScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [summary, setSummary] = useState<UserPerformanceSummary | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      if (!current || current.role !== "CLUB_ADMIN") {
        router.replace("/(tabs)/index");
        return false;
      }

      setProfile(current);

      const [summaryData, dashboardData] = await Promise.all([
        getUserPerformanceSummary(),
        getAdminDashboardMetrics(),
      ]);

      setSummary(summaryData);
      setDashboard(dashboardData);
      setErrorMessage(null);
      return true;
    } catch (error) {
      console.error("Failed to load admin dashboard", error);
      setErrorMessage("Nao foi possivel carregar os dados do dashboard.");
      setSummary(null);
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const stayOnPage = await loadDashboard();
    if (stayOnPage) {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [loadDashboard]);

  const overviewCards = useMemo(() => {
    if (!dashboard) {
      return [] as Array<{ id: string; label: string; value: string; icon: keyof typeof Ionicons.glyphMap }>;
    }

    return [
      {
        id: "totalMembers",
        label: "Total de membros",
        value: dashboard.totalMembers.toLocaleString("pt-BR"),
        icon: "people-outline" as const,
      },
      {
        id: "activePlans",
        label: "Planos ativos",
        value: dashboard.activePlans.toLocaleString("pt-BR"),
        icon: "medal-outline" as const,
      },
      {
        id: "upcomingAppointments",
        label: "Agendamentos futuros",
        value: dashboard.upcomingAppointments.toLocaleString("pt-BR"),
        icon: "calendar-outline" as const,
      },
      {
        id: "pendingFeedback",
        label: "Feedbacks pendentes",
        value: dashboard.pendingFeedback.toLocaleString("pt-BR"),
        icon: "chatbubbles-outline" as const,
      },
      {
        id: "satisfactionScore",
        label: "Satisfacao geral",
        value: `${dashboard.satisfactionScore.toFixed(1)} / 5`,
        icon: "happy-outline" as const,
      },
    ];
  }, [dashboard]);

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [] as Array<{ id: string; label: string; value: string; icon: keyof typeof Ionicons.glyphMap }>;
    }

    return [
      {
        id: "completed",
        label: "Concluidos",
        value: summary.completedAppointments.toLocaleString("pt-BR"),
        icon: "checkmark-done-outline" as const,
      },
      {
        id: "upcoming",
        label: "Agendados",
        value: summary.upcomingAppointments.toLocaleString("pt-BR"),
        icon: "time-outline" as const,
      },
      {
        id: "rating",
        label: "Avaliacao media",
        value: `${summary.averageRating.toFixed(1)} / 5`,
        icon: "star-outline" as const,
      },
      {
        id: "feedback",
        label: "Ultimo feedback",
        value: formatRelativeDate(summary.lastFeedbackAt),
        icon: "sparkles-outline" as const,
      },
    ];
  }, [summary]);

  const renderMetric = useCallback((metric: DashboardMetric) => {
    const trendLabel = formatTrend(metric.trend);
    const isPositive = (metric.trend ?? 0) >= 0;

    return (
      <View key={metric.id} style={styles.metricCard}>
        <Text style={styles.metricLabel}>{metric.label}</Text>
        <Text style={styles.metricValue}>
          {metric.value.toLocaleString("pt-BR")}
          {metric.unit ? <Text style={styles.metricUnit}> {metric.unit}</Text> : null}
        </Text>
        {trendLabel ? (
          <View style={[styles.metricTrend, isPositive ? styles.metricTrendUp : styles.metricTrendDown]}>
            <Ionicons
              name={isPositive ? "arrow-up" : "arrow-down"}
              size={14}
              color={isPositive ? Color.supportiveRoshi : Color.supportiveChichi}
            />
            <Text
              style={[styles.metricTrendText, isPositive ? styles.metricTrendTextUp : styles.metricTrendTextDown]}
            >
              {trendLabel}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }, []);

  const renderService = useCallback((service: DashboardServiceRating) => {
    return (
      <View key={service.service} style={styles.serviceRow}>
        <View style={styles.serviceBadge}>
          <Ionicons name="flame" size={14} color={Color.piccolo} />
        </View>
        <View style={styles.serviceTexts}>
          <Text style={styles.serviceTitle}>{service.service}</Text>
          <Text style={styles.serviceDescription}>Media {service.average.toFixed(1)} / 5</Text>
        </View>
      </View>
    );
  }, []);

  const renderAppointment = useCallback((appointment: AppointmentResponse) => {
    const info: string[] = [formatDateTime(appointment.scheduledAt)];
    if (appointment.clientId) {
      info.push(`Cliente #${appointment.clientId}`);
    }
    if (appointment.status) {
      info.push(appointment.status === "SCHEDULED" ? "Agendado" : appointment.status === "COMPLETED" ? "Concluido" : appointment.status === "CANCELED" ? "Cancelado" : appointment.status);
    }

    return (
      <View key={appointment.id} style={styles.appointmentRow}>
        <View style={styles.appointmentIcon}>
          <Ionicons name="calendar" size={16} color={Color.piccolo} />
        </View>
        <View style={styles.appointmentTexts}>
          <Text style={styles.appointmentTitle}>{appointment.serviceType ?? "Agendamento"}</Text>
          <Text style={styles.appointmentMeta}>{info.join(" • ")}</Text>
        </View>
      </View>
    );
  }, []);

  const handleNavigateToMemberArea = useCallback(() => {
    router.replace("/(tabs)/index");
  }, [router]);

  const showContent = !isLoading && dashboard;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Color.piccolo}
            colors={[Color.piccolo]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>Dashboard administrativo</Text>
            <Text style={styles.subtitle}>
              {profile?.name ? `Bem-vindo, ${profile.name}` : "Monitore a performance do clube em tempo real."}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="speedometer-outline" size={24} color={Color.piccolo} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.memberAreaButton}
          onPress={handleNavigateToMemberArea}
          activeOpacity={0.85}
        >
          <Ionicons name="swap-horizontal" size={16} color={Color.piccolo} />
          <Text style={styles.memberAreaButtonText}>Ir para area do cliente</Text>
        </TouchableOpacity>

        {errorMessage ? (
          <View style={[styles.feedbackBanner, styles.feedbackError]}>
            <Ionicons name="alert-circle-outline" size={18} color={Color.supportiveChichi} />
            <Text style={styles.feedbackText}>{errorMessage}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color={Color.piccolo} />
            <Text style={styles.loadingText}>Carregando indicadores...</Text>
          </View>
        ) : null}

        {showContent ? (
          <View style={styles.dashboardContent}>
            {overviewCards.length ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Visao geral</Text>
                <View style={styles.cardGrid}>
                  {overviewCards.map((card) => (
                    <View key={card.id} style={styles.statCard}>
                      <View style={styles.statIcon}>
                        <Ionicons name={card.icon} size={18} color={Color.piccolo} />
                      </View>
                      <Text style={styles.statLabel}>{card.label}</Text>
                      <Text style={styles.statValue}>{card.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {summaryCards.length ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Meu desempenho recente</Text>
                <View style={styles.cardGrid}>
                  {summaryCards.map((card) => (
                    <View key={card.id} style={styles.statCard}>
                      <View style={styles.statIcon}>
                        <Ionicons name={card.icon} size={18} color={Color.piccolo} />
                      </View>
                      <Text style={styles.statLabel}>{card.label}</Text>
                      <Text style={styles.statValue}>{card.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {dashboard?.metrics?.length ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Metricas principais</Text>
                <View style={styles.metricsGrid}>
                  {dashboard.metrics.map((metric) => renderMetric(metric))}
                </View>
              </View>
            ) : null}

            {dashboard?.topServices?.length ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Servicos em destaque</Text>
                <View style={styles.cardList}>
                  {dashboard.topServices.map((service) => renderService(service))}
                </View>
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Ultimos agendamentos</Text>
              {dashboard?.recentAppointments?.length ? (
                <View style={styles.cardList}>
                  {dashboard.recentAppointments.map((appointment) => renderAppointment(appointment))}
                </View>
              ) : (
                <Text style={styles.emptyState}>Nenhum atendimento registrado nas ultimas horas.</Text>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
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
    gap: Gap.gap_20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Gap.gap_16,
  },
  headerTexts: {
    flex: 1,
    gap: Gap.gap_8,
  },
  title: {
    fontSize: FontSize.fs_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  subtitle: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: Border.br_16,
    backgroundColor: "rgba(0, 78, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  memberAreaButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 78, 255, 0.24)",
    backgroundColor: "rgba(0, 78, 255, 0.06)",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
  },
  memberAreaButtonText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
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
    paddingVertical: StyleVariable.py4,
    alignItems: "center",
    gap: Gap.gap_8,
  },
  loadingText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  dashboardContent: {
    gap: Gap.gap_16,
  },
  card: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_16,
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: Gap.gap_12,
    rowGap: Gap.gap_12,
  },
  statCard: {
    width: "48%",
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py3,
    gap: Gap.gap_8,
    backgroundColor: Color.mainGohan,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: Border.br_10,
    backgroundColor: "rgba(0, 78, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  statValue: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: Gap.gap_12,
    rowGap: Gap.gap_12,
  },
  metricCard: {
    flexBasis: "48%",
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py3,
    gap: Gap.gap_8,
    backgroundColor: Color.mainGohan,
  },
  metricLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  metricValue: {
    fontSize: FontSize.fs_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  metricUnit: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  metricTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
    borderRadius: Border.br_16,
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
  },
  metricTrendUp: {
    backgroundColor: "rgba(46, 125, 50, 0.12)",
  },
  metricTrendDown: {
    backgroundColor: "rgba(255, 78, 100, 0.12)",
  },
  metricTrendText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
  },
  metricTrendTextUp: {
    color: Color.supportiveRoshi,
  },
  metricTrendTextDown: {
    color: Color.supportiveChichi,
  },
  cardList: {
    gap: Gap.gap_12,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_12,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    backgroundColor: Color.mainGohan,
  },
  serviceBadge: {
    width: 32,
    height: 32,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 78, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  serviceTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  serviceDescription: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  appointmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_12,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    backgroundColor: Color.mainGohan,
  },
  appointmentIcon: {
    width: 32,
    height: 32,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 78, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  appointmentTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  appointmentTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  appointmentMeta: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  emptyState: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
});

export default AdminDashboardScreen;
