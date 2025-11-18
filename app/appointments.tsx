import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
    LineHeight,
    Padding,
    StyleVariable,
} from "../GlobalStyles";
import { listMyAppointments } from "../services/appointments";
import type { AppointmentResponse } from "../types/api";

const TABS = [
  { id: "upcoming", label: "Meus Agendamentos" },
  { id: "history", label: "Historico" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const formatAppointmentDate = (input: string) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} • ${day} de ${month} • ${time}`;
};

const statusStyles: Record<string, { label: string; background: string; text: string }> = {
  SCHEDULED: { label: "Agendado", background: "#1B9984", text: "#FFFFFF" },
  COMPLETED: { label: "Concluido", background: "#4CAF50", text: "#FFFFFF" },
  CANCELED: { label: "Cancelado", background: "#D7263D", text: "#FFFFFF" },
};

const getStatusStyle = (status?: string) => statusStyles[status ?? ""] ?? {
  label: status ? status : "Desconhecido",
  background: Color.mainBeerus,
  text: Color.mainBulma,
};

const isWithinNext30Days = (appointment: AppointmentResponse) => {
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + 30);

  const scheduled = new Date(appointment.scheduledAt);
  if (Number.isNaN(scheduled.getTime())) {
    return false;
  }

  return (
    appointment.status === "SCHEDULED" &&
    scheduled.getTime() >= now.getTime() &&
    scheduled.getTime() <= limit.getTime()
  );
};

const isHistoryEntry = (appointment: AppointmentResponse) => {
  if (appointment.status !== "SCHEDULED") {
    return true;
  }
  const now = new Date();
  const scheduled = new Date(appointment.scheduledAt);
  return Number.isNaN(scheduled.getTime()) ? false : scheduled.getTime() < now.getTime();
};

const sortByDateAscending = (a: AppointmentResponse, b: AppointmentResponse) =>
  new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();

export default function AppointmentsScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string | string[] }>();

  const resolvedTabParam = Array.isArray(tab) ? tab[0] : tab;
  const paramTab: TabId = resolvedTabParam === "history" ? "history" : "upcoming";

  const [activeTab, setActiveTab] = useState<TabId>(paramTab);
  const hasInteractedRef = useRef(false);
  const prevParamRef = useRef<TabId>(paramTab);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);

  const handleLoadAppointments = useCallback(() => {
    let isActive = true;

    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const page = await listMyAppointments({ size: 50 });
        if (!isActive) {
          return;
        }
        setAppointments(page.content ?? []);
      } catch (error) {
        if (!isActive) {
          return;
        }
        Alert.alert(
          "Nao foi possivel carregar",
          "Verifique sua conexao e tente novamente.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchAppointments();

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(handleLoadAppointments);

  useEffect(() => {
    if (paramTab !== prevParamRef.current) {
      prevParamRef.current = paramTab;
      hasInteractedRef.current = false;
    }

    if (!hasInteractedRef.current && activeTab !== paramTab) {
      setActiveTab(paramTab);
    }
  }, [activeTab, paramTab]);

  const upcomingAppointments = useMemo(() =>
    appointments.filter(isWithinNext30Days).sort(sortByDateAscending),
  [appointments]);

  const historyAppointments = useMemo(() =>
    appointments.filter(isHistoryEntry).sort(sortByDateAscending).reverse(),
  [appointments]);

  const activeAppointments = activeTab === "upcoming" ? upcomingAppointments : historyAppointments;
  const nextAppointmentId = upcomingAppointments[0]?.id;

  const subtitle =
    activeTab === "upcoming"
      ? "Agendamentos dos proximos 30 dias"
      : "Ultimos agendamentos";

  const handleCardPress = (appointment: AppointmentResponse) => {
    router.push({
      pathname: "/appointments/[appointmentId]",
      params: { appointmentId: String(appointment.id) },
    });
  };

  const handleTabChange = (tabId: TabId) => {
    hasInteractedRef.current = true;
    setActiveTab(tabId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSpacer}>
        <View style={styles.tabSwitcher}>
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}
                onPress={() => handleTabChange(tab.id)}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>

        {isLoading ? (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="small" color={Color.piccolo} />
          </View>
        ) : activeAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={activeTab === "upcoming" ? "information-circle-outline" : "calendar-outline"}
              size={32}
              color={Color.mainBeerus}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === "upcoming" ? "Sem agendamentos" : "Nenhum agendamento passado"}
            </Text>
            <Text style={styles.emptyDescription}>
              {activeTab === "upcoming"
                ? "Agende seu proximo atendimento agora!"
                : "Assim que concluir seus atendimentos, eles aparecem aqui."}
            </Text>

            {activeTab === "upcoming" ? (
              <TouchableOpacity
                style={styles.emptyActionButton}
                activeOpacity={0.9}
                onPress={() => router.push("/schedule")}
              >
                <Text style={styles.emptyActionText}>Agendar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          activeAppointments.map((appointment) => {
            const status = getStatusStyle(appointment.status);
            const isNext = appointment.id === nextAppointmentId && activeTab === "upcoming";

            return (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                activeOpacity={0.85}
                onPress={() => handleCardPress(appointment)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconWrapper}>
                    <Ionicons name="calendar" size={18} color={Color.piccolo} />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  {isNext ? (
                    <Text style={styles.nextTitle}>Sua proxima sessao esta proxima</Text>
                  ) : null}
                  <Text style={styles.cardDate}>{formatAppointmentDate(appointment.scheduledAt)}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardLink}>Ver detalhes</Text>
                  <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => router.push("/schedule")}
          activeOpacity={0.9}
        >
          <Text style={styles.scheduleButtonText}>Agendar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  headerSpacer: {
    paddingTop: Padding.padding_16,
    paddingHorizontal: Padding.padding_24,
  },
  tabSwitcher: {
    flexDirection: "row",
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    padding: StyleVariable.py1,
    alignSelf: "center",
    backgroundColor: Color.mainGohan,
    gap: StyleVariable.gap1,
  },
  tabButton: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIMd,
  },
  tabButtonActive: {
    backgroundColor: Color.piccolo,
  },
  tabText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
  },
  tabTextActive: {
    color: Color.mainGoten,
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingTop: StyleVariable.py4,
    paddingBottom: 120,
    gap: StyleVariable.py4,
  },
  sectionSubtitle: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansBold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Color.mainTrunks,
  },
  loaderWrapper: {
  paddingVertical: StyleVariable.py4,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
  gap: StyleVariable.gap2,
  paddingVertical: StyleVariable.py4,
  paddingHorizontal: StyleVariable.px4,
    borderRadius: Border.br_16,
    backgroundColor: "#F1F3F5",
  },
  emptyActionButton: {
    marginTop: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
  },
  emptyActionText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  emptyTitle: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  emptyDescription: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
  },
  appointmentCard: {
    borderRadius: Border.br_16,
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: StyleVariable.gap2,
    borderWidth: 1,
    borderColor: "#E6EAF1",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardIconWrapper: {
  width: 32,
  height: 32,
  borderRadius: StyleVariable.interactiveBorderRadiusRadiusIMd,
    backgroundColor: "#E7F6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
  paddingHorizontal: StyleVariable.px3,
  paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_58,
  },
  statusText: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansBold,
    textTransform: "uppercase",
  },
  cardBody: {
    gap: StyleVariable.gap1,
  },
  nextTitle: {
  fontSize: FontSize.fs_14,
  lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  cardDate: {
  fontSize: FontSize.fs_16,
  lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: StyleVariable.gap1,
  },
  cardLink: {
  fontSize: FontSize.fs_14,
  lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
    textDecorationLine: "underline",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Padding.padding_24,
    paddingBottom: Padding.padding_24,
    backgroundColor: "transparent",
  },
  scheduleButton: {
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
    paddingVertical: StyleVariable.py4,
    alignItems: "center",
  },
  scheduleButtonText: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
