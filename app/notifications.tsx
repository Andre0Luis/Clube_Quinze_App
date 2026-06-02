import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color, FontFamily, FontSize, Padding } from "../GlobalStyles";
import {
  enablePushNotifications,
  getPushPermissionStatus,
  type PushPermissionStatus,
} from "../hooks/usePushNotifications";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications";
import type { NotificationResponse } from "../types/api";

const formatWhen = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const iconFor = (type?: string) => {
  switch (type) {
    case "REMINDER":
      return "alarm-outline";
    case "PLAN":
      return "card-outline";
    case "NEWS":
      return "megaphone-outline";
    default:
      return "notifications-outline";
  }
};

export default function NotificationsListScreen() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<PushPermissionStatus>("granted");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, status] = await Promise.all([
        listNotifications(),
        getPushPermissionStatus(),
      ]);
      setItems(Array.isArray(data) ? data : []);
      setPermission(status);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const handleOpen = useCallback(async (item: NotificationResponse) => {
    if (item.read) return;
    // Atualização otimista + persistência
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
    );
    try {
      await markNotificationRead(item.id);
    } catch (error) {
      console.error("Failed to mark notification read", error);
    }
  }, []);

  const handleMarkAll = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  }, []);

  const handleEnablePermission = useCallback(async () => {
    if (permission === "denied") {
      // Já negado: precisa ir às configurações do SO.
      void Linking.openSettings();
      return;
    }
    const ok = await enablePushNotifications();
    setPermission(ok ? "granted" : "denied");
  }, [permission]);

  const hasUnread = items.some((n) => !n.read);
  const showPermissionCta =
    permission === "denied" || permission === "undetermined";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Notificações</Text>
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showPermissionCta ? (
        <TouchableOpacity style={styles.permissionBanner} onPress={handleEnablePermission}>
          <Ionicons name="notifications-off-outline" size={20} color={Color.mainGoten} />
          <View style={{ flex: 1 }}>
            <Text style={styles.permissionTitle}>Notificações desativadas</Text>
            <Text style={styles.permissionSubtitle}>
              {permission === "denied"
                ? "Toque para abrir as configurações e permitir notificações."
                : "Toque para ativar e receber avisos dos seus agendamentos."}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Color.mainGoten} />
        </TouchableOpacity>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          items.length === 0 ? styles.emptyContent : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read && styles.cardUnread]}
            activeOpacity={0.8}
            onPress={() => handleOpen(item)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={iconFor(item.type) as any} size={20} color={Color.piccolo} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title ?? "Notificação"}</Text>
              {item.message ? (
                <Text style={styles.cardMessage}>{item.message}</Text>
              ) : null}
              <Text style={styles.cardWhen}>{formatWhen(item.sentAt)}</Text>
            </View>
            {!item.read ? <View style={styles.unreadDot} /> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={Color.piccolo} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={Color.mainTrunks} />
              <Text style={styles.emptyText}>
                Você não tem notificações no momento.
              </Text>
            </View>
          )
        }
      />
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
  title: { flex: 1, fontSize: FontSize.fs_18, fontFamily: FontFamily.dMSansBold, color: Color.hit },
  markAllBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  markAllText: { color: Color.piccolo, fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansRegular },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Color.piccolo,
  },
  permissionTitle: { color: Color.mainGoten, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14 },
  permissionSubtitle: { color: Color.mainGoten, fontSize: FontSize.fs_12, opacity: 0.9 },
  listContent: { padding: 16, gap: 10 },
  emptyContent: { flexGrow: 1 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Color.mainGoten,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
  },
  cardUnread: { borderColor: Color.piccolo, backgroundColor: "#F5F8FF" },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.mainGohan,
  },
  cardTitle: { fontSize: FontSize.fs_15, fontFamily: FontFamily.dMSansBold, color: Color.hit },
  cardMessage: { fontSize: FontSize.fs_14, color: Color.mainTrunks, marginTop: 2, fontFamily: FontFamily.dMSansRegular },
  cardWhen: { fontSize: FontSize.fs_12, color: Color.mainTrunks, marginTop: 6, opacity: 0.8 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Color.piccolo },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  emptyText: { fontSize: FontSize.fs_16, color: Color.mainTrunks, textAlign: "center", fontFamily: FontFamily.dMSansRegular },
});
