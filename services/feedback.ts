import {
    FeedbackAverageResponse,
    FeedbackRequest,
    FeedbackResponse,
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

export interface ListFeedbackParams {
  userId?: number;
  page?: number;
  size?: number;
}

export const listFeedback = async (params?: ListFeedbackParams) => {
  if (isMockEnabled()) {
    return clone(mockData.listFeedback());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PageResponse<FeedbackResponse>>('/feedbacks', {
    ...config,
    params,
  });
  return data;
};

export const listMyFeedback = async (params?: { page?: number; size?: number }) => {
  if (isMockEnabled()) {
    return clone(mockData.listMyFeedback());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PageResponse<FeedbackResponse>>('/feedbacks/me', {
    ...config,
    params,
  });
  return data;
};

export const submitFeedback = async (payload: FeedbackRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.submitFeedback(payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<FeedbackResponse>('/feedbacks', payload, config);
  return data;
};

export const getUserAverage = async (userId: number) => {
  if (isMockEnabled()) {
    return mockData.getUserAverage(userId);
  }

  const config = await withAuthHeader();
  const { data } = await api.get<number>(`/feedbacks/averages/users/${userId}`, config);
  return data;
};

export const getAverageByService = async () => {
  if (isMockEnabled()) {
    return clone(mockData.getAverageByService());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<FeedbackAverageResponse[]>('/feedbacks/averages/services', config);
  return data;
};
