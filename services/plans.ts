import { PlanRequest, PlanResponse } from '../types/api';
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

export const createPlan = async (payload: PlanRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.createPlan(payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<PlanResponse>('/plans', payload, config);
  return data;
};

export const updatePlan = async (planId: number, payload: PlanRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.updatePlan(planId, payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.put<PlanResponse>(`/plans/${planId}`, payload, config);
  return data;
};

export const deletePlan = async (planId: number) => {
  if (isMockEnabled()) {
    mockData.deletePlan(planId);
    return;
  }

  const config = await withAuthHeader();
  await api.delete(`/plans/${planId}`, config);
};

export const listPlans = async () => {
  if (isMockEnabled()) {
    return clone(mockData.listPlans());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PlanResponse[]>('/plans', config);
  return data;
};
