import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Color, FontFamily, FontSize, LineHeight, Padding } from "../GlobalStyles";
import {
    getAppointmentConfirmationSettings,
    updateAppointmentConfirmationSettings,
} from "../services/googleIntegration";
import type { AppointmentConfirmationSettings } from "../types/api";
import { apiMessage } from "../utils/apiError";

const formatOffset = (m: number) =>
  m === 1440 ? "1 dia" : m === 720 ? "12 horas" : m % 60 === 0 ? `${m / 60} ${m / 60 === 1 ? "hora" : "horas"}` : m > 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m} min`;

const REQUEST_PRESETS = [60, 90, 120, 180, 1440];
const ALERT_PRESETS = [15, 30, 45, 60, 90];
const REMINDER_PRESETS = [1440, 720, 180, 120, 60, 30];

const toggle = (list: number[], value: number) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value].sort((a, b) => b - a);

function Chips({ options, selected, onPress }: { options: number[]; selected: (v: number) => boolean; onPress: (v: number) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((m) => (
        <TouchableOpacity key={m} onPress={() => onPress(m)} style={[styles.chip, selected(m) && styles.chipActive]}>
          <Text style={[styles.chipText, selected(m) && styles.chipTextActive]}>{formatOffset(m)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function AdminConfirmationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppointmentConfirmationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setSettings(await getAppointmentConfirmationSettings());
      } catch {
        Alert.alert("Erro", "Não foi possível carregar as configurações.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = useCallback(
    (patch: Partial<AppointmentConfirmationSettings>) => setSettings((prev) => (prev ? { ...prev, ...patch } : prev)),
    [],
  );

  const save = async () => {
    if (!settings) return;
    if (settings.adminAlertOffset >= settings.confirmationRequestOffset) {
      Alert.alert("Prazos incompatíveis", "O aviso a você precisa vir depois do pedido de confirmação ao cliente (prazo menor).");
      return;
    }
    setSaving(true);
    try {
      setSettings(await updateAppointmentConfirmationSettings(settings));
      Alert.alert("Salvo", "As configurações foram atualizadas.");
    } catch (e) {
      Alert.alert("Não foi possível salvar", apiMessage(e, "Tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={20} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Confirmação</Text>
      </View>

      {loading || !settings ? (
        <View style={styles.center}><ActivityIndicator size="small" color={Color.piccolo} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.description}>
            O cliente recebe um pedido para confirmar (ou remarcar/cancelar). Se não confirmar a tempo, você é avisado para
            manter, cancelar ou trocar o horário.
          </Text>

          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Pedir confirmação ao cliente</Text>
            <Switch value={settings.enabled} onValueChange={(v) => update({ enabled: v })} trackColor={{ true: Color.piccolo }} />
          </View>

          {settings.enabled ? (
            <>
              <Text style={styles.section}>Pedir a confirmação com antecedência de</Text>
              <Chips options={REQUEST_PRESETS} selected={(v) => settings.confirmationRequestOffset === v} onPress={(v) => update({ confirmationRequestOffset: v })} />

              <Text style={styles.section}>Me avisar se o cliente não confirmou, com antecedência de</Text>
              <Chips options={ALERT_PRESETS} selected={(v) => settings.adminAlertOffset === v} onPress={(v) => update({ adminAlertOffset: v })} />

              <Text style={styles.section}>Lembretes simples ao cliente</Text>
              <Chips options={REMINDER_PRESETS} selected={(v) => settings.clientReminderOffsets.includes(v)} onPress={(v) => update({ clientReminderOffsets: toggle(settings.clientReminderOffsets, v), skipRemindersWhenConfirmed: settings.skipRemindersWhenConfirmed.filter((s) => toggle(settings.clientReminderOffsets, v).includes(s)) })} />

              <Text style={styles.section}>Dispensar o lembrete se o cliente já confirmou</Text>
              <Chips options={settings.clientReminderOffsets} selected={(v) => settings.skipRemindersWhenConfirmed.includes(v)} onPress={(v) => update({ skipRemindersWhenConfirmed: toggle(settings.skipRemindersWhenConfirmed, v) })} />
            </>
          ) : (
            <Text style={styles.muted}>Com a confirmação desligada, os lembretes simples continuam sendo enviados.</Text>
          )}

          <TouchableOpacity style={[styles.save, saving && styles.disabled]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={Color.mainGoten} /> : <Text style={styles.saveText}>Salvar</Text>}
          </TouchableOpacity>
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
  description: { fontSize: FontSize.fs_14, lineHeight: LineHeight.lh_24, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGoten },
  rowLabel: { flex: 1, fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  section: { marginTop: 8, fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  muted: { fontSize: FontSize.fs_14, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGoten },
  chipActive: { backgroundColor: Color.piccolo, borderColor: Color.piccolo },
  chipText: { fontSize: FontSize.fs_14, color: Color.mainBulma, fontFamily: FontFamily.dMSansRegular },
  chipTextActive: { color: Color.mainGoten, fontFamily: FontFamily.dMSansBold },
  save: { marginTop: 16, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, backgroundColor: Color.piccolo },
  saveText: { color: Color.mainGoten, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_16 },
  disabled: { opacity: 0.6 },
});
