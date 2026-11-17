import {
    AppointmentConfirmationSettings,
    ChooseCalendarRequest,
    GoogleCalendarOption,
    GoogleIntegrationStatus,
} from "../types/api";
import api from "./api";
import { isMockEnabled } from "./mock/settings";
import { getAccessToken } from "./storage";

const withAuthHeader = async () => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Access token is not available.");
  }
  return { headers: { Authorization: `Bearer ${token}` } } as const;
};

const MOCK_STATUS: GoogleIntegrationStatus = {
  configured: true,
  status: "DISCONNECTED",
};

/** Estado da conexão com o Google Agenda (só admin). */
export const getGoogleIntegrationStatus = async () => {
  if (isMockEnabled()) {
    return MOCK_STATUS;
  }
  const config = await withAuthHeader();
  const { data } = await api.get<GoogleIntegrationStatus>(
    "/admin/integrations/google",
    config,
  );
  return data;
};

/** Devolve o endereço de login do Google; abra no navegador. O Google volta para o backend e este para o app. */
export const startGoogleConnect = async () => {
  if (isMockEnabled()) {
    return "https://accounts.google.com/";
  }
  const config = await withAuthHeader();
  const { data } = await api.post<{ authUrl: string }>(
    "/admin/integrations/google/connect",
    {},
    config,
  );
  return data.authUrl;
};

export const listGoogleCalendars = async () => {
  if (isMockEnabled()) {
    return [] as GoogleCalendarOption[];
  }
  const config = await withAuthHeader();
  const { data } = await api.get<GoogleCalendarOption[]>(
    "/admin/integrations/google/calendars",
    config,
  );
  return data;
};

export const chooseGoogleCalendar = async (payload: ChooseCalendarRequest) => {
  if (isMockEnabled()) {
    return MOCK_STATUS;
  }
  const config = await withAuthHeader();
  const { data } = await api.put<GoogleIntegrationStatus>(
    "/admin/integrations/google/calendar",
    payload,
    config,
  );
  return data;
};

/** Sincroniza agora o que ainda não está no Google. Devolve quantos agendamentos foram enviados. */
export const syncGoogleNow = async () => {
  if (isMockEnabled()) {
    return 0;
  }
  const config = await withAuthHeader();
  const { data } = await api.post<{ synced: number }>(
    "/admin/integrations/google/sync",
    {},
    config,
  );
  return data.synced;
};

export const disconnectGoogle = async () => {
  if (isMockEnabled()) {
    return;
  }
  const config = await withAuthHeader();
  await api.delete("/admin/integrations/google", config);
};

/** Parâmetros do fluxo de confirmação (prazos, lembretes, liga/desliga). */
export const getAppointmentConfirmationSettings = async () => {
  if (isMockEnabled()) {
    return {
      enabled: true,
      confirmationRequestOffset: 90,
      adminAlertOffset: 60,
      clientReminderOffsets: [1440, 180, 60, 30],
      skipRemindersWhenConfirmed: [60],
    } satisfies AppointmentConfirmationSettings;
  }
  const config = await withAuthHeader();
  const { data } = await api.get<AppointmentConfirmationSettings>(
    "/admin/settings/appointments",
    config,
  );
  return data;
};

export const updateAppointmentConfirmationSettings = async (
  payload: AppointmentConfirmationSettings,
) => {
  if (isMockEnabled()) {
    return payload;
  }
  const config = await withAuthHeader();
  const { data } = await api.put<AppointmentConfirmationSettings>(
    "/admin/settings/appointments",
    payload,
    config,
  );
  return data;
};
