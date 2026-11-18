import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
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
import AddToCalendar from "../../../components/AddToCalendar";
import AdminAppointmentActions from "../../../components/AdminAppointmentActions";
import { getStatusMeta, isActiveStatus } from "../../../constants/appointmentStatus";
import {
    cancelAppointment,
    confirmAppointment,
    getAppointmentById,
    listAppointments,
    listMyAppointments,
} from "../../../services/appointments";
import { getCurrentUser, getUserById } from "../../../services/users";
import type { AppointmentResponse } from "../../../types/api";
import { whatsappNumber } from "../../../utils/time";

const getStatusLabel = (status?: string) => {
  const meta = getStatusMeta(status);
  return { label: meta.label, color: meta.background };
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
  const { appointmentId, allowAdmin, action } = useLocalSearchParams<{
    appointmentId?: string;
    allowAdmin?: string | string[];
    action?: string | string[];
  }>();
  // action=confirm vem do push "Confirme seu agendamento": destaca o pedido de confirmação.
  const highlightConfirm = (Array.isArray(action) ? action[0] : action) === "confirm";
  const allowAdminFlag = Array.isArray(allowAdmin) ? allowAdmin[0] : allowAdmin;
  const allowAdminParam = allowAdminFlag === "1";
  // O admin também é reconhecido pelo perfil (não depende só do parâmetro da rota, que as notificações nem sempre mandam).
  const [viewer, setViewer] = useState<{ id: number; isAdmin: boolean } | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [clientPhone, setClientPhone] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isAdminContext = allowAdminParam || viewer?.isAdmin === true;
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentResponse | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const loadAppointment = useCallback(async (silent = false) => {
    const id = Number(appointmentId);
    if (!appointmentId || Number.isNaN(id)) {
      setErrorMessage("Agendamento inválido.");
      setAppointment(null);
      setIsLoading(false);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
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
    let active = true;
    getCurrentUser()
      .then((me) => {
        if (active && me) {
          setViewer({ id: me.id, isAdmin: me.role === "CLUB_ADMIN" });
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Recarrega ao entrar e ao voltar (ex.: depois de escolher outro horário, o status mudou).
  const firstLoad = useRef(true);
  useFocusEffect(
    useCallback(() => {
      const silent = !firstLoad.current;
      firstLoad.current = false;
      void loadAppointment(silent);
    }, [loadAppointment]),
  );

  const clientId = appointment?.clientId;
  useEffect(() => {
    if (!isAdminContext || !clientId) {
      return;
    }
    let active = true;
    getUserById(clientId)
      .then((user) => {
        if (active) {
          setClientName(user.name);
          setClientPhone(user.phone ?? null);
        }
      })
      .catch(() => active && setClientName("Cliente"));
    return () => {
      active = false;
    };
  }, [isAdminContext, clientId]);

  // Admin só vê o painel de gestão quando o agendamento é de outra pessoa.
  const adminMode = isAdminContext && appointment?.clientId !== viewer?.id;
  const displayClient = clientName ?? "Cliente";

  const statusMeta = useMemo(
    () => getStatusLabel(appointment?.status),
    [appointment?.status],
  );

  // Cliente: confirma, pede remarcação (o admin aprova) e cancela. A remarcação é só um PEDIDO, por isso vale mesmo
  // com BOOKING_ENABLED desligado (esse flag trava apenas agendar do zero).
  const isActive = isActiveStatus(appointment?.status);
  const canConfirm = appointment?.status === "SCHEDULED";
  const canReschedule =
    appointment?.status === "SCHEDULED" || appointment?.status === "CONFIRMED";
  const canCancel = isActive;
  const hasPendingProposal = appointment?.status === "RESCHEDULE_REQUESTED";
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
      // DELETE: o cliente pode cancelar o próprio agendamento (o PATCH /status é só do admin e dava 403).
      await cancelAppointment(appointment.id);
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

  const handleConfirmAppointment = async () => {
    if (!appointment || !canConfirm || isConfirming) {
      return;
    }
    try {
      setIsConfirming(true);
      setConfirmError(null);
      const updated = await confirmAppointment(appointment.id);
      setAppointment(updated);
    } catch {
      setConfirmError("Não foi possível confirmar agora. Tente novamente em instantes.");
    } finally {
      setIsConfirming(false);
    }
  };

  // Sem histórico (ex.: abriu pela notificação com o app fechado), "voltar" leva para a home.
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const phoneDigits = clientPhone?.replace(/\D/g, "") ?? "";
  const waNumber = whatsappNumber(clientPhone);

  const resetCancelConfirmation = () => {
    setConfirmCancel(false);
    setCancelError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.85}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={18} color={Color.piccolo} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {adminMode ? "Agendamento do cliente" : "Detalhes"}
        </Text>
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
            onPress={() => loadAppointment()}
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
            {adminMode ? (
              <DetailRow label="Cliente" value={displayClient} />
            ) : null}
            <DetailRow
              label="Data"
              value={formatDate(appointment.scheduledAt)}
            />
            <DetailRow
              label="Horario"
              value={formatTime(appointment.scheduledAt)}
            />
            {adminMode && appointment.durationMinutes ? (
              <DetailRow
                label="Duração"
                value={`${appointment.durationMinutes} min`}
              />
            ) : null}
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

          {notice ? (
            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={20} color="#2E9E5B" />
              <Text style={styles.successText}>{notice}</Text>
            </View>
          ) : null}

          {adminMode && (waNumber || phoneDigits.length >= 8) ? (
            <View style={styles.contactRow}>
              {waNumber ? (
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`https://wa.me/${waNumber}`)}
                  accessibilityRole="button"
                  accessibilityLabel="Falar com o cliente no WhatsApp"
                  testID="contact-whatsapp"
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#1F9D55" />
                  <Text style={styles.contactText}>WhatsApp</Text>
                </TouchableOpacity>
              ) : null}
              {phoneDigits.length >= 8 ? (
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`tel:${phoneDigits}`)}
                  accessibilityRole="button"
                  accessibilityLabel="Ligar para o cliente"
                  testID="contact-call"
                >
                  <Ionicons name="call-outline" size={18} color={Color.piccolo} />
                  <Text style={styles.contactText}>Ligar</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {adminMode ? (
            <AdminAppointmentActions
              appointment={appointment}
              clientName={displayClient}
              onUpdated={(updated, message) => {
                setAppointment(updated);
                setNotice(message);
              }}
              onReschedule={() =>
                router.push({
                  pathname: "/schedule",
                  params: { appointmentId: String(appointment.id) },
                })
              }
            />
          ) : null}

          {!adminMode && highlightConfirm && canConfirm ? (
            <View style={styles.noticeCard}>
              <Ionicons name="alert-circle-outline" size={20} color="#E07B00" />
              <Text style={styles.noticeText}>
                Confirme seu atendimento: toque em “Confirmar presença”. Se não puder
                comparecer, peça a remarcação ou cancele.
              </Text>
            </View>
          ) : null}

          {!adminMode && hasPendingProposal ? (
            <View style={styles.noticeCard}>
              <Ionicons name="time-outline" size={20} color="#E07B00" />
              <Text style={styles.noticeText}>
                {appointment?.proposedAt
                  ? `Você pediu para remarcar para ${formatDate(appointment.proposedAt)} às ${formatTime(appointment.proposedAt)}. `
                  : "Você pediu a remarcação. "}
                Aguarde a resposta do clube; enquanto isso, seu horário atual continua reservado.
              </Text>
            </View>
          ) : null}

          {isActive && appointment ? <AddToCalendar appointmentId={appointment.id} /> : null}
        </ScrollView>
      ) : (
        <View style={styles.loaderWrapper}>
          <Text style={styles.errorText}>
            Não encontramos os detalhes deste agendamento.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadAppointment()}
            activeOpacity={0.9}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {adminMode ? null : (
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        {canConfirm || canReschedule || canCancel ? (
          <View style={styles.actionStack}>
            {canConfirm ? (
              <TouchableOpacity
                style={[styles.primaryButton, isConfirming ? styles.primaryButtonDisabled : null]}
                onPress={handleConfirmAppointment}
                activeOpacity={0.9}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color={Color.mainGoten} />
                ) : (
                  <Text style={styles.primaryButtonText}>Confirmar presença</Text>
                )}
              </TouchableOpacity>
            ) : null}
            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

            {canReschedule ? (
              <TouchableOpacity
                style={canConfirm ? styles.secondaryButton : styles.primaryButton}
                onPress={handleNavigateToReschedule}
                activeOpacity={0.9}
              >
                <Text style={canConfirm ? styles.secondaryButtonText : styles.primaryButtonText}>
                  Pedir remarcação
                </Text>
              </TouchableOpacity>
            ) : null}

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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5D7A8",
    backgroundColor: "#FFF6E8",
    marginTop: 12,
  },
  contactRow: { flexDirection: "row", gap: 10 },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    backgroundColor: Color.mainGoten,
  },
  contactText: { fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  successCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFE5CD",
    backgroundColor: "#EAF7EF",
  },
  successText: {
    flex: 1,
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    color: "#1E6B3E",
    fontFamily: FontFamily.dMSansRegular,
  },
  noticeText: {
    flex: 1,
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    color: "#7A4A00",
    fontFamily: FontFamily.dMSansRegular,
  },
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
    // Folga para a barra de abas flutuante não cobrir o último botão.
    paddingBottom: 140,
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
