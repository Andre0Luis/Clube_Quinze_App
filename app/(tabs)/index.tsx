
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../components/Card";
import Card1 from "../../components/Card1";
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
import { listMyAppointments } from "../../services/appointments";
import { logout as logoutService } from "../../services/auth";
import { isMockEnabled } from "../../services/mock/settings";
import { getCurrentUser } from "../../services/users";
import type { AppointmentResponse, UserProfileResponse } from "../../types/api";

interface DecodedToken {
  name?: string;
}

type QuickAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  params?: Record<string, string>;
};

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
      return { label: status ? status : "Desconhecido", background: Color.mainBeerus, text: Color.mainBulma };
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
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

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
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
};

export default function HomeScreen() {
  const router = useRouter();
  const mockActive = isMockEnabled();
  const [userName, setUserName] = useState<string>("");
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [nextAppointment, setNextAppointment] = useState<AppointmentResponse | null>(null);
  const [isLoadingNext, setIsLoadingNext] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

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
            }
            return;
          }

          const decodedToken = jwtDecode<DecodedToken>(token);
          if (decodedToken?.name && isMounted) {
            setUserName(decodedToken.name);
          }
        }

        const currentUser = await getCurrentUser();
        if (!isMounted) {
          return;
        }

        if (currentUser?.role === "CLUB_ADMIN") {
          setIsAdmin(true);
          setIsLoadingNext(false);
          setNextAppointment(null);
          router.replace("/admin-dashboard");
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
  const nextStatusMeta = useMemo(() => getStatusMeta(nextAppointment?.status), [nextAppointment?.status]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <FrameComponent1 userName={displayName} onPressNotifications={() => handleNavigate("/notifications")} />

        <View style={styles.nextAppointmentSection}>
          <Text style={styles.sectionTitle}>Proximo agendamento</Text>
          {isLoadingNext ? (
            <View style={styles.nextCard}>
              <ActivityIndicator size="small" color={Color.piccolo} />
            </View>
          ) : nextAppointment ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleNavigate("/appointments/[appointmentId]", { appointmentId: String(nextAppointment.id) })}
              style={styles.nextCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                  <Ionicons name="calendar" size={18} color={Color.piccolo} />
                </View>
                <View style={[styles.statusBadge, { backgroundColor: nextStatusMeta.background }]}>
                  <Text
                    style={[styles.statusText, { color: nextStatusMeta.text }]}
                  >
                    {nextStatusMeta.label}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Seu proximo cuidado pessoal</Text>
                <Text style={styles.cardDate}>{formatAppointmentDate(nextAppointment.scheduledAt)}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.cardLink}>Ver detalhes</Text>
                <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.nextCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                  <Ionicons name="calendar" size={18} color={Color.piccolo} />
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Sem agendamentos disponiveis</Text>
                <Text style={styles.cardDate}>Agende seu proximo atendimento agora.</Text>
              </View>
              <TouchableOpacity
                style={styles.cardFooter}
                activeOpacity={0.85}
                onPress={() => handleNavigate("/schedule")}
              >
                <Text style={styles.cardLink}>Agendar horario</Text>
                <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.quickActionsWrapper}>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickActionCard}
                activeOpacity={0.9}
                onPress={() => handleNavigate(action.href, action.params)}
              >
                <View style={styles.quickActionCardContent}>
                  <Card
                    buttonText={action.label}
                    size="32px"
                    time="calendar"
                    type="stroke"
                    calendar={
                      <Ionicons
                        name={action.icon}
                        size={22}
                        color={Color.piccolo}
                      />
                    }
                    timePosition="relative"
                  />
                </View>
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
  nextAppointmentSection: {
    gap: Gap.gap_16,
  },
  sectionTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
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
    justifyContent: "space-between",
    columnGap: Gap.gap_16,
    rowGap: Gap.gap_16,
    marginHorizontal: Padding.padding_8,
  },
  quickActionCard: {
    flexBasis: "48%",
    maxWidth: "48%",
    aspectRatio: 1,
    borderRadius: Border.br_16,
    overflow: "visible",
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: Color.mainGohan,
    padding: StyleVariable.px2,
  },
  quickActionCardContent: {
    flex: 1,
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
