import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
    Border,
    Color,
    FontFamily,
    FontSize,
    LineHeight,
    Padding,
    StyleVariable,
} from "../../../GlobalStyles";
import {
    getAppointmentById,
    listAppointments,
    listMyAppointments,
    updateAppointmentStatus,
} from "../../../services/appointments";
import type { AppointmentResponse } from "../../../types/api";

const statusStyles: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Agendado", color: "#1B9984" },
  COMPLETED: { label: "Concluído", color: "#4CAF50" },
  CANCELED: { label: "Cancelado", color: "#D7263D" },
};

const getStatusLabel = (status?: string) =>
  statusStyles[status ?? ""] ?? {
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

const DetailRow = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, color ? { color } : null]}>{value}</Text>
  </View>
);

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const { appointmentId, allowAdmin } = useLocalSearchParams<{
    appointmentId?: string;
    allowAdmin?: string | string[];
  }>();
  const allowAdminFlag = Array.isArray(allowAdmin) ? allowAdmin[0] : allowAdmin;
  const isAdminContext = allowAdminFlag === "1";
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentResponse | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const loadAppointment = useCallback(async () => {
    const id = Number(appointmentId);
    if (!appointmentId || Number.isNaN(id)) {
      setErrorMessage("Agendamento inválido.");
      setAppointment(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAppointmentById(id);
      setAppointment(response);
    } catch (error) {
      try {
        if (isAdminContext) {
          const page = await listAppointments({ size: 200 });
          const fallback = page.content?.find((item) => item.id === id);
          if (fallback) {
            setAppointment(fallback);
            return;
          }
        }

        const page = await listMyAppointments({ size: 200 });
        const fallback = page.content?.find((item) => item.id === id);
        if (fallback) {
          setAppointment(fallback);
          return;
        }
      } catch (fallbackError) {
        console.error("Failed to load appointment fallback", fallbackError);
      }

      console.error("Failed to load appointment", error);
      setAppointment(null);
      setErrorMessage(
        "Não foi possível carregar os detalhes. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, isAdminContext]);

  useEffect(() => {
    const bootstrap = async () => {
      await loadAppointment();
    };

    bootstrap();
  }, [loadAppointment]);

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

  const handleCancelAppointment = async () => {
    if (!appointment || !canCancel || isCancelling) {
      return;
    }

    if (!confirmCancel) {
      setCancelError(null);
      setConfirmCancel(true);
      return;
    }

    try {
      setIsCancelling(true);
      setCancelError(null);
      await updateAppointmentStatus(appointment.id, { status: "CANCELED" });
      setAppointment((prev) => (prev ? { ...prev, status: "CANCELED" } : prev));
      setConfirmCancel(false);
      router.back();
    } catch (error) {
      setCancelError(
        "Não foi possível cancelar. Tente novamente em instantes.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const resetCancelConfirmation = () => {
    setConfirmCancel(false);
    setCancelError(null);
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
      ) : errorMessage ? (
        <View style={styles.loaderWrapper}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadAppointment}
            activeOpacity={0.9}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : appointment ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailCard}>
            <View style={styles.cardIconWrapper}>
              <Ionicons name="calendar" size={20} color={Color.piccolo} />
            </View>
            <Text style={styles.cardSubtitle}>
              {formatFullDate(appointment.scheduledAt)}
            </Text>
            <View style={styles.divider} />
            <DetailRow
              label="Data"
              value={formatDate(appointment.scheduledAt)}
            />
            <DetailRow
              label="Horario"
              value={formatTime(appointment.scheduledAt)}
            />
            <DetailRow
              label="Preferências"
              value={
                appointment.notes?.trim()
                  ? appointment.notes
                  : "Sem preferências"
              }
            />
            <DetailRow
              label="Status"
              value={statusMeta.label}
              color={statusMeta.color}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loaderWrapper}>
          <Text style={styles.errorText}>
            Não encontramos os detalhes deste agendamento.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadAppointment}
            activeOpacity={0.9}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
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
              style={[
                styles.secondaryButton,
                isCancelling ? styles.secondaryButtonDisabled : null,
                confirmCancel ? styles.secondaryButtonConfirm : null,
              ]}
              onPress={handleCancelAppointment}
              activeOpacity={0.9}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={Color.piccolo} />
              ) : (
                <Text style={styles.secondaryButtonText}>
                  {confirmCancel
                    ? "Confirmar cancelamento"
                    : "Cancelar agendamento"}
                </Text>
              )}
            </TouchableOpacity>

            {confirmCancel && (
              <View style={styles.inlineRow}>
                <Text style={styles.helperText}>
                  Toque novamente para confirmar ou desfaça.
                </Text>
                <TouchableOpacity
                  onPress={resetCancelConfirmation}
                  activeOpacity={0.9}
                >
                  <Text style={styles.helperAction}>Desfazer</Text>
                </TouchableOpacity>
              </View>
            )}

            {cancelError ? (
              <Text style={styles.errorText}>{cancelError}</Text>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !canEvaluate ? styles.primaryButtonDisabled : null,
            ]}
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
    paddingBottom: Padding.padding_24,
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
    paddingHorizontal: Padding.padding_24,
    paddingTop: StyleVariable.py2,
    backgroundColor: Color.mainGohan,
  },
  retryButton: {
    marginTop: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.piccolo,
    backgroundColor: Color.mainGoten,
  },
  retryButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
    textAlign: "center",
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
  secondaryButtonConfirm: {
    borderColor: "#D7263D",
  },
  secondaryButtonText: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: StyleVariable.gap2,
  },
  helperText: {
    flex: 1,
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  helperAction: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
});
