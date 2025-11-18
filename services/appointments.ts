import {
    AppointmentRequest,
    AppointmentRescheduleRequest,
    AppointmentResponse,
    AppointmentStatus,
    AppointmentStatusUpdateRequest,
    AvailableSlotResponse,
    PageResponse,
} from '../types/api';
import api from './api';
import { mockData } from './mock/data';
import { isMockEnabled } from './mock/settings';
import { clone } from './mock/utils';
import { getAccessToken } from './storage';

const withAuthHeader = async () => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Access token is not available.');
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
  tier?: 'CLUB_15' | 'QUINZE_SELECT';
}

export const listAppointments = async (params?: ListAppointmentsParams) => {
  if (isMockEnabled()) {
    return clone(mockData.listAppointments());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PageResponse<AppointmentResponse>>('/appointments', {
    ...config,
    params,
  });
  return data;
};

export const listMyAppointments = async (params?: ListMyAppointmentsParams) => {
  if (isMockEnabled()) {
    return clone(mockData.listMyAppointments());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PageResponse<AppointmentResponse>>('/appointments/me', {
    ...config,
    params,
  });
  return data;
};

export const getAppointmentById = async (appointmentId: number) => {
  if (isMockEnabled()) {
    return clone(mockData.getAppointmentById(appointmentId));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<AppointmentResponse>(`/appointments/${appointmentId}`, config);
  return data;
};

export const scheduleAppointment = async (payload: AppointmentRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.scheduleAppointment(payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<AppointmentResponse>('/appointments', payload, config);
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

export const listAvailableSlots = async ({ date, tier }: ListAvailableSlotsParams) => {
  if (isMockEnabled()) {
    return clone(mockData.listAvailableSlots(date, tier));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<AvailableSlotResponse>('/appointments/availability', {
    ...config,
    params: tier ? { date, tier } : { date },
  });
  return data;
};
