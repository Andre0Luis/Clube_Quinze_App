import { Platform } from "react-native";

import api from "./api";
import { getAccessToken } from "./storage";

const withAuthHeader = async () => {
  const token = await getAccessToken();
  if (!token) {
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } as const;
};

/**
 * Tenta registrar o expoPushToken no backend. A chamada é tolerante a erro/404,
 * pois a API ainda será implementada. Não dispara throw para não quebrar o app.
 */
export const registerPushToken = async (
  expoPushToken: string,
  appVersion?: string,
) => {
  if (!expoPushToken) return;

  try {
    const config = await withAuthHeader();
    await api.post(
      "/notifications/tokens",
      {
        token: expoPushToken,
        platform: Platform.OS,
        appVersion,
      },
      config,
    );
  } catch (error) {
    console.warn(
      "Falha ao registrar expoPushToken no backend (ignorado):",
      error,
    );
  }
};
