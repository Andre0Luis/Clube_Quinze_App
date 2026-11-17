import {
    AppointmentRescheduleApprovalRequest,
    AppointmentRequest,
    AppointmentRescheduleRequest,
    AppointmentResponse,
    AppointmentStatus,
    AppointmentStatusUpdateRequest,
    AppointmentTier,
    AvailableSlotResponse,
    CalendarLinksResponse,
    PageResponse,
} from "../types/api";
import { ACTIVE_STATUSES } from "../constants/appointmentStatus";
import api from "./api";
import { mockData } from "./mock/data";
import { isMockEnabled } from "./mock/settings";
import { clone } from "./mock/utils";
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

export interface ListAppointmentsParams {
  status?: AppointmentStatus;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface ListMyAppointmentsParams {
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface ListAvailableSlotsParams {
  date: string;
  tier?: AppointmentTier;
  /** Só admin/funcionário: lista inícios (grade de 15 min) onde cabe essa duração. */
  durationMinutes?: number;
}

export const listAppointments = async (params?: ListAppointmentsParams) => {
  if (isMockEnabled()) {
    return clone(mockData.listAppointments());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PageResponse<AppointmentResponse>>(
    "/appointments",
    {
      ...config,
      params,
    },
  );
  return data;
};

export const listMyAppointments = async (params?: ListMyAppointmentsParams) => {
  if (isMockEnabled()) {
    return clone(mockData.listMyAppointments());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PageResponse<AppointmentResponse>>(
    "/appointments/me",
    {
      ...config,
      params,
    },
  );
  return data;
};

export const getAppointmentById = async (appointmentId: number) => {
  if (isMockEnabled()) {
    return clone(mockData.getAppointmentById(appointmentId));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<AppointmentResponse>(
    `/appointments/${appointmentId}`,
    config,
  );
  return data;
};

export const scheduleAppointment = async (payload: AppointmentRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.scheduleAppointment(payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<AppointmentResponse>(
    "/appointments",
    payload,
    config,
  );
  return data;
};

export const rescheduleAppointment = async (
  appointmentId: number,
  payload: AppointmentRescheduleRequest,
) => {
  if (isMockEnabled()) {
    return clone(mockData.rescheduleAppointment(appointmentId, payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.put<AppointmentResponse>(
    `/appointments/${appointmentId}/reschedule`,
    payload,
    config,
  );
  return data;
};

export const updateAppointmentStatus = async (
  appointmentId: number,
  payload: AppointmentStatusUpdateRequest,
) => {
  if (isMockEnabled()) {
    return clone(mockData.updateAppointmentStatus(appointmentId, payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.patch<AppointmentResponse>(
    `/appointments/${appointmentId}/status`,
    payload,
    config,
  );
  return data;
};

export const cancelAppointment = async (appointmentId: number) => {
  if (isMockEnabled()) {
    mockData.cancelAppointment(appointmentId);
    return;
  }

  const config = await withAuthHeader();
  await api.delete(`/appointments/${appointmentId}`, config);
};

export const listAvailableSlots = async ({
  date,
  tier,
  durationMinutes,
}: ListAvailableSlotsParams) => {
  if (isMockEnabled()) {
    return clone(mockData.listAvailableSlots(date, tier));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<AvailableSlotResponse>(
    "/appointments/availability",
    {
      ...config,
      params: {
        date,
        ...(tier ? { tier } : {}),
        ...(durationMinutes ? { durationMinutes } : {}),
      },
    },
  );
  return data;
};

/** Cliente confirma presença; admin/funcionário "mantém" o agendamento. Idempotente. */
export const confirmAppointment = async (appointmentId: number) => {
  if (isMockEnabled()) {
    return clone(
      mockData.updateAppointmentStatus(appointmentId, { status: "CONFIRMED" }),
    );
  }

  const config = await withAuthHeader();
  const { data } = await api.post<AppointmentResponse>(
    `/appointments/${appointmentId}/confirm`,
    {},
    config,
  );
  return data;
};

/**
 * Cliente propõe um novo horário. O agendamento fica RESCHEDULE_REQUESTED até o admin aprovar ou recusar;
 * o horário antigo continua reservado.
 */
export const requestReschedule = async (
  appointmentId: number,
  payload: { newDate: string; notes?: string },
) => {
  if (isMockEnabled()) {
    return clone(mockData.rescheduleAppointment(appointmentId, payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<AppointmentResponse>(
    `/appointments/${appointmentId}/reschedule-request`,
    payload,
    config,
  );
  return data;
};

/** Admin aprova a proposta (opcionalmente em outro horário e/ou com outra duração). */
export const approveReschedule = async (
  appointmentId: number,
  payload: AppointmentRescheduleApprovalRequest = {},
) => {
  if (isMockEnabled()) {
    return clone(
      mockData.updateAppointmentStatus(appointmentId, { status: "CONFIRMED" }),
    );
  }

  const config = await withAuthHeader();
  const { data } = await api.post<AppointmentResponse>(
    `/appointments/${appointmentId}/reschedule-approve`,
    payload,
    config,
  );
  return data;
};

/** Admin recusa a proposta; o agendamento volta ao horário original. */
export const rejectReschedule = async (
  appointmentId: number,
  reason?: string,
) => {
  if (isMockEnabled()) {
    return clone(
      mockData.updateAppointmentStatus(appointmentId, { status: "SCHEDULED" }),
    );
  }

  const config = await withAuthHeader();
  const { data } = await api.post<AppointmentResponse>(
    `/appointments/${appointmentId}/reschedule-reject`,
    reason ? { reason } : {},
    config,
  );
  return data;
};

/** Links "Adicionar ao Google Agenda" e download do .ics (link assinado, abre no celular). */
export const getCalendarLinks = async (appointmentId: number) => {
  if (isMockEnabled()) {
    return {
      googleCalendarUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE",
      icsUrl: "https://clubequinzeapp.cloud/appointment-calendar?token=mock",
    } satisfies CalendarLinksResponse;
  }

  const config = await withAuthHeader();
  const { data } = await api.get<CalendarLinksResponse>(
    `/appointments/${appointmentId}/calendar-links`,
    config,
  );
  return data;
};

/** Total de agendamentos ativos (agendado + confirmado + remarcação em análise). */
export const countActiveAppointments = async (): Promise<number> => {
  const pages = await Promise.all(
    ACTIVE_STATUSES.map((status) =>
      listAppointments({ status, page: 0, size: 1 }),
    ),
  );
  return pages.reduce(
    (sum, page) =>
      sum +
      (typeof page?.totalElements === "number"
        ? page.totalElements
        : (page?.content?.length ?? 0)),
    0,
  );
};

/** Agendamentos ativos de um cliente (junta os três status; o backend filtra por um status por vez). */
export const listActiveAppointments = async (params?: {
  clientId?: number;
  size?: number;
}) => {
  const pages = await Promise.all(
    ACTIVE_STATUSES.map((status) =>
      listAppointments({ ...params, status, page: 0 }),
    ),
  );
  return pages.flatMap((page) => page?.content ?? []);
};
