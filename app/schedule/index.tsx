import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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
} from "../../GlobalStyles";
import { getAppointmentById, listAvailableSlots } from "../../services/appointments";
import { getCurrentUser } from "../../services/users";
import type { AvailableSlotResponse, MembershipTier } from "../../types/api";

const DAYS_OF_WEEK = ["D", "S", "T", "Q", "Q", "S", "S"] as const;
const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const toStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const toStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const formatMonthLabel = (date: Date) => `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

const formatDateParam = (date: Date) => date.toISOString().split("T")[0];

const formatDisplayDate = (input: Date) =>
  input.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const formatDisplayTime = (iso: string) => {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return parsed.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const MAX_MONTH_OFFSET = 3;

interface DayCell {
  date: Date | null;
  key: string;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();

  const today = useMemo(() => toStartOfDay(new Date()), []);
  const minSelectableDate = useMemo(() => {
    const date = new Date(today);
    date.setMonth(date.getMonth() - MAX_MONTH_OFFSET);
    return toStartOfDay(date);
  }, [today]);
  const maxSelectableDate = useMemo(() => {
    const date = new Date(today);
    date.setMonth(date.getMonth() + MAX_MONTH_OFFSET);
    return toStartOfDay(date);
  }, [today]);

  const [currentMonth, setCurrentMonth] = useState(() => toStartOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [membershipTier, setMembershipTier] = useState<MembershipTier | undefined>();
  const [notes, setNotes] = useState("");
  const [isPrefetching, setIsPrefetching] = useState(true);

  const isReviewDisabled = !selectedDate || !selectedSlot;

  const isPreviousMonthDisabled = useMemo(() => {
    const previous = new Date(currentMonth);
    previous.setMonth(previous.getMonth() - 1);
    return toStartOfMonth(previous) < toStartOfMonth(minSelectableDate);
  }, [currentMonth, minSelectableDate]);

  const isNextMonthDisabled = useMemo(() => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    return toStartOfMonth(next) > toStartOfMonth(maxSelectableDate);
  }, [currentMonth, maxSelectableDate]);

  const generateCalendarCells = useCallback((): DayCell[] => {
    const firstDayOfMonth = toStartOfMonth(currentMonth);
    const firstDayWeekIndex = firstDayOfMonth.getDay();
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();

    const cells: DayCell[] = [];

    for (let i = 0; i < firstDayWeekIndex; i += 1) {
      cells.push({ key: `empty-${i}`, date: null });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      cells.push({ key: `day-${day}`, date });
    }

    return cells;
  }, [currentMonth]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(toStartOfDay(date));
    setSelectedSlot(null);
  }, []);

  const handleChangeMonth = useCallback((direction: -1 | 1) => {
    setCurrentMonth((prev) => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + direction);
      return toStartOfMonth(nextMonth);
    });
  }, []);

  const fetchSlots = useCallback(
    async (date: Date) => {
      setIsLoadingSlots(true);
      try {
        const response: AvailableSlotResponse = await listAvailableSlots({
          date: formatDateParam(date),
          tier: membershipTier,
        });
        setAvailableSlots(response.availableSlots ?? []);
      } catch (error) {
        setAvailableSlots([]);
        Alert.alert(
          "Nao foi possivel carregar",
          "Revise sua conexao e tente novamente em instantes.",
        );
      } finally {
        setIsLoadingSlots(false);
      }
    },
    [membershipTier],
  );

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (isMounted) {
          setMembershipTier(user.membershipTier);
        }
      } catch (error) {
        if (isMounted) {
          setMembershipTier(undefined);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!appointmentId) {
      setIsPrefetching(false);
      return;
    }

    let isMounted = true;

    const loadAppointment = async () => {
      try {
        const appointment = await getAppointmentById(Number(appointmentId));
        if (!isMounted) {
          return;
        }
        const scheduled = new Date(appointment.scheduledAt);
        if (appointment.appointmentTier) {
          setMembershipTier(appointment.appointmentTier);
        }
        if (!Number.isNaN(scheduled.getTime())) {
          const normalized = toStartOfDay(scheduled);
          setCurrentMonth(toStartOfMonth(normalized));
          setSelectedDate(normalized);
          setSelectedSlot(appointment.scheduledAt);
        }
        if (appointment.notes) {
          setNotes(appointment.notes);
        }
      } catch (error) {
        Alert.alert(
          "Nao foi possivel carregar",
          "Tente novamente mais tarde.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        );
      } finally {
        if (isMounted) {
          setIsPrefetching(false);
        }
      }
    };

    loadAppointment();

    return () => {
      isMounted = false;
    };
  }, [appointmentId, router]);

  useEffect(() => {
    if (!selectedDate || isPrefetching) {
      return;
    }

    fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots, isPrefetching]);

  const handleContinue = () => {
    if (isReviewDisabled || !selectedSlot) {
      return;
    }

    router.push({
      pathname: "/schedule/review",
      params: {
        date: selectedDate.toISOString(),
        slot: selectedSlot,
        notes: notes.trim() ? notes.trim() : "",
        appointmentId: appointmentId ?? undefined,
      },
    });
  };

  const renderDayCell = (cell: DayCell) => {
    if (!cell.date) {
      return <View key={cell.key} style={styles.dayCellPlaceholder} />;
    }

    const isDisabled =
      cell.date < today ||
      cell.date < minSelectableDate ||
      cell.date > maxSelectableDate;

    const isSelected = selectedDate && cell.date.getTime() === selectedDate.getTime();

    return (
      <TouchableOpacity
        key={cell.key}
        style={[
          styles.dayCell,
          isSelected ? styles.dayCellSelected : null,
          isDisabled ? styles.dayCellDisabled : null,
        ]}
        activeOpacity={isDisabled ? 1 : 0.85}
        onPress={() => {
          if (isDisabled) {
            return;
          }
          handleSelectDate(cell.date!);
        }}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.dayCellLabel,
            isSelected ? styles.dayCellLabelSelected : null,
            isDisabled ? styles.dayCellLabelDisabled : null,
          ]}
        >
          {cell.date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  const slotsContent = () => {
    if (isLoadingSlots) {
      return (
        <View style={styles.slotLoader}>
          <ActivityIndicator size="small" color={Color.piccolo} />
        </View>
      );
    }

    if (!availableSlots.length) {
      return (
        <Text style={styles.emptySlotsText}>
          Nenhum horario disponivel para a data selecionada.
        </Text>
      );
    }

    return (
      <View style={styles.slotsGrid}>
        {availableSlots.map((slot) => {
          const isSelected = selectedSlot === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[styles.slotCard, isSelected ? styles.slotCardSelected : null]}
              activeOpacity={0.85}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={[styles.slotCardLabel, isSelected ? styles.slotCardLabelSelected : null]}>
                {formatDisplayTime(slot)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={18} color={Color.piccolo} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendamento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Selecione uma data</Text>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => handleChangeMonth(-1)}
              activeOpacity={0.85}
              disabled={isPreviousMonthDisabled}
              style={[styles.monthButton, isPreviousMonthDisabled ? styles.monthButtonDisabled : null]}
            >
              <Ionicons name="chevron-back" size={18} color={Color.piccolo} />
            </TouchableOpacity>

            <Text style={styles.monthLabel}>{formatMonthLabel(currentMonth)}</Text>

            <TouchableOpacity
              onPress={() => handleChangeMonth(1)}
              activeOpacity={0.85}
              disabled={isNextMonthDisabled}
              style={[styles.monthButton, isNextMonthDisabled ? styles.monthButtonDisabled : null]}
            >
              <Ionicons name="chevron-forward" size={18} color={Color.piccolo} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekHeader}>
            {DAYS_OF_WEEK.map((day) => (
              <Text key={day} style={styles.weekDayLabel}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>{generateCalendarCells().map(renderDayCell)}</View>
        </View>

        <Text style={styles.sectionTitle}>Selecione um horario</Text>
        {slotsContent()}

        <View style={styles.notesBlock}>
          <Text style={styles.sectionSubtitle}>Alguma preferencia? (Opcional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Adicione observacoes para a equipe"
            placeholderTextColor={Color.mainBeerus}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={800}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isReviewDisabled ? styles.primaryButtonDisabled : null]}
          activeOpacity={0.9}
          disabled={isReviewDisabled}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: StyleVariable.gap2,
    paddingHorizontal: Padding.padding_24,
    paddingTop: Padding.padding_16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.mainGoten,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingTop: StyleVariable.py4,
    paddingBottom: 160,
    gap: StyleVariable.py4,
  },
  sectionTitle: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  calendarCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: StyleVariable.gap2,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.mainGoten,
  },
  monthButtonDisabled: {
    opacity: 0.4,
  },
  monthLabel: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
    textTransform: "capitalize",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: StyleVariable.px1,
  },
  weekDayLabel: {
    width: 32,
    textAlign: "center",
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: StyleVariable.gap1,
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.mainGoten,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayCellSelected: {
    borderColor: Color.piccolo,
    backgroundColor: "#E7F6FF",
  },
  dayCellDisabled: {
    backgroundColor: Color.mainGoku,
  },
  dayCellLabel: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  dayCellLabelSelected: {
    color: Color.piccolo,
  },
  dayCellLabelDisabled: {
    color: Color.mainBeerus,
  },
  dayCellPlaceholder: {
    width: 40,
    height: 40,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: StyleVariable.gap2,
  },
  slotLoader: {
    paddingVertical: StyleVariable.py4,
    alignItems: "center",
  },
  slotCard: {
    minWidth: 84,
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px2,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.mainGoten,
  },
  slotCardSelected: {
    borderColor: Color.piccolo,
    backgroundColor: "#E7F6FF",
  },
  slotCardLabel: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  slotCardLabelSelected: {
    color: Color.piccolo,
  },
  emptySlotsText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  notesBlock: {
    gap: StyleVariable.gap1,
  },
  sectionSubtitle: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  notesInput: {
    minHeight: 120,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainBulma,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Padding.padding_24,
    paddingBottom: Padding.padding_24,
    paddingTop: StyleVariable.py2,
    backgroundColor: Color.mainGohan,
  },
  primaryButton: {
    height: StyleVariable.heightH12,
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
