import { PreferenceRequest, PreferenceResponse } from '../types/api';
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

export const listPreferences = async (userId?: number) => {
  if (isMockEnabled()) {
    return clone(mockData.listPreferences(userId));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PreferenceResponse[]>('/preferences', {
    ...config,
    params: userId ? { userId } : undefined,
  });
  return data;
};

export const upsertPreference = async (payload: PreferenceRequest, userId?: number) => {
  if (isMockEnabled()) {
    return clone(mockData.upsertPreference(payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<PreferenceResponse>('/preferences', payload, {
    ...config,
    params: userId ? { userId } : undefined,
  });
  return data;
};

export const updatePreference = async (preferenceId: number, payload: PreferenceRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.updatePreference(preferenceId, payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.put<PreferenceResponse>(`/preferences/${preferenceId}`, payload, config);
  return data;
};

export const deletePreference = async (preferenceId: number) => {
  if (isMockEnabled()) {
    mockData.deletePreference(preferenceId);
    return;
  }

  const config = await withAuthHeader();
  await api.delete(`/preferences/${preferenceId}`, config);
};
