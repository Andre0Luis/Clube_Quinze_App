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
