import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    AppState,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Color, FontFamily, FontSize, LineHeight, Padding } from "../GlobalStyles";
import {
    chooseGoogleCalendar,
    disconnectGoogle,
    getGoogleIntegrationStatus,
    listGoogleCalendars,
    startGoogleConnect,
    syncGoogleNow,
} from "../services/googleIntegration";
import type { GoogleCalendarOption, GoogleIntegrationStatus } from "../types/api";
import { apiMessage } from "../utils/apiError";

const RETURN_MESSAGES: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Conta do Google conectada. Agora escolha a agenda dos agendamentos." },
  cancelled: { ok: false, text: "A conexão foi cancelada no Google. Nada foi alterado." },
  error: { ok: false, text: "Não foi possível concluir a conexão. Tente novamente." },
};

export default function AdminGoogleCalendarScreen() {
  const router = useRouter();
  // O backend devolve o navegador para cá com ?status=connected|cancelled|error (deep link do app).
  const { status: returnStatus } = useLocalSearchParams<{ status?: string }>();
  const [state, setState] = useState<GoogleIntegrationStatus | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendarOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [changing, setChanging] = useState(false);
  const [newName, setNewName] = useState("Clube Quinze");
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const status = await getGoogleIntegrationStatus();
      setState(status);
      if (status.status === "NEEDS_CALENDAR" || (status.status === "READY" && changing)) {
        setCalendars(await listGoogleCalendars());
      }
    } catch (e) {
      setBanner({ ok: false, text: apiMessage(e, "Não foi possível carregar o estado da integração.") });
    } finally {
      setLoading(false);
    }
  }, [changing]);

  useEffect(() => {
    void load();
  }, [load]);

  // Ao voltar do navegador (login do Google), recarrega o estado.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") void load();
    });
    return () => sub.remove();
  }, [load]);

  useEffect(() => {
    if (returnStatus && RETURN_MESSAGES[returnStatus]) {
      setBanner(RETURN_MESSAGES[returnStatus]);
    }
  }, [returnStatus]);

  const handleConnect = async () => {
    setBusy(true);
    try {
      const url = await startGoogleConnect();
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Não foi possível conectar", apiMessage(e, "Tente novamente em instantes."));
    } finally {
      setBusy(false);
    }
  };

  const handleChoose = async (payload: Parameters<typeof chooseGoogleCalendar>[0]) => {
    setBusy(true);
    try {
      const status = await chooseGoogleCalendar(payload);
      setState(status);
      setChanging(false);
      const synced = await syncGoogleNow().catch(() => 0);
      setBanner({
        ok: true,
        text: synced > 0
          ? `Agenda definida. ${synced} agendamento(s) enviado(s) ao Google; o restante segue em poucos minutos.`
          : "Agenda definida. Os agendamentos passam a aparecer nela automaticamente.",
      });
    } catch (e) {
      Alert.alert("Não foi possível definir a agenda", apiMessage(e, "Tente novamente."));
    } finally {
      setBusy(false);
    }
  };

  const handleSync = async () => {
    setBusy(true);
    try {
      const synced = await syncGoogleNow();
      setBanner({ ok: true, text: synced > 0 ? `${synced} agendamento(s) enviado(s) ao Google.` : "Tudo já está sincronizado." });
    } catch (e) {
      Alert.alert("Não foi possível sincronizar", apiMessage(e, "Tente novamente."));
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Desconectar o Google Agenda?",
      "Os agendamentos deixam de ser sincronizados e o acesso é revogado no Google. Os eventos já criados continuam na sua agenda do Google.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Desconectar",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await disconnectGoogle();
              setChanging(false);
              setCalendars([]);
              setBanner({ ok: true, text: "Conta desconectada." });
              await load();
            } catch (e) {
              Alert.alert("Não foi possível desconectar", apiMessage(e, "Tente novamente."));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const status = state?.status;
  const chooser = status === "NEEDS_CALENDAR" || (status === "READY" && changing);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={20} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Google Agenda</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="small" color={Color.piccolo} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.description}>
            Conecte a conta Google do clube para ver todos os agendamentos no Google Agenda, com cor por status
            (confirmado em verde). A sincronização é automática: criar, remarcar, confirmar e cancelar atualizam o evento.
          </Text>

          {banner ? (
            <View style={[styles.banner, banner.ok ? styles.bannerOk : styles.bannerError]}>
              <Text style={styles.bannerText}>{banner.text}</Text>
            </View>
          ) : null}

          {status === "NOT_CONFIGURED" ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Indisponível neste servidor</Text>
              <Text style={styles.muted}>A integração com o Google ainda não foi configurada no servidor.</Text>
            </View>
          ) : null}

          {status === "DISCONNECTED" || status === "REVOKED" ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{status === "REVOKED" ? "Acesso revogado" : "Nenhuma conta conectada"}</Text>
              <Text style={styles.muted}>
                {status === "REVOKED"
                  ? "O acesso foi removido no Google. Conecte novamente para voltar a sincronizar."
                  : "Você escolhe a conta Google e, depois, a agenda. Pode trocar ou desconectar quando quiser."}
              </Text>
              <TouchableOpacity style={[styles.primary, busy && styles.disabled]} onPress={handleConnect} disabled={busy}>
                {busy ? <ActivityIndicator size="small" color={Color.mainGoten} /> : (
                  <>
                    <Ionicons name="logo-google" size={18} color={Color.mainGoten} />
                    <Text style={styles.primaryText}>{status === "REVOKED" ? "Reconectar conta Google" : "Conectar conta Google"}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {status === "READY" && !changing ? (
            <View style={styles.card}>
              <View style={styles.statusRow}>
                <View style={styles.dot} />
                <Text style={styles.cardTitle}>Sincronizando</Text>
              </View>
              <Text style={styles.value}>{state?.calendarSummary ?? "Agenda"}</Text>
              <Text style={styles.muted}>{state?.googleEmail ?? "Conta Google"}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.secondary, busy && styles.disabled]} onPress={handleSync} disabled={busy}>
                  <Text style={styles.secondaryText}>Sincronizar agora</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondary} onPress={() => { setChanging(true); }} disabled={busy}>
                  <Text style={styles.secondaryText}>Trocar agenda</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.danger} onPress={handleDisconnect} disabled={busy}>
                <Text style={styles.dangerText}>Desconectar conta</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {chooser ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Escolha a agenda</Text>
              <Text style={styles.muted}>Conta: {state?.googleEmail ?? "Google"}</Text>

              <Text style={styles.label}>Criar uma agenda nova</Text>
              <TextInput style={styles.input} value={newName} onChangeText={setNewName} maxLength={100} placeholder="Nome da agenda" placeholderTextColor={Color.mainTrunks} />
              <TouchableOpacity style={[styles.primary, busy && styles.disabled]} onPress={() => handleChoose({ mode: "CREATE", name: newName.trim() || "Clube Quinze" })} disabled={busy}>
                <Text style={styles.primaryText}>Criar “{newName.trim() || "Clube Quinze"}”</Text>
              </TouchableOpacity>

              {calendars.length > 0 ? <Text style={styles.label}>…ou usar uma que já existe</Text> : null}
              {calendars.map((c) => (
                <TouchableOpacity key={c.id} style={styles.option} onPress={() => handleChoose({ mode: "EXISTING", calendarId: c.id })} disabled={busy}>
                  <Ionicons name="calendar-outline" size={18} color={Color.piccolo} />
                  <Text style={styles.optionText}>{c.summary}{c.primary ? " (principal)" : ""}</Text>
                </TouchableOpacity>
              ))}

              {status === "READY" ? (
                <TouchableOpacity style={styles.secondary} onPress={() => setChanging(false)} disabled={busy}>
                  <Text style={styles.secondaryText}>Cancelar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.danger} onPress={handleDisconnect} disabled={busy}>
                  <Text style={styles.dangerText}>Usar outra conta (desconectar)</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
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
  content: { paddingHorizontal: Padding.padding_24, paddingBottom: 48, gap: 14 },
  description: { fontSize: FontSize.fs_14, lineHeight: LineHeight.lh_24, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  banner: { padding: 12, borderRadius: 10, borderWidth: 1 },
  bannerOk: { backgroundColor: "#EAF7EF", borderColor: "#BFE5CC" },
  bannerError: { backgroundColor: "#FDECEE", borderColor: "#F5B8C0" },
  bannerText: { fontSize: FontSize.fs_14, color: Color.mainBulma, fontFamily: FontFamily.dMSansRegular },
  card: { gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGoten },
  cardTitle: { fontSize: FontSize.fs_18, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2E9E5B" },
  value: { fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  muted: { fontSize: FontSize.fs_14, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  label: { marginTop: 4, fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  input: { borderWidth: 1, borderColor: Color.mainBeerus, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: Color.mainBulma, backgroundColor: Color.mainGohan },
  option: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGohan },
  optionText: { flex: 1, fontSize: FontSize.fs_14, color: Color.mainBulma, fontFamily: FontFamily.dMSansRegular },
  actions: { flexDirection: "row", gap: 8 },
  primary: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, backgroundColor: Color.piccolo },
  primaryText: { color: Color.mainGoten, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14 },
  secondary: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Color.piccolo, backgroundColor: Color.mainGoten },
  secondaryText: { color: Color.piccolo, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14 },
  danger: { alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#D7263D", backgroundColor: Color.mainGoten },
  dangerText: { color: "#D7263D", fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14 },
  disabled: { opacity: 0.6 },
});
