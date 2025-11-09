import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  membershipTier: 'CLUB_15' | 'QUINZE_SELECT';
  phone?: string;
  birthDate?: string;
  planId?: number;
}

export async function registerUser(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}
