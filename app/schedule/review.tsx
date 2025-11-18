import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
} from "../../GlobalStyles";
import {
    rescheduleAppointment,
    scheduleAppointment,
} from "../../services/appointments";
import { getCurrentUser } from "../../services/users";
import type { AppointmentRequest } from "../../types/api";

const formatDateDisplay = (iso?: string) => {
  if (!iso) {
    return "Sem data";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTimeDisplay = (iso?: string) => {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export default function ScheduleReviewScreen() {
  const router = useRouter();
  const { date, slot, notes, appointmentId } = useLocalSearchParams<{
    date?: string;
    slot?: string;
    notes?: string;
    appointmentId?: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userContext, setUserContext] = useState<{ clientId: number; tier: AppointmentRequest["appointmentTier"] } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) {
          return;
        }
        setUserContext({ clientId: user.id, tier: user.membershipTier ?? "CLUB_15" });
      } catch (error) {
        if (isMounted) {
          setUserContext(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    };

    if (!appointmentId) {
      loadUser();
    } else {
      setIsLoadingUser(false);
    }

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const trimmedNotes = useMemo(() => notes?.trim() ?? "", [notes]);

  const handleConfirm = useCallback(async () => {
    if (!slot) {
      Alert.alert("Selecione um horario", "Volte e escolha uma data e horario.");
      router.back();
      return;
    }

    try {
      setIsSubmitting(true);
      if (appointmentId) {
        await rescheduleAppointment(Number(appointmentId), {
          newDate: slot,
          notes: trimmedNotes ? trimmedNotes : undefined,
        });
        Alert.alert("Agendamento atualizado", "Seu atendimento foi remarcado com sucesso.", [
          {
            text: "OK",
            onPress: () => router.replace("/appointments"),
          },
        ]);
        return;
      }

      if (!userContext) {
        Alert.alert("Nao foi possivel confirmar", "Atualize a pagina e tente novamente.");
        return;
      }

      await scheduleAppointment({
        clientId: userContext.clientId,
        appointmentTier: userContext.tier,
        scheduledAt: slot,
        notes: trimmedNotes ? trimmedNotes : undefined,
      });
      Alert.alert("Agendamento confirmado", "Seu atendimento foi marcado com sucesso.", [
        {
          text: "OK",
          onPress: () => router.replace("/appointments"),
        },
      ]);
    } catch (error) {
      Alert.alert("Nao foi possivel concluir", "Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }, [appointmentId, router, slot, trimmedNotes, userContext]);

  const displayDate = useMemo(() => formatDateDisplay(date), [date]);
  const displayTime = useMemo(() => formatTimeDisplay(slot), [slot]);

  const dataRows = [
    { label: "Data", value: displayDate },
    { label: "Horario", value: displayTime || "Selecione um horario" },
    { label: "Preferencias", value: trimmedNotes || "Sem preferencias" },
  ];

  const isConfirmDisabled = isSubmitting || !slot || (!appointmentId && (isLoadingUser || !userContext));

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
        <Text style={styles.headerTitle}>Revisar agendamento</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          {dataRows.map((row) => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isConfirmDisabled ? styles.primaryButtonDisabled : null]}
          activeOpacity={0.9}
          disabled={isConfirmDisabled}
          onPress={handleConfirm}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Color.mainGoten} />
          ) : (
            <Text style={styles.primaryButtonText}>Confirmar</Text>
          )}
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
    flex: 1,
    paddingHorizontal: Padding.padding_24,
    paddingTop: StyleVariable.py4,
  },
  summaryCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: StyleVariable.gap2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: StyleVariable.gap2,
  },
  summaryLabel: {
    flex: 1,
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  summaryValue: {
    flex: 1,
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "right",
  },
  footer: {
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
