import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  LineHeight,
  Padding,
  StyleVariable,
} from "../GlobalStyles";
import AdminNavbar from "../components/admin-navbar";
import { cancelAppointment, listAppointments } from "../services/appointments";
import { getCurrentUser, getUserById } from "../services/users";
import type { AppointmentResponse } from "../types/api";

const formatDateLong = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
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

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const findNext = (items: AppointmentResponse[]) => {
  const now = Date.now();
  return items
    .filter((item) => item.status === "SCHEDULED")
    .filter((item) => {
      const time = new Date(item.scheduledAt).getTime();
      return Number.isNaN(time) ? false : time >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )[0];
};

const buildMonthDays = (anchor: Date) => {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array.from(
    { length: firstWeekday },
    () => null,
  );
  for (let d = 1; d <= totalDays; d += 1) {
    days.push(d);
  }
  return days;
};

const formatDateParam = (date: Date) => date.toISOString().slice(0, 10);

const clientLabel = (
  appointment: AppointmentResponse,
  names: Record<number, string>,
) => names[appointment.clientId] ?? `Cliente ${appointment.clientId}`;

const AdminAgendaScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [anchorMonth, setAnchorMonth] = useState<Date>(new Date());
  const [clientNames, setClientNames] = useState<Record<number, string>>({});
  const [isMutating, setIsMutating] = useState(false);

  const loadAppointments = useCallback(() => {
    let isActive = true;

    const run = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "CLUB_ADMIN") {
          router.replace("/");
          return;
        }

        const monthStart = new Date(
          anchorMonth.getFullYear(),
          anchorMonth.getMonth(),
          1,
        );
        const monthEnd = new Date(
          anchorMonth.getFullYear(),
          anchorMonth.getMonth() + 1,
          0,
        );

        const page = await listAppointments({
          startDate: formatDateParam(monthStart),
          endDate: formatDateParam(monthEnd),
          size: 200,
        });
        if (!isActive) {
          return;
        }
        const items = page.content ?? [];
        setAppointments(items);

        const uniqueIds = Array.from(
          new Set(items.map((item) => item.clientId).filter(Boolean)),
        );
        const missingIds = uniqueIds.filter((id) => !clientNames[id]);

        if (missingIds.length) {
          const responses = await Promise.allSettled(
            missingIds.map((id) => getUserById(id)),
          );
          if (!isActive) {
            return;
          }
          const nextNames: Record<number, string> = {};
          responses.forEach((result, index) => {
            if (result.status === "fulfilled" && result.value?.name) {
              nextNames[missingIds[index]] = result.value.name;
            }
          });
          if (Object.keys(nextNames).length) {
            setClientNames((prev) => ({ ...prev, ...nextNames }));
          }
        }
      } catch (error) {
        if (!isActive) {
          return;
        }
        Alert.alert(
          "Nao foi possivel carregar",
          "Tente novamente em instantes.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, [anchorMonth, clientNames, router]);

  useFocusEffect(loadAppointments);

  const nextAppointment = useMemo(() => findNext(appointments), [appointments]);

  const appointmentsForDay = useMemo(() => {
    return appointments
      .filter((item) => item.status === "SCHEDULED")
      .filter((item) => {
        const when = new Date(item.scheduledAt);
        return Number.isNaN(when.getTime())
          ? false
          : sameDay(when, selectedDate);
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }, [appointments, selectedDate]);

  const monthDays = useMemo(() => buildMonthDays(anchorMonth), [anchorMonth]);

  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
      return;
    }
    router.replace("/");
  };

  const handleOpenOptions = (appointment: AppointmentResponse) => {
    const title = clientLabel(appointment, clientNames);
    Alert.alert(title, "Escolha uma opcao", [
      {
        text: "Alterar horario",
        onPress: () =>
          router.push({
            pathname: "/appointments/[appointmentId]",
            params: { appointmentId: String(appointment.id), allowAdmin: "1" },
          }),
      },
      {
        text: "Cancelar agendamento",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Confirmar cancelamento",
            "Essa acao nao pode ser desfeita.",
            [
              { text: "Voltar", style: "cancel" },
              {
                text: "Cancelar",
                style: "destructive",
                onPress: async () => {
                  if (isMutating) {
                    return;
                  }
                  setIsMutating(true);
                  try {
                    await cancelAppointment(appointment.id);
                    Alert.alert("Agendamento cancelado");
                    loadAppointments();
                  } catch (error) {
                    Alert.alert("Falha ao cancelar", "Tente novamente.");
                  } finally {
                    setIsMutating(false);
                  }
                },
              },
            ],
          );
        },
      },
      { text: "Fechar", style: "cancel" },
    ]);
  };

  const renderDay = (value: number | null, index: number) => {
    if (!value) {
      return <View key={`empty-${index}`} style={styles.dayEmpty} />;
    }
    const isSelected = selectedDate.getDate() === value;
    const isToday = sameDay(
      new Date(),
      new Date(anchorMonth.getFullYear(), anchorMonth.getMonth(), value),
    );
    return (
      <TouchableOpacity
        key={`day-${value}`}
        style={[styles.dayCell, isSelected && styles.dayCellActive]}
        onPress={() =>
          setSelectedDate(
            new Date(anchorMonth.getFullYear(), anchorMonth.getMonth(), value),
          )
        }
        activeOpacity={0.85}
      >
        <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
          {value}
        </Text>
        {isToday && !isSelected ? <Text style={styles.todayDot}>•</Text> : null}
      </TouchableOpacity>
    );
  };

  const renderScheduleItem = ({ item }: { item: AppointmentResponse }) => {
    const when = new Date(item.scheduledAt);
    const time = Number.isNaN(when.getTime())
      ? "--:--"
      : when.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
    return (
      <View style={styles.slotCard}>
        <View style={styles.slotHeader}>
          <View style={styles.avatar} />
          <View style={styles.slotTitleArea}>
            <Text style={styles.slotName}>
              {clientLabel(item, clientNames)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleOpenOptions(item)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={Color.mainTrunks}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.slotDivider} />
        <View style={styles.slotFooter}>
          <Text style={styles.slotTime}>{time}</Text>
          <Text style={styles.slotService}>
            {item.serviceType ?? "Atendimento"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={20} color={Color.hit} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Minha Agenda</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Proximo cliente</Text>
          <View style={styles.nextCard}>
            {isLoading ? (
              <View style={styles.nextLoading}>
                <ActivityIndicator size="small" color={Color.piccolo} />
              </View>
            ) : nextAppointment ? (
              <>
                <Text
                  style={styles.nextClient}
                >{`${clientLabel(nextAppointment, clientNames)} e o seu proximo cliente`}</Text>
                <Text style={styles.nextDate}>
                  {formatDateLong(nextAppointment.scheduledAt)}
                </Text>
                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() =>
                    router.push({
                      pathname: "/appointments/[appointmentId]",
                      params: { appointmentId: String(nextAppointment.id) },
                    })
                  }
                >
                  <Text style={styles.linkText}>
                    Ver detalhes do agendamento
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={Color.piccolo}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.nextClient}>Sem clientes agendados</Text>
                <Text style={styles.nextDate}>
                  Selecione um dia para ver os horarios.
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              onPress={() => {
                const prev = new Date(anchorMonth);
                prev.setMonth(prev.getMonth() - 1);
                setAnchorMonth(prev);
                setSelectedDate(prev);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="chevron-back" size={20} color={Color.hit} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {anchorMonth.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const next = new Date(anchorMonth);
                next.setMonth(next.getMonth() + 1);
                setAnchorMonth(next);
                setSelectedDate(next);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="chevron-forward" size={20} color={Color.hit} />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarGrid}>{monthDays.map(renderDay)}</View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Horarios</Text>
          {isLoading ? (
            <View style={styles.listEmpty}>
              <ActivityIndicator size="small" color={Color.piccolo} />
            </View>
          ) : appointmentsForDay.length === 0 ? (
            <View style={styles.listEmpty}>
              <Text style={styles.emptyText}>
                Nenhum horario para esta data.
              </Text>
            </View>
          ) : (
            <FlatList
              data={appointmentsForDay}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderScheduleItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View style={styles.listSeparator} />
              )}
            />
          )}
        </View>
      </ScrollView>

      <AdminNavbar activePath={pathname} />
    </SafeAreaView>
  );
};

export default AdminAgendaScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  container: {
    paddingHorizontal: Padding.padding_24,
    paddingVertical: Padding.padding_24,
    gap: Gap.gap_24,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSpacer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.fs_18,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  section: {
    gap: Gap.gap_12,
  },
  sectionLabel: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  nextCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "#E6EAF1",
    backgroundColor: Color.mainGoten,
    padding: StyleVariable.px4,
    gap: StyleVariable.gap2,
  },
  nextLoading: {
    paddingVertical: Padding.padding_12,
  },
  nextClient: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  nextDate: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: StyleVariable.gap1,
  },
  linkText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
    textDecorationLine: "underline",
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: StyleVariable.gap2,
  },
  monthTitle: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
    textTransform: "capitalize",
    textAlign: "center",
    flex: 1,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: StyleVariable.gap1,
    maxWidth: 360,
    alignSelf: "center",
  },
  dayCell: {
    width: 44,
    height: 44,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    borderWidth: 1,
    borderColor: "#E6EAF1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.mainGoten,
  },
  dayCellActive: {
    backgroundColor: "#E7F6FF",
    borderColor: Color.piccolo,
  },
  dayEmpty: {
    width: 44,
    height: 44,
  },
  dayText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
  dayTextActive: {
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  todayDot: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    color: Color.piccolo,
  },
  listEmpty: {
    paddingVertical: Padding.padding_12,
    alignItems: "center",
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "#E6EAF1",
    backgroundColor: Color.mainGoten,
  },
  emptyText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  listSeparator: {
    height: StyleVariable.gap2,
  },
  slotCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "#E6EAF1",
    backgroundColor: Color.mainGoten,
    padding: StyleVariable.px4,
    gap: StyleVariable.gap2,
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: StyleVariable.gap2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Border.br_100,
    backgroundColor: "#E7F6FF",
  },
  slotTitleArea: {
    flex: 1,
  },
  slotName: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  slotDivider: {
    height: 1,
    backgroundColor: "#E6EAF1",
  },
  slotFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotTime: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  slotService: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
});
