import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Color, FontFamily, FontSize, LineHeight, Padding } from "../GlobalStyles";
import { getStatusMeta } from "../constants/appointmentStatus";
import {
    approveReschedule,
    cancelAppointment,
    confirmAppointment,
    listAppointments,
    rejectReschedule,
} from "../services/appointments";
import { getUserById } from "../services/users";
import type { AppointmentResponse } from "../types/api";
import { apiMessage } from "../utils/apiError";

const DURATION_PRESETS = [30, 45, 60, 90, 120];
const UNCONFIRMED_WINDOW_HOURS = 48;

const formatWhen = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

const formatDuration = (minutes: number) =>
  minutes % 60 === 0 ? `${minutes / 60} h` : minutes > 60 ? `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`;

export default function AdminRequestsScreen() {
  const router = useRouter();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const [pending, setPending] = useState<AppointmentResponse[]>([]);
  const [unconfirmed, setUnconfirmed] = useState<AppointmentResponse[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    try {
      setError(null);
      const [requests, scheduled] = await Promise.all([
        listAppointments({ status: "RESCHEDULE_REQUESTED", size: 100 }),
        listAppointments({ status: "SCHEDULED", size: 200 }),
      ]);
      const now = Date.now();
      const limit = now + UNCONFIRMED_WINDOW_HOURS * 3600 * 1000;
      const pendingList = (requests.content ?? []).sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
      const unconfirmedList = (scheduled.content ?? [])
        .filter((a) => {
          const t = new Date(a.scheduledAt).getTime();
          return !Number.isNaN(t) && t >= now && t <= limit;
        })
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      setPending(pendingList);
      setUnconfirmed(unconfirmedList);

      const ids = Array.from(new Set([...pendingList, ...unconfirmedList].map((a) => a.clientId)));
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            return [id, (await getUserById(id)).name] as const;
          } catch {
            return [id, "Cliente"] as const;
          }
        }),
      );
      setNames((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    } catch {
      setError("Não foi possível carregar as solicitações. Puxe para atualizar.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const clientName = (a: AppointmentResponse) => names[a.clientId] ?? "Cliente";
  const goReschedule = (a: AppointmentResponse) =>
    router.push({ pathname: "/schedule", params: { appointmentId: String(a.id) } });

  const run = async (a: AppointmentResponse, action: () => Promise<unknown>, failure: string) => {
    setBusyId(a.id);
    try {
      await action();
      await load();
    } catch (e) {
      Alert.alert("Não foi possível concluir", apiMessage(e, failure));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = (a: AppointmentResponse) => {
    Alert.alert("Recusar remarcação?", `${clientName(a)} continua no horário atual (${formatWhen(a.scheduledAt)}).`, [
      { text: "Voltar", style: "cancel" },
      {
        text: "Recusar",
        style: "destructive",
        onPress: () => run(a, () => rejectReschedule(a.id, reasons[a.id]?.trim() || undefined), "Falha ao recusar."),
      },
    ]);
  };

  const handleApprove = async (a: AppointmentResponse) => {
    setBusyId(a.id);
    try {
      await approveReschedule(a.id, { durationMinutes: durations[a.id] ?? a.durationMinutes ?? 30 });
      await load();
    } catch (e) {
      const message = apiMessage(e, "Falha ao aprovar.");
      if (message.startsWith("Conflito")) {
        // Conflito de horário: o admin decide entre outro horário, recusar ou deixar como está.
        Alert.alert("Conflito de horário", message, [
          { text: "Escolher outro horário", onPress: () => goReschedule(a) },
          { text: "Recusar pedido", style: "destructive", onPress: () => handleReject(a) },
          { text: "Fechar", style: "cancel" },
        ]);
      } else {
        Alert.alert("Não foi possível aprovar", message);
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = (a: AppointmentResponse) => {
    Alert.alert("Cancelar atendimento?", `${clientName(a)} — ${formatWhen(a.scheduledAt)}. O cliente será avisado.`, [
      { text: "Voltar", style: "cancel" },
      { text: "Cancelar atendimento", style: "destructive", onPress: () => run(a, () => cancelAppointment(a.id), "Falha ao cancelar.") },
    ]);
  };

  const focusId = useMemo(() => (focus ? Number(focus) : null), [focus]);
  const empty = !loading && pending.length === 0 && unconfirmed.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={20} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Solicitações</Text>
        <TouchableOpacity
          onPress={() => router.push("/admin-confirmation-settings")}
          style={styles.iconButton}
          accessibilityLabel="Configurar confirmação"
        >
          <Ionicons name="settings-outline" size={20} color={Color.hit} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Color.piccolo} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {empty ? (
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-done-outline" size={36} color={Color.piccolo} />
              <Text style={styles.emptyText}>Tudo em dia: nenhum pedido de remarcação nem atendimento sem confirmação nas próximas 48 horas.</Text>
            </View>
          ) : null}

          {pending.length > 0 ? <Text style={styles.sectionTitle}>Pedidos de remarcação ({pending.length})</Text> : null}
          {pending.map((a) => {
            const duration = durations[a.id] ?? a.durationMinutes ?? 30;
            const busy = busyId === a.id;
            return (
              <View key={a.id} style={[styles.card, focusId === a.id ? styles.cardFocus : null]}>
                <Text style={styles.cardTitle}>{clientName(a)}</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Horário atual</Text>
                  <Text style={styles.value}>{formatWhen(a.scheduledAt)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Pediu para</Text>
                  <Text style={[styles.value, { color: getStatusMeta("RESCHEDULE_REQUESTED").background }]}>{formatWhen(a.proposedAt)}</Text>
                </View>
                <Text style={styles.hint}>O horário atual segue reservado até você decidir.</Text>

                <Text style={styles.label}>Duração do atendimento</Text>
                <View style={styles.chips}>
                  {DURATION_PRESETS.map((m) => (
                    <TouchableOpacity key={m} onPress={() => setDurations((p) => ({ ...p, [a.id]: m }))} style={[styles.chip, duration === m && styles.chipActive]}>
                      <Text style={[styles.chipText, duration === m && styles.chipTextActive]}>{formatDuration(m)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Motivo da recusa (opcional)"
                  placeholderTextColor={Color.mainTrunks}
                  value={reasons[a.id] ?? ""}
                  onChangeText={(t) => setReasons((p) => ({ ...p, [a.id]: t }))}
                  maxLength={300}
                />

                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.primary, busy && styles.disabled]} onPress={() => handleApprove(a)} disabled={busy}>
                    {busy ? <ActivityIndicator size="small" color={Color.mainGoten} /> : <Text style={styles.primaryText}>Aprovar</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondary} onPress={() => goReschedule(a)} disabled={busy}>
                    <Text style={styles.secondaryText}>Outro horário</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.danger} onPress={() => handleReject(a)} disabled={busy}>
                    <Text style={styles.dangerText}>Recusar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {unconfirmed.length > 0 ? <Text style={styles.sectionTitle}>Sem confirmação nas próximas 48 h ({unconfirmed.length})</Text> : null}
          {unconfirmed.map((a) => {
            const busy = busyId === a.id;
            return (
              <View key={a.id} style={[styles.card, focusId === a.id ? styles.cardFocus : null]}>
                <Text style={styles.cardTitle}>{clientName(a)}</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Horário</Text>
                  <Text style={styles.value}>{formatWhen(a.scheduledAt)}</Text>
                </View>
                <Text style={styles.hint}>O cliente ainda não confirmou presença.</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.primary, busy && styles.disabled]} onPress={() => run(a, () => confirmAppointment(a.id), "Falha ao manter.")} disabled={busy}>
                    {busy ? <ActivityIndicator size="small" color={Color.mainGoten} /> : <Text style={styles.primaryText}>Manter</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondary} onPress={() => goReschedule(a)} disabled={busy}>
                    <Text style={styles.secondaryText}>Trocar horário</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.danger} onPress={() => handleCancel(a)} disabled={busy}>
                    <Text style={styles.dangerText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.mainGohan },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: Padding.padding_24, paddingVertical: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: Color.mainGoten, borderWidth: 1, borderColor: Color.mainBeerus },
  title: { flex: 1, fontSize: FontSize.fs_24, lineHeight: LineHeight.lh_32, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: Padding.padding_24, paddingBottom: 48, gap: 12 },
  error: { color: "#D7263D", fontSize: FontSize.fs_14 },
  emptyBox: { alignItems: "center", gap: 12, paddingVertical: 48 },
  emptyText: { textAlign: "center", color: Color.mainTrunks, fontSize: FontSize.fs_14, lineHeight: LineHeight.lh_24, fontFamily: FontFamily.dMSansRegular },
  sectionTitle: { marginTop: 8, fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  card: { gap: 8, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGoten },
  cardFocus: { borderColor: "#E07B00", borderWidth: 2 },
  cardTitle: { fontSize: FontSize.fs_18, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { fontSize: FontSize.fs_14, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  value: { fontSize: FontSize.fs_14, color: Color.mainBulma, fontFamily: FontFamily.dMSansBold, flexShrink: 1, textAlign: "right" },
  hint: { fontSize: FontSize.fs_12, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGohan },
  chipActive: { backgroundColor: Color.piccolo, borderColor: Color.piccolo },
  chipText: { fontSize: FontSize.fs_14, color: Color.mainBulma, fontFamily: FontFamily.dMSansRegular },
  chipTextActive: { color: Color.mainGoten, fontFamily: FontFamily.dMSansBold },
  input: { borderWidth: 1, borderColor: Color.mainBeerus, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: Color.mainBulma, backgroundColor: Color.mainGohan },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  primary: { flexGrow: 1, minWidth: 90, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 10, backgroundColor: "#2E9E5B" },
  primaryText: { color: "#FFFFFF", fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14 },
  secondary: { flexGrow: 1, minWidth: 110, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: Color.piccolo, backgroundColor: Color.mainGoten },
  secondaryText: { color: Color.piccolo, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14 },
  danger: { flexGrow: 1, minWidth: 90, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#D7263D", backgroundColor: Color.mainGoten },
  dangerText: { color: "#D7263D", fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14 },
  disabled: { opacity: 0.6 },
});
