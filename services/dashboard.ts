import { AdminDashboardResponse, UserPerformanceSummary } from '../types/api';
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

export const getUserPerformanceSummary = async () => {
  if (isMockEnabled()) {
    const currentUser = mockData.getCurrentUser();
    return clone(mockData.getUserSummary(currentUser.id));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<UserPerformanceSummary>('/users/me/summary', config);
  return data;
};

export const getAdminDashboardMetrics = async () => {
  if (isMockEnabled()) {
    return clone(mockData.getAdminDashboard());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<AdminDashboardResponse>('/admin/dashboard', config);
  return data;
};
