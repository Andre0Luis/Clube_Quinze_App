import {
    AuthResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
} from "../types/api";
import api from "./api";
import { mockData } from "./mock/data";
import { isMockEnabled } from "./mock/settings";
import { clone } from "./mock/utils";

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  if (isMockEnabled()) {
    return clone(mockData.login(payload));
  }

  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const register = async (
  payload: RegisterRequest,
): Promise<AuthResponse> => {
  if (isMockEnabled()) {
    return clone(mockData.register(payload));
  }

  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const refresh = async (
  payload: RefreshTokenRequest,
): Promise<AuthResponse> => {
  if (isMockEnabled()) {
    return clone(mockData.refresh(payload));
  }

  const { data } = await api.post<AuthResponse>("/auth/refresh", payload);
  return data;
};

export const logout = async (payload: RefreshTokenRequest): Promise<void> => {
  if (isMockEnabled()) {
    mockData.logout(payload);
    return;
  }

  await api.post("/auth/logout", payload);
};

export const RESET_BASE_URL = "https://clubequinzeapp.cloud/reset-password";

export const buildResetUrl = (token: string) =>
  `${RESET_BASE_URL}?token=${encodeURIComponent(token)}`;

export const forgotPassword = async (email: string): Promise<void> => {
  if (isMockEnabled()) {
    return;
  }

  await api.post("/auth/forgot-password", { email });
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  if (isMockEnabled()) {
    return;
  }

  await api.post("/auth/reset-password", { token, newPassword });
};
