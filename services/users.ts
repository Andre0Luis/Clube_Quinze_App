import { UpdateUserRequest, UserProfileResponse } from '../types/api';
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

export const getUserById = async (userId: number) => {
  if (isMockEnabled()) {
    return clone(mockData.getUserById(userId));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<UserProfileResponse>(`/users/${userId}`, config);
  return data;
};

export const updateUserById = async (userId: number, payload: UpdateUserRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.updateUserById(userId, payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.put<UserProfileResponse>(`/users/${userId}`, payload, config);
  return data;
};

export const getCurrentUser = async () => {
  if (isMockEnabled()) {
    return clone(mockData.getCurrentUser());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<UserProfileResponse>('/users/me', config);
  return data;
};

export const updateCurrentUser = async (payload: UpdateUserRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.updateCurrentUser(payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.put<UserProfileResponse>('/users/me', payload, config);
  return data;
};
