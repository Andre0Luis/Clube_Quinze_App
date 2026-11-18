import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Color, FontFamily, FontSize, LineHeight } from "../GlobalStyles";
import { cancelAppointment, confirmAppointment } from "../services/appointments";
import type { AppointmentResponse } from "../types/api";
import { apiMessage } from "../utils/apiError";

const GREEN = "#2E9E5B";
const RED = "#D7263D";
const ORANGE = "#E07B00";

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const day = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} • ${time}`;
};

type Props = {
  appointment: AppointmentResponse;
  /** Chamado depois de confirmar/cancelar para a home recarregar o próximo agendamento. */
  onChanged: () => void;
};

/**
 * Destaque da home do cliente quando o atendimento está chegando e ainda não foi confirmado
 * (o mesmo momento do aviso "Confirme seu atendimento"): confirmar, pedir outro horário ou cancelar, sem sair da home.
 */
export default function ConfirmAppointmentCard({ appointment, onChanged }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"confirm" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setBusy("confirm");
    setError(null);
    try {
      await confirmAppointment(appointment.id);
      onChanged();
    } catch (e) {
      setError(apiMessage(e, "Não foi possível confirmar agora. Tente novamente."));
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = () =>
    Alert.alert(
      "Cancelar atendimento?",
      `${formatWhen(appointment.scheduledAt)}. O clube será avisado.`,
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar atendimento",
          style: "destructive",
          onPress: async () => {
            setBusy("cancel");
            setError(null);
            try {
              await cancelAppointment(appointment.id);
              onChanged();
            } catch (e) {
              setError(apiMessage(e, "Não foi possível cancelar agora."));
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );

  const disabled = busy !== null;

  return (
    <View style={styles.card} testID="confirm-card">
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="alert-circle" size={22} color={ORANGE} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Confirme seu atendimento</Text>
          <Text style={styles.when}>{formatWhen(appointment.scheduledAt)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btn, styles.btnGreen, disabled && styles.disabled]}
        onPress={handleConfirm}
        disabled={disabled}
        testID="confirm-presence"
        accessibilityRole="button"
      >
        {busy === "confirm" ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.btnTextLight}>Confirmar presença</Text>
        )}
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, styles.flex, disabled && styles.disabled]}
          onPress={() =>
            router.push({
              pathname: "/schedule",
              params: { appointmentId: String(appointment.id) },
            })
          }
          disabled={disabled}
          testID="confirm-reschedule"
          accessibilityRole="button"
        >
          <Text style={styles.btnTextBlue}>Pedir remarcação</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutlineRed, styles.flex, disabled && styles.disabled]}
          onPress={handleCancel}
          disabled={disabled}
          testID="confirm-cancel"
          accessibilityRole="button"
        >
          {busy === "cancel" ? (
            <ActivityIndicator size="small" color={RED} />
          ) : (
            <Text style={styles.btnTextRed}>Cancelar</Text>
          )}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: ORANGE,
    backgroundColor: "#FFF6E8",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  headerText: { flex: 1, gap: 2 },
  title: { fontSize: FontSize.fs_18, fontFamily: FontFamily.dMSansBold, color: "#7A4A00" },
  when: { fontSize: FontSize.fs_14, lineHeight: LineHeight.lh_18, fontFamily: FontFamily.dMSansRegular, color: "#7A4A00" },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  btn: { minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  btnGreen: { backgroundColor: GREEN },
  btnOutline: { borderWidth: 1, borderColor: Color.piccolo, backgroundColor: Color.mainGoten },
  btnOutlineRed: { borderWidth: 1, borderColor: RED, backgroundColor: Color.mainGoten },
  btnTextLight: { color: "#FFFFFF", fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold },
  btnTextBlue: { color: Color.piccolo, fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansBold },
  btnTextRed: { color: RED, fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansBold },
  disabled: { opacity: 0.6 },
  error: { color: RED, fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansRegular },
});
