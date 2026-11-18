import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Color, FontFamily, FontSize, LineHeight } from "../GlobalStyles";
import {
  approveReschedule,
  cancelAppointment,
  confirmAppointment,
  rejectReschedule,
} from "../services/appointments";
import type { AppointmentResponse } from "../types/api";
import { apiMessage } from "../utils/apiError";

const DURATION_PRESETS = [30, 45, 60, 90, 120];

const GREEN = "#2E9E5B";
const RED = "#D7263D";
const ORANGE = "#E07B00";

const formatDuration = (minutes: number) =>
  minutes % 60 === 0
    ? `${minutes / 60} h`
    : minutes > 60
      ? `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`
      : `${minutes} min`;

const formatWhen = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

type Busy = "approve" | "reject" | "confirm" | "cancel" | null;

type Props = {
  appointment: AppointmentResponse;
  clientName: string;
  /** Chamado depois de qualquer ação concluída, com o agendamento já atualizado. */
  onUpdated: (appointment: AppointmentResponse, message: string) => void;
  /** Abre o seletor de data/horário para o admin escolher outro horário. */
  onReschedule: () => void;
};

/**
 * Ações do admin sobre o agendamento de um cliente, conforme o status:
 *  - remarcação em análise → aprovar (com duração), outro horário, recusar (com motivo), cancelar
 *  - agendado             → confirmar presença, remarcar, cancelar
 *  - confirmado           → remarcar, cancelar
 */
