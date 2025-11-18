import { AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest } from '../types/api';
import api from './api';
import { mockData } from './mock/data';
import { isMockEnabled } from './mock/settings';
import { clone } from './mock/utils';

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  if (isMockEnabled()) {
    return clone(mockData.login(payload));
  }

  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
  if (isMockEnabled()) {
    return clone(mockData.register(payload));
  }

  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const refresh = async (payload: RefreshTokenRequest): Promise<AuthResponse> => {
  if (isMockEnabled()) {
    return clone(mockData.refresh(payload));
  }

  const { data } = await api.post<AuthResponse>('/auth/refresh', payload);
  return data;
};

export const logout = async (payload: RefreshTokenRequest): Promise<void> => {
  if (isMockEnabled()) {
    mockData.logout(payload);
    return;
  }

  await api.post('/auth/logout', payload);
};
