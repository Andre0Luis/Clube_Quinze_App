import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color, FontFamily, FontSize, LineHeight, Padding } from "../../GlobalStyles";
import {
  deleteCurrentPushToken,
  enablePushNotifications,
  getPushPermissionStatus,
} from "../../hooks/usePushNotifications";
import { disablePushTokens } from "../../services/notifications";

const PREF_KEY = "push_notifications_enabled";

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  // Estado efetivo = preferência do usuário AND permissão concedida no SO.
  const syncState = useCallback(async () => {
    const [pref, permission] = await Promise.all([
      SecureStore.getItemAsync(PREF_KEY),
      getPushPermissionStatus(),
    ]);
    const prefEnabled = pref !== "false";
    setIsEnabled(prefEnabled && permission === "granted");
  }, []);

  useEffect(() => {
    void syncState();
  }, [syncState]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const granted = await enablePushNotifications();
      if (granted) {
        await SecureStore.setItemAsync(PREF_KEY, "true");
        setIsEnabled(true);
      } else {
        // Permissão negada no SO — orientar a abrir configurações.
        setIsEnabled(false);
        Alert.alert(
          "Permissão necessária",
          "As notificações estão bloqueadas nas configurações do sistema. Deseja abri-las para permitir?",
          [
            { text: "Agora não", style: "cancel" },
            { text: "Abrir configurações", onPress: () => Linking.openSettings() },
          ],
        );
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      await SecureStore.setItemAsync(PREF_KEY, "false");
      setIsEnabled(false);
      try {
        await disablePushTokens();
      } catch (e) {
        console.warn("Failed to disable push tokens on backend", e);
      }
      await deleteCurrentPushToken();
    } finally {
      setBusy(false);
    }
  }, []);

  const toggleSwitch = useCallback(
    (value: boolean) => {
      if (busy) return;
      if (value) void enable();
      else void disable();
    },
    [busy, enable, disable],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>
          Receba lembretes de agendamentos e atualizações importantes sobre o seu clube.
        </Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Habilitar Notificações Push</Text>
          {busy ? (
            <ActivityIndicator color={Color.piccolo} />
          ) : (
            <Switch
              trackColor={{ false: "#767577", true: Color.piccolo }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
              disabled={busy}
            />
          )}
        </View>
      </View>
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
  content: { padding: Padding.padding_24, gap: 24 },
  description: { fontSize: FontSize.fs_14, color: Color.mainTrunks, lineHeight: LineHeight.lh_24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Color.mainBeerus,
  },
  rowLabel: { fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: Color.hit },
});
