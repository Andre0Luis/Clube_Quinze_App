import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
} from "../../../GlobalStyles";
import { getAppointmentById, updateAppointmentStatus } from "../../../services/appointments";
import type { AppointmentResponse } from "../../../types/api";

const statusStyles: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Agendado", color: "#1B9984" },
  COMPLETED: { label: "Concluido", color: "#4CAF50" },
  CANCELED: { label: "Cancelado", color: "#D7263D" },
};

const getStatusLabel = (status?: string) => statusStyles[status ?? ""] ?? {
  label: status ? status : "Desconhecido",
  color: Color.mainTrunks,
};

const formatDate = (input?: string) => {
  if (!input) {
    return "Sem data";
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (input?: string) => {
  if (!input) {
    return "Sem horario";
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFullDate = (input?: string) => {
  if (!input) {
    return "";
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} • ${day} de ${month}`;
};

const DetailRow = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, color ? { color } : null]}>{value}</Text>
  </View>
);

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);

  useEffect(() => {
    const id = Number(appointmentId);
    if (!appointmentId || Number.isNaN(id)) {
      Alert.alert("Agendamento invalido", "Nao conseguimos carregar este atendimento.");
      router.back();
      return;
    }

    let isMounted = true;

    const loadAppointment = async () => {
      setIsLoading(true);
      try {
        const response = await getAppointmentById(id);
        if (!isMounted) {
          return;
        }
        setAppointment(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        Alert.alert(
          "Falha ao carregar",
          "Nao foi possivel carregar os detalhes. Tente novamente mais tarde.",
        );
        router.back();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAppointment();

    return () => {
      isMounted = false;
    };
  }, [appointmentId, router]);

  const statusMeta = useMemo(
    () => getStatusLabel(appointment?.status),
    [appointment?.status],
  );

  const canReschedule = appointment?.status === "SCHEDULED";
  const canCancel = canReschedule;
  const canEvaluate = appointment?.status === "COMPLETED";

  const handleNavigateToFeedback = () => {
    if (!appointment) {
      return;
    }

    router.push({
      pathname: "/appointments/[appointmentId]/feedback",
      params: { appointmentId: String(appointment.id) },
    });
  };

  const handleNavigateToReschedule = () => {
    if (!appointment || !canReschedule) {
      return;
    }

    router.push({
      pathname: "/schedule",
      params: { appointmentId: String(appointment.id) },
    });
  };

  const handleCancelAppointment = () => {
    if (!appointment || !canCancel || isCancelling) {
      return;
    }

    Alert.alert(
      "Cancelar agendamento",
      "Tem certeza que deseja cancelar este agendamento?",
      [
        { text: "Nao", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsCancelling(true);
              await updateAppointmentStatus(appointment.id, { status: "CANCELED" });
              setAppointment((prev) => (prev ? { ...prev, status: "CANCELED" } : prev));
              Alert.alert("Agendamento cancelado", "Seu agendamento foi cancelado com sucesso.", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              Alert.alert("Nao foi possivel cancelar", "Tente novamente em instantes.");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
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
        <Text style={styles.headerTitle}>Detalhes</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="small" color={Color.piccolo} />
        </View>
      ) : appointment ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.detailCard}>
            <View style={styles.cardIconWrapper}>
              <Ionicons name="calendar" size={20} color={Color.piccolo} />
            </View>
            <Text style={styles.cardSubtitle}>{formatFullDate(appointment.scheduledAt)}</Text>
            <View style={styles.divider} />
            <DetailRow label="Data" value={formatDate(appointment.scheduledAt)} />
            <DetailRow label="Horario" value={formatTime(appointment.scheduledAt)} />
            <DetailRow
              label="Preferencias"
              value={appointment.notes?.trim() ? appointment.notes : "Sem preferencias"}
            />
            <DetailRow label="Status" value={statusMeta.label} color={statusMeta.color} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loaderWrapper}>
          <Text style={styles.errorText}>Nao encontramos os detalhes deste agendamento.</Text>
        </View>
      )}

      <View style={styles.footer}>
        {canReschedule ? (
          <View style={styles.actionStack}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNavigateToReschedule}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Remarcar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, isCancelling ? styles.secondaryButtonDisabled : null]}
              onPress={handleCancelAppointment}
              activeOpacity={0.9}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={Color.piccolo} />
              ) : (
                <Text style={styles.secondaryButtonText}>Cancelar agendamento</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, !canEvaluate ? styles.primaryButtonDisabled : null]}
            onPress={handleNavigateToFeedback}
            activeOpacity={0.9}
            disabled={!canEvaluate}
          >
            <Text style={styles.primaryButtonText}>Avaliar</Text>
          </TouchableOpacity>
        )}
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
  loaderWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Padding.padding_24,
  },
  errorText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingTop: StyleVariable.py4,
    paddingBottom: 120,
    gap: StyleVariable.py4,
  },
  detailCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: StyleVariable.gap2,
  },
  cardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E7F6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardSubtitle: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  divider: {
    height: 1,
    backgroundColor: Color.mainBeerus,
    opacity: 0.4,
    marginVertical: StyleVariable.py2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: StyleVariable.gap2,
  },
  detailLabel: {
    flex: 1,
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  detailValue: {
    flex: 1,
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "right",
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
  actionStack: {
    gap: StyleVariable.py2,
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
  secondaryButton: {
    height: StyleVariable.heightH12,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.piccolo,
    backgroundColor: Color.mainGoten,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
});
