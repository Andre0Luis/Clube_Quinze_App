import type { NotificationResponse } from "../types/api";
import api from "./api";
import { isMockEnabled } from "./mock/settings";
import { getAccessToken } from "./storage";

const withAuthHeader = async () => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Access token is not available.");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } as const;
};

export const listNotifications = async () => {
  if (isMockEnabled()) {
    return [] as NotificationResponse[];
  }

  const config = await withAuthHeader();
  const { data } = await api.get<NotificationResponse[]>(
    "/notifications",
    config,
  );
  return data;
};

export const registerPushToken = async (token: string, platform: string) => {
  const config = await withAuthHeader();
  await api.post("/notifications/tokens", { token, platform }, config);
};

export const getUnreadCount = async (): Promise<number> => {
  if (isMockEnabled()) return 0;
  const config = await withAuthHeader();
  const { data } = await api.get<{ count: number }>(
    "/notifications/unread-count",
    config,
  );
  return data?.count ?? 0;
};

export const markNotificationRead = async (id: number) => {
  if (isMockEnabled()) return;
  const config = await withAuthHeader();
  await api.patch(`/notifications/${id}/read`, undefined, config);
};

export const markAllNotificationsRead = async () => {
  if (isMockEnabled()) return;
  const config = await withAuthHeader();
  await api.post("/notifications/read-all", undefined, config);
};

// Desativa as notificações push do usuário no backend (invalida os tokens ativos).
export const disablePushTokens = async () => {
  if (isMockEnabled()) return;
  const config = await withAuthHeader();
  await api.delete("/notifications/tokens", config);
};

// ── Configuração de lembretes do admin (admin-only) ───────────────────────────

export type AdminNotificationSettings = {
  enabled: boolean;
  offsets: number[]; // minutos antes do atendimento, ex: [60, 30]
};

export const getAdminNotificationSettings =
  async (): Promise<AdminNotificationSettings> => {
    const config = await withAuthHeader();
    const { data } = await api.get<AdminNotificationSettings>(
      "/admin/settings/notifications",
      config,
    );
    return data;
  };

export const updateAdminNotificationSettings = async (
  settings: AdminNotificationSettings,
): Promise<AdminNotificationSettings> => {
  const config = await withAuthHeader();
  const { data } = await api.put<AdminNotificationSettings>(
    "/admin/settings/notifications",
    settings,
    config,
  );
  return data;
};
