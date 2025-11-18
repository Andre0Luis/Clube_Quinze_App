import { CommentRequest, CommentResponse, LikeResponse, PageResponse, PostRequest, PostResponse } from '../types/api';
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

export interface ListPostsParams {
  page?: number;
  size?: number;
  authorId?: number;
}

export const listPosts = async (params?: ListPostsParams) => {
  if (isMockEnabled()) {
    return clone(mockData.listPosts());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PageResponse<PostResponse>>('/community/posts', {
    ...config,
    params,
  });
  return data;
};

export const createPost = async (payload: PostRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.createPost(payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<PostResponse>('/community/posts', payload, config);
  return data;
};

export const getPost = async (postId: number) => {
  if (isMockEnabled()) {
    return clone(mockData.getPost(postId));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PostResponse>(`/community/posts/${postId}`, config);
  return data;
};

export const deletePost = async (postId: number) => {
  if (isMockEnabled()) {
    mockData.deletePost(postId);
    return;
  }

  const config = await withAuthHeader();
  await api.delete(`/community/posts/${postId}`, config);
};

export const likePost = async (postId: number) => {
  if (isMockEnabled()) {
    return clone(mockData.likePost(postId));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<LikeResponse>(`/community/posts/${postId}/likes`, undefined, config);
  return data;
};

export const unlikePost = async (postId: number) => {
  if (isMockEnabled()) {
    mockData.unlikePost(postId);
    return;
  }

  const config = await withAuthHeader();
  await api.delete(`/community/posts/${postId}/likes`, config);
};

export const addComment = async (postId: number, payload: CommentRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.addComment(postId, payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.post<CommentResponse>(
    `/community/posts/${postId}/comments`,
    payload,
    config,
  );
  return data;
};