export default function AdminAppointmentActions({
  appointment,
  clientName,
  onUpdated,
  onReschedule,
}: Props) {
  const [busy, setBusy] = useState<Busy>(null);
  const [duration, setDuration] = useState<number>(
    appointment.durationMinutes ?? 30,
  );
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const status = appointment.status;
  const isRequest = status === "RESCHEDULE_REQUESTED";
  const isScheduled = status === "SCHEDULED";
  const isConfirmed = status === "CONFIRMED";

  if (!isRequest && !isScheduled && !isConfirmed) {
    return (
      <View style={styles.doneBox}>
        <Ionicons
          name={status === "CANCELED" ? "close-circle-outline" : "checkmark-circle-outline"}
          size={22}
          color={Color.mainTrunks}
        />
        <Text style={styles.doneText}>
          {status === "CANCELED"
            ? "Este atendimento foi cancelado. Não há mais ações a fazer."
            : "Este atendimento já foi concluído."}
        </Text>
      </View>
    );
  }

  const run = async (
    kind: Exclude<Busy, null>,
    action: () => Promise<AppointmentResponse | void>,
    success: string,
    failure: string,
    next?: AppointmentResponse["status"],
  ) => {
    setBusy(kind);
    setError(null);
    try {
      const result = await action();
      const updated: AppointmentResponse =
        result && typeof result === "object"
          ? (result as AppointmentResponse)
          : { ...appointment, status: next ?? appointment.status };
      setRejecting(false);
      setReason("");
      onUpdated(updated, success);
    } catch (e) {
      const message = apiMessage(e, failure);
      if (kind === "approve" && message.startsWith("Conflito")) {
        // Conflito de horário: o admin decide entre outro horário, recusar ou deixar como está.
        Alert.alert("Conflito de horário", message, [
          { text: "Escolher outro horário", onPress: onReschedule },
          { text: "Recusar pedido", style: "destructive", onPress: () => setRejecting(true) },
          { text: "Fechar", style: "cancel" },
        ]);
      } else {
        setError(message);
      }
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = () =>
    run(
      "approve",
      () => approveReschedule(appointment.id, { durationMinutes: duration }),
      `Remarcação aprovada. ${clientName} foi avisado(a) do novo horário.`,
      "Não foi possível aprovar.",
    );

  const handleReject = () =>
    run(
      "reject",
      () => rejectReschedule(appointment.id, reason.trim() || undefined),
      `Pedido recusado. ${clientName} continua no horário original.`,
      "Não foi possível recusar.",
    );

  const handleConfirm = () =>
    run(
      "confirm",
      () => confirmAppointment(appointment.id),
      "Presença confirmada.",
      "Não foi possível confirmar.",
    );

  const handleCancel = () =>
    Alert.alert(
      "Cancelar atendimento?",
      `${clientName} — ${formatWhen(appointment.scheduledAt)}. O cliente será avisado.`,
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar atendimento",
          style: "destructive",
          onPress: () =>
            run(
              "cancel",
              async () => {
                await cancelAppointment(appointment.id);
              },
              "Atendimento cancelado. O cliente foi avisado.",
              "Não foi possível cancelar.",
              "CANCELED",
            ),
        },
      ],
    );

  const disabled = busy !== null;

  return (
    <View style={styles.wrapper} testID="admin-actions">
      {isRequest ? (
        <View style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <Ionicons name="swap-horizontal-outline" size={20} color={ORANGE} />
            <Text style={styles.requestTitle}>Pedido de remarcação</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Horário atual</Text>
            <Text style={styles.value}>{formatWhen(appointment.scheduledAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pediu para</Text>
            <Text style={[styles.value, { color: ORANGE }]}>
              {formatWhen(appointment.proposedAt)}
            </Text>
          </View>
          <Text style={styles.hint}>
            O horário atual segue reservado até você decidir.
          </Text>

          <Text style={styles.label}>Duração do atendimento</Text>
          <View style={styles.chips}>
            {DURATION_PRESETS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setDuration(m)}
                style={[styles.chip, duration === m && styles.chipActive]}
                accessibilityState={{ selected: duration === m }}
              >
                <Text style={[styles.chipText, duration === m && styles.chipTextActive]}>
                  {formatDuration(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.stack}>
        {isRequest ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnGreen, disabled && styles.disabled]}
              onPress={handleApprove}
              disabled={disabled}
              testID="admin-approve"
            >
              {busy === "approve" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnTextLight}>Aprovar remarcação</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, disabled && styles.disabled]}
              onPress={onReschedule}
              disabled={disabled}
              testID="admin-other-time"
            >
              <Text style={styles.btnTextBlue}>Escolher outro horário</Text>
            </TouchableOpacity>

            {rejecting ? (
              <View style={styles.rejectBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Motivo da recusa (opcional)"
                  placeholderTextColor={Color.mainTrunks}
                  value={reason}
                  onChangeText={setReason}
                  maxLength={300}
                  testID="admin-reject-reason"
                />
                <View style={styles.rejectActions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnOutline, styles.flex, disabled && styles.disabled]}
                    onPress={() => setRejecting(false)}
                    disabled={disabled}
                  >
                    <Text style={styles.btnTextBlue}>Voltar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnRed, styles.flex, disabled && styles.disabled]}
                    onPress={handleReject}
                    disabled={disabled}
                    testID="admin-reject-confirm"
                  >
                    {busy === "reject" ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.btnTextLight}>Confirmar recusa</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.btnOutlineRed, disabled && styles.disabled]}
                onPress={() => setRejecting(true)}
                disabled={disabled}
                testID="admin-reject"
              >
                <Text style={styles.btnTextRed}>Recusar pedido</Text>
              </TouchableOpacity>
            )}
          </>
        ) : null}

        {isScheduled ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnGreen, disabled && styles.disabled]}
              onPress={handleConfirm}
              disabled={disabled}
              testID="admin-confirm"
            >
              {busy === "confirm" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnTextLight}>Confirmar presença</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, disabled && styles.disabled]}
              onPress={onReschedule}
              disabled={disabled}
              testID="admin-reschedule"
            >
              <Text style={styles.btnTextBlue}>Remarcar</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {isConfirmed ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline, disabled && styles.disabled]}
            onPress={onReschedule}
            disabled={disabled}
            testID="admin-reschedule"
          >
            <Text style={styles.btnTextBlue}>Remarcar</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.btn, styles.btnOutlineRed, disabled && styles.disabled]}
          onPress={handleCancel}
          disabled={disabled}
          testID="admin-cancel"
        >
          {busy === "cancel" ? (
            <ActivityIndicator size="small" color={RED} />
          ) : (
            <Text style={styles.btnTextRed}>Cancelar atendimento</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  requestCard: {
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: ORANGE,
    backgroundColor: "#FFF6E8",
  },
  requestHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  requestTitle: { fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: "#7A4A00" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { fontSize: FontSize.fs_14, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  value: { fontSize: FontSize.fs_14, color: Color.mainBulma, fontFamily: FontFamily.dMSansBold, flexShrink: 1, textAlign: "right" },
  hint: { fontSize: FontSize.fs_12, lineHeight: LineHeight.lh_16, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGoten },
  chipActive: { backgroundColor: Color.piccolo, borderColor: Color.piccolo },
  chipText: { fontSize: FontSize.fs_14, color: Color.mainBulma, fontFamily: FontFamily.dMSansRegular },
  chipTextActive: { color: Color.mainGoten, fontFamily: FontFamily.dMSansBold },
  error: { color: RED, fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansRegular },
  stack: { gap: 10 },
  btn: { minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  flex: { flex: 1 },
  btnGreen: { backgroundColor: GREEN },
  btnRed: { backgroundColor: RED },
  btnOutline: { borderWidth: 1, borderColor: Color.piccolo, backgroundColor: Color.mainGoten },
  btnOutlineRed: { borderWidth: 1, borderColor: RED, backgroundColor: Color.mainGoten },
  btnTextLight: { color: "#FFFFFF", fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold },
  btnTextBlue: { color: Color.piccolo, fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold },
  btnTextRed: { color: RED, fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold },
  rejectBox: { gap: 10 },
  rejectActions: { flexDirection: "row", gap: 10 },
  input: { borderWidth: 1, borderColor: Color.mainBeerus, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, color: Color.mainBulma, backgroundColor: Color.mainGoten },
  disabled: { opacity: 0.6 },
  doneBox: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGoten },
  doneText: { flex: 1, fontSize: FontSize.fs_14, lineHeight: LineHeight.lh_24, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
});
