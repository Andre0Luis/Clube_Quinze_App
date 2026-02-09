import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../components/Card";
import FrameComponent1 from "../../components/FrameComponent1";
import {
    Border,
    Color,
    FontFamily,
    FontSize,
    Gap,
    LineHeight,
    Padding,
    StyleVariable,
} from "../../GlobalStyles";
import { usePushNotifications } from "../../hooks/use-push-notifications";
import { listMyAppointments } from "../../services/appointments";
import { logout as logoutService } from "../../services/auth";
import { getAdminDashboardMetrics } from "../../services/dashboard";
import { isMockEnabled } from "../../services/mock/settings";
import { registerPushToken } from "../../services/push-tokens";
import { getCurrentUser } from "../../services/users";
import type {
    AdminDashboardResponse,
    AppointmentResponse,
    UserProfileResponse,
} from "../../types/api";

interface DecodedToken {
  name?: string;
}

type QuickAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  params?: Record<string, string>;
};

type ActionCard =
  | { kind: "next"; span: 2 }
  | { kind: "link"; action: QuickAction; span: 1 }
  | { kind: "community"; span: 2 }
  | { kind: "adminMembersStandard"; span: 1 }
  | { kind: "adminMembersSelect"; span: 1 }
  | { kind: "adminAgenda"; span: 1 }
  | { kind: "adminPayments"; span: 1 }
  | { kind: "register"; span: 2 };

const quickActions: QuickAction[] = [
  {
    label: "Meus agendamentos",
    icon: "list-outline",
    href: "/appointments",
  },
  {
    label: "Meus historicos",
    icon: "time-outline",
    href: "/appointments",
    params: { tab: "history" },
  },
  {
    label: "Cadastrar usuario",
    icon: "person-add-outline",
    href: "/register",
  },
];

const getStatusMeta = (status?: string) => {
  switch (status) {
    case "SCHEDULED":
      return { label: "Agendado", background: "#1B9984", text: "#FFFFFF" };
    case "COMPLETED":
      return { label: "Concluido", background: "#4CAF50", text: "#FFFFFF" };
    case "CANCELED":
      return { label: "Cancelado", background: "#D7263D", text: "#FFFFFF" };
    default:
      return {
        label: status ? status : "Desconhecido",
        background: Color.mainBeerus,
        text: Color.mainBulma,
      };
  }
};

