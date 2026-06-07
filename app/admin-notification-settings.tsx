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
  getAdminNotificationSettings,
  updateAdminNotificationSettings,
} from "../services/notifications";

// Opções de antecedência (em minutos) que o admin pode escolher.
const PRESETS: { minutes: number; label: string }[] = [
  { minutes: 15, label: "15 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 60, label: "1 hora" },
  { minutes: 120, label: "2 horas" },
  { minutes: 180, label: "3 horas" },
  { minutes: 1440, label: "1 dia" },
];

export default function AdminNotificationSettingsScreen() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [offsets, setOffsets] = useState<number[]>([60, 30]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await getAdminNotificationSettings();
        setEnabled(s.enabled);
        setOffsets(s.offsets ?? []);
      } catch (e) {
        console.error("Falha ao carregar configurações de lembrete", e);
        Alert.alert("Erro", "Não foi possível carregar as configurações.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleOffset = useCallback((minutes: number) => {
    setOffsets((prev) =>
      prev.includes(minutes)
        ? prev.filter((m) => m !== minutes)
        : [...prev, minutes].sort((a, b) => b - a),
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (enabled && offsets.length === 0) {
      Alert.alert(
        "Selecione um horário",
        "Escolha pelo menos uma antecedência ou desative os lembretes.",
      );
      return;
    }
    setSaving(true);
    try {
      const saved = await updateAdminNotificationSettings({ enabled, offsets });
      setEnabled(saved.enabled);
      setOffsets(saved.offsets ?? []);
      Alert.alert("Pronto", "Configurações de lembrete salvas com sucesso.");
    } catch (e) {
      console.error("Falha ao salvar configurações", e);
      Alert.alert("Erro", "Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [enabled, offsets]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Lembretes de atendimento</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Color.piccolo} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.description}>
            Receba uma notificação antes de cada atendimento agendado. Escolha
            com quanta antecedência você quer ser avisado.
          </Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Receber lembretes</Text>
            <Switch
              trackColor={{ false: "#767577", true: Color.piccolo }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setEnabled}
              value={enabled}
            />
          </View>

          {enabled ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Antecedência</Text>
              <Text style={styles.sectionHint}>
                Você pode selecionar mais de um horário.
              </Text>
              <View style={styles.chips}>
                {PRESETS.map((p) => {
                  const active = offsets.includes(p.minutes);
                  return (
                    <TouchableOpacity
                      key={p.minutes}
                      style={[styles.chip, active && styles.chipActive]}
                      activeOpacity={0.8}
                      onPress={() => toggleOffset(p.minutes)}
                    >
                      {active ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={Color.mainGoten}
                        />
                      ) : null}
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Color.mainGoten} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.mainGohan },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Padding.padding_24,
    paddingVertical: Padding.padding_16,
    borderBottomWidth: 1,
    borderBottomColor: Color.mainBeerus,
  },
  backButton: { marginRight: 16 },
  title: { fontSize: FontSize.fs_18, fontFamily: FontFamily.dMSansBold, color: Color.hit },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: Padding.padding_24, gap: 24 },
  description: {
    fontSize: FontSize.fs_14,
    color: Color.mainTrunks,
    lineHeight: LineHeight.lh_24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Color.mainBeerus,
  },
  rowLabel: { fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: Color.hit },
  section: { gap: 8 },
  sectionTitle: { fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: Color.hit },
  sectionHint: { fontSize: FontSize.fs_12, color: Color.mainTrunks, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.15)",
    backgroundColor: Color.mainGohan,
  },
  chipActive: { backgroundColor: Color.piccolo, borderColor: Color.piccolo },
  chipText: { fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansBold, color: Color.hit },
  chipTextActive: { color: Color.mainGoten },
  saveButton: {
    marginTop: 12,
    backgroundColor: Color.piccolo,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: Color.mainGoten },
});
