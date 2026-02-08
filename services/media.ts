import type { MediaUploadResponse } from "../types/api";
import api from "./api";
import { isMockEnabled } from "./mock/settings";
import { getAccessToken } from "./storage";

const withAuthHeader = async () => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Access token is not available.");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } as const;
};

export const uploadMedia = async (
  file: { uri: string; name: string; type: string },
  folder?: string,
) => {
  if (isMockEnabled()) {
    return {
      url: file.uri,
      path: file.name,
      size: 0,
      contentType: file.type,
    } as MediaUploadResponse;
  }

  const form = new FormData();
  form.append("file", file as any);

  const config = await withAuthHeader();
  const { data } = await api.post<MediaUploadResponse>("/media/upload", form, {
    ...config,
    params: folder ? { folder } : undefined,
    headers: {
      ...(config.headers ?? {}),
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