const formatAppointmentDate = (input: string) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} • ${day} de ${month} • ${time}`;
};

const findNextAppointment = (items: AppointmentResponse[]) => {
  const now = Date.now();
  return items
    .filter((appointment) => {
      if (appointment.status !== "SCHEDULED") {
        return false;
      }
      const scheduledAt = new Date(appointment.scheduledAt).getTime();
      return Number.isNaN(scheduledAt) ? false : scheduledAt >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )[0];
};

export default function HomeScreen() {
  const router = useRouter();
  const {
    expoPushToken,
    appVersion,
    lastResponse: lastNotificationResponse,
    lastNotification,
    error: notificationsError,
  } = usePushNotifications();
  const [registeredPushToken, setRegisteredPushToken] = useState<string | null>(
    null,
  );
  const mockActive = isMockEnabled();
  const [userName, setUserName] = useState<string>("");
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [nextAppointment, setNextAppointment] =
    useState<AppointmentResponse | null>(null);
  const [isLoadingNext, setIsLoadingNext] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminDashboard, setAdminDashboard] =
    useState<AdminDashboardResponse | null>(null);

  useEffect(() => {
    if (notificationsError) {
      console.warn("Falha ao registrar notificacoes", notificationsError);
    }
  }, [notificationsError]);

  useEffect(() => {
    if (expoPushToken) {
      console.log("Expo push token obtido", expoPushToken);
      if (expoPushToken !== registeredPushToken) {
        registerPushToken(expoPushToken, appVersion).finally(() => {
          setRegisteredPushToken(expoPushToken);
        });
      }
    }
  }, [expoPushToken, registeredPushToken, appVersion]);

  const handleNotificationNavigation = useCallback(
    (data?: {
      appointmentId?: string | number;
      href?: string;
      kind?: string;
      scheduledAt?: string;
      offset?: string;
    }) => {
      if (!data) return;

      if (data.href) {
        router.push(data.href as any);
        return;
      }

      if (data.appointmentId) {
        router.push({
          pathname: "/appointments/[appointmentId]",
          params: { appointmentId: String(data.appointmentId) },
        });
      }
    },
    [router],
  );

  useEffect(() => {
    if (!lastNotificationResponse) {
      return;
    }

    const data =
      (lastNotificationResponse.notification.request.content.data as
        | {
            appointmentId?: string | number;
            href?: string;
            kind?: string;
            scheduledAt?: string;
            offset?: string;
          }
        | undefined) ?? {};

    handleNotificationNavigation(data);
  }, [lastNotificationResponse, handleNotificationNavigation]);

  useEffect(() => {
    if (!lastNotification) {
      return;
    }

    const data =
      (lastNotification.request.content.data as
        | {
            appointmentId?: string | number;
            href?: string;
            kind?: string;
            scheduledAt?: string;
            offset?: string;
          }
        | undefined) ?? {};

    const kind = data.kind ?? "";
    const scheduledAt = data.scheduledAt;
    const offset = data.offset;

    const messageByKind: Record<string, string> = {
      SCHEDULED: scheduledAt
        ? `Agendamento confirmado para ${scheduledAt}.`
        : "Agendamento confirmado.",
      RESCHEDULED: scheduledAt
        ? `Agendamento remarcado para ${scheduledAt}.`
        : "Agendamento remarcado.",
      CANCELLED: "Agendamento cancelado.",
      reminder: offset
        ? `Lembrete do seu agendamento (${offset}).`
        : "Lembrete do seu agendamento.",
    };

    const alertBody =
      messageByKind[kind] ??
      lastNotification.request.content.body ??
      "Notificacao recebida.";

    Alert.alert("Notificacao", alertBody, [
      {
        text: "Ver",
        onPress: () => handleNotificationNavigation(data),
      },
      {
        text: "Ok",
        style: "cancel",
      },
    ]);
  }, [lastNotification, handleNotificationNavigation]);

  useEffect(() => {
    if (!lastNotificationResponse) {
      return;
    }

    const data =
      (lastNotificationResponse.notification.request.content.data as
        | { appointmentId?: string | number; href?: string }
        | undefined) ?? {};

    if (data.href) {
      router.push(data.href as any);
      return;
    }

    if (data.appointmentId) {
      router.push({
        pathname: "/appointments/[appointmentId]",
        params: { appointmentId: String(data.appointmentId) },
      });
    }
  }, [lastNotificationResponse, router]);

  useEffect(() => {
    let isMounted = true;

    const clearStoredTokens = async () => {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    };

    const fetchUserData = async () => {
      try {
        if (!mockActive) {
          const token = await SecureStore.getItemAsync("accessToken");
          if (!token) {
            if (isMounted) {
              setProfile(null);
              setUserName("");
              setIsLoadingNext(false);
              setNextAppointment(null);
              setIsAdmin(false);
            }
            return;
          }

          try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            if (decodedToken?.name && isMounted) {
              setUserName(decodedToken.name);
            }
          } catch (decodeError) {
            console.warn("Invalid access token detected", decodeError);
            await clearStoredTokens();
            if (isMounted) {
              setProfile(null);
              setUserName("");
              setNextAppointment(null);
              setIsLoadingNext(false);
              setIsAdmin(false);
              router.replace("/login");
            }
            return;
          }
        }

        const currentUser = await getCurrentUser();
        if (!isMounted) {
          return;
        }

        if (currentUser?.role === "CLUB_ADMIN") {
          setIsAdmin(true);
          setProfile(currentUser);
          if (currentUser.name) {
            setUserName(currentUser.name);
          }
          setIsLoadingNext(false);
          setNextAppointment(null);
          return;
        }

        setIsAdmin(false);

        setProfile(currentUser);
        if (currentUser?.name) {
          setUserName(currentUser.name);
        }
        if (currentUser?.nextAppointment) {
          setNextAppointment(currentUser.nextAppointment);
        } else {
          setNextAppointment(null);
        }
        setIsLoadingNext(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const status =
          typeof error === "object" && error !== null && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;

        if (!mockActive && status === 401) {
          await clearStoredTokens();
          setProfile(null);
          setUserName("");
          setNextAppointment(null);
          setIsLoadingNext(false);
          setIsAdmin(false);
          router.replace("/login");
          return;
        }

        setProfile(null);
        setIsLoadingNext(false);
        setIsAdmin(false);
        console.error("Failed to fetch user profile", error);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [mockActive, router]);

  useEffect(() => {
    if (isAdmin !== true) {
      setAdminDashboard(null);
      return;
    }

    let isActive = true;

    const loadAdminMetrics = async () => {
      const clearStoredTokens = async () => {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
      };

      try {
        const data = await getAdminDashboardMetrics();
        if (!isActive) {
          return;
        }
        setAdminDashboard(data);
      } catch (error) {
        const status =
          typeof error === "object" && error !== null && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;

        if (status === 401) {
          await clearStoredTokens();
          if (isActive) {
            setAdminDashboard(null);
            setIsAdmin(false);
            router.replace("/login");
          }
          return;
        }

        if (isActive) {
          setAdminDashboard(null);
        }
        console.error("Failed to load admin dashboard metrics", error);
      }
    };

    loadAdminMetrics();

    return () => {
      isActive = false;
    };
  }, [isAdmin, router]);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin !== false) {
        return () => undefined;
      }

      let isActive = true;

      const loadNextAppointment = async () => {
        setIsLoadingNext(true);
        try {
          if (!mockActive) {
            const token = await SecureStore.getItemAsync("accessToken");
            if (!token) {
              if (isActive) {
                setNextAppointment(null);
                setIsLoadingNext(false);
              }
              return;
            }
          }

          const page = await listMyAppointments({ size: 50 });
          if (!isActive) {
            return;
          }
          const upcoming = findNextAppointment(page.content ?? []);
          setNextAppointment(upcoming ?? null);
        } catch (error) {
          if (!isActive) {
            return;
          }
          setNextAppointment(null);
        } finally {
          if (isActive) {
            setIsLoadingNext(false);
          }
        }
      };

      loadNextAppointment();

      return () => {
        isActive = false;
      };
    }, [isAdmin, mockActive]),
  );

  const handleLogout = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (refreshToken) {
        await logoutService({ refreshToken });
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      setUserName("");
      setProfile(null);
      router.replace("/login");
    }
  }, [router]);

  const handleNavigate = useCallback(
    (path: string, params?: Record<string, string>) => {
      if (params) {
        router.push({ pathname: path, params });
        return;
      }
      router.push(path);
    },
    [router],
  );

  const displayName = useMemo(() => {
    if (profile?.name && profile.name.trim().length > 0) {
      return profile.name;
    }
    return userName || "Convidado";
  }, [profile?.name, userName]);
  const nextStatusMeta = useMemo(
    () => getStatusMeta(nextAppointment?.status),
    [nextAppointment?.status],
  );

  const membersStandardCount = useMemo(() => {
    const total = adminDashboard?.totalMembers ?? 0;
    const fromMetric = adminDashboard?.metrics?.find(
      (metric) => metric.id === "members_standard",
    )?.value;
    if (typeof fromMetric === "number" && !Number.isNaN(fromMetric)) {
      return fromMetric;
    }
    return Math.max(0, Math.round(total * 0.7));
  }, [adminDashboard?.metrics, adminDashboard?.totalMembers]);

  const membersSelectCount = useMemo(() => {
    const total = adminDashboard?.totalMembers ?? 0;
    const fromMetric = adminDashboard?.metrics?.find(
      (metric) => metric.id === "members_select",
    )?.value;
    if (typeof fromMetric === "number" && !Number.isNaN(fromMetric)) {
      return fromMetric;
    }
    const fallback = total - membersStandardCount;
    return Math.max(0, fallback);
  }, [
    adminDashboard?.metrics,
    adminDashboard?.totalMembers,
    membersStandardCount,
  ]);

  const actionCards = useMemo<ActionCard[]>(() => {
    if (isAdmin) {
      return [
        { kind: "adminMembersStandard", span: 1 },
        { kind: "adminMembersSelect", span: 1 },
        { kind: "adminAgenda", span: 1 },
        { kind: "adminPayments", span: 1 },
        { kind: "register", span: 2 },
        { kind: "community", span: 2 },
      ];
    }

    const linkActions = quickActions
      .filter((action) => action.href !== "/register")
      .map((action) => ({ kind: "link", action, span: 1 }) as const);

    const cards: ActionCard[] = [{ kind: "next", span: 2 }, ...linkActions];

    if (profile?.membershipTier === "QUINZE_SELECT") {
      cards.push({ kind: "community", span: 2 });
    }

    return cards;
  }, [isAdmin, profile?.membershipTier]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <FrameComponent1
          userName={displayName}
          onPressNotifications={() => handleNavigate("/notifications")}
        />

        <View style={styles.quickActionsWrapper}>
          <View style={styles.quickActions}>
            {actionCards.map((item) => {
              const cardStyle = [
                styles.quickActionCard,
                item.span === 2 && styles.quickActionCardFull,
              ];

              if (item.kind === "link") {
                return (
                  <TouchableOpacity
                    key={item.action.label}
                    style={cardStyle}
                    activeOpacity={0.9}
                    onPress={() =>
                      handleNavigate(item.action.href, item.action.params)
                    }
                  >
                    <View style={styles.quickActionCardContent}>
                      <Card
                        buttonText={item.action.label}
                        size="32px"
                        time="calendar"
                        type="stroke"
                        calendar={
                          <Ionicons
                            name={item.action.icon}
                            size={22}
                            color={Color.piccolo}
                          />
                        }
                        timePosition="relative"
                      />
                    </View>
                  </TouchableOpacity>
                );
              }

              if (item.kind === "community") {
                return (
                  <TouchableOpacity
                    key="community"
                    style={cardStyle}
                    activeOpacity={0.9}
                    onPress={() => handleNavigate("/community")}
                  >
                    <View style={styles.quickActionCardContent}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIconWrapper}>
                          <Ionicons
                            name="people-outline"
                            size={18}
                            color={Color.piccolo}
                          />
                        </View>
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>Comunidade Quinze</Text>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardLink}>Entrar</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={Color.piccolo}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              if (item.kind === "adminMembersStandard") {
                return (
                  <TouchableOpacity
                    key="admin-members-standard"
                    style={cardStyle}
                    activeOpacity={0.9}
                    onPress={() =>
                      handleNavigate("/admin-members", { tier: "CLUB_15" })
                    }
                  >
                    <View style={styles.quickActionCardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Membros</Text>
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardCount}>
                          {membersStandardCount.toLocaleString("pt-BR")}
                        </Text>
                        <Text
                          style={[styles.cardLabel, { color: Color.piccolo }]}
                        >
                          Plano Standard
                        </Text>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardLink}>Ver lista</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={Color.piccolo}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              if (item.kind === "adminMembersSelect") {
                return (
                  <TouchableOpacity
                    key="admin-members-select"
                    style={cardStyle}
                    activeOpacity={0.9}
                    onPress={() =>
                      handleNavigate("/admin-members", {
                        tier: "QUINZE_SELECT",
                      })
                    }
                  >
                    <View style={styles.quickActionCardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Membros</Text>
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardCount}>
                          {membersSelectCount.toLocaleString("pt-BR")}
                        </Text>
                        <Text style={[styles.cardLabel, { color: "#C9A43C" }]}>
                          Quinze Select
                        </Text>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardLink}>Ver lista</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={Color.piccolo}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              if (item.kind === "adminAgenda") {
                return (
                  <TouchableOpacity
                    key="admin-agenda"
                    style={cardStyle}
                    activeOpacity={0.9}
                    onPress={() => handleNavigate("/admin-agenda")}
                  >
                    <View style={styles.quickActionCardContent}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIconWrapper}>
                          <Ionicons
                            name="calendar-outline"
                            size={18}
                            color={Color.piccolo}
                          />
                        </View>
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>Meus agendamentos</Text>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardLink}>Abrir agenda</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={Color.piccolo}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              if (item.kind === "adminPayments") {
                return (
                  <TouchableOpacity
                    key="admin-payments"
                    style={cardStyle}
                    activeOpacity={0.9}
                    onPress={() =>
                      handleNavigate("/profile/plans", { fromAdmin: "1" })
                    }
                  >
                    <View style={styles.quickActionCardContent}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIconWrapper}>
                          <Ionicons
                            name="card-outline"
                            size={18}
                            color={Color.piccolo}
                          />
                        </View>
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>
                          Proximos pagamentos
                        </Text>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardLink}>Ver detalhes</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={Color.piccolo}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              if (item.kind === "register") {
                return (
                  <TouchableOpacity
                    key="register-user"
                    style={cardStyle}
                    activeOpacity={0.9}
                    onPress={() =>
                      handleNavigate("/register", { fromAdmin: "1" })
                    }
                  >
                    <View style={styles.quickActionCardContent}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIconWrapper}>
                          <Ionicons
                            name="person-add-outline"
                            size={18}
                            color={Color.piccolo}
                          />
                        </View>
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>Cadastrar usuario</Text>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardLink}>Iniciar cadastro</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={Color.piccolo}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key="next-appointment"
                  style={cardStyle}
                  activeOpacity={0.9}
                  onPress={() => {
                    if (isLoadingNext) {
                      return;
                    }
                    if (nextAppointment) {
                      handleNavigate("/appointments/[appointmentId]", {
                        appointmentId: String(nextAppointment.id),
                      });
                    } else {
                      handleNavigate("/schedule");
                    }
                  }}
                >
                  <View style={styles.quickActionCardContent}>
                    {isLoadingNext ? (
                      <View style={styles.centeredContent}>
                        <ActivityIndicator size="small" color={Color.piccolo} />
                      </View>
                    ) : nextAppointment ? (
                      <>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardIconWrapper}>
                            <Ionicons
                              name="calendar"
                              size={18}
                              color={Color.piccolo}
                            />
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: nextStatusMeta.background },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: nextStatusMeta.text },
                              ]}
                            >
                              {nextStatusMeta.label}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.cardBody}>
                          <Text style={styles.cardTitle}>
                            Proximo agendamento
                          </Text>
                          <Text style={styles.cardDate}>
                            {formatAppointmentDate(nextAppointment.scheduledAt)}
                          </Text>
                        </View>
                        <View style={styles.cardFooter}>
                          <Text style={styles.cardLink}>Ver detalhes</Text>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color={Color.piccolo}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardIconWrapper}>
                            <Ionicons
                              name="calendar"
                              size={18}
                              color={Color.piccolo}
                            />
                          </View>
                        </View>
                        <View style={styles.cardBody}>
                          <Text style={styles.cardTitle}>Sem agendamentos</Text>
                        </View>
                        <View style={styles.cardFooter}>
                          <Text style={styles.cardLink}>Agendar horario</Text>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color={Color.piccolo}
                          />
                        </View>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Image
            source={require("../../assets/passos_magicos.jpg")}
            style={styles.magicStepsImage}
            contentFit="contain"
            accessibilityLabel="Passos Magicos"
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => Linking.openURL("https://www.produtos15.com.br/")}
            accessibilityRole="link"
            accessibilityLabel="Acessar Produtos Quinze"
          >
            <Image
              source={require("../../assets/images/produtos15.png")}
              style={styles.magicStepsImage}
              contentFit="contain"
              accessibilityLabel="Produtos Quinze"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  magicStepsImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: Border.br_16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6EAF1",
  },
  nextCard: {
    borderRadius: Border.br_16,
    backgroundColor: Color.mainGoten,
    borderWidth: 1,
    borderColor: "#E6EAF1",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: StyleVariable.gap2,
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
  cardTitle: {
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
  cardCount: {
    fontSize: FontSize.fs_32,
    lineHeight: LineHeight.lh_32,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  cardLabel: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
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
  quickActionsWrapper: {
    marginTop: Gap.gap_8,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Gap.gap_12,
  },
  quickActionCard: {
    width: "47%",
    borderRadius: Border.br_16,
    overflow: "visible",
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: Color.mainGohan,
    padding: StyleVariable.px3,
    minHeight: 170,
    borderWidth: 1,
    borderColor: "#E6EAF1",
  },
  quickActionCardFull: {
    width: "100%",
    minHeight: 190,
  },
  quickActionCardContent: {
    flex: 1,
    justifyContent: "space-between",
    gap: StyleVariable.gap2,
  },
  centeredContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
