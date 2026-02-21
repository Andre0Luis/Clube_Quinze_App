import {
    UpdateUserRequest,
    UserProfileResponse,
    UserSummary,
} from "../types/api";
import api from "./api";
import { mockMembers } from "./mock/admin-members";
import { mockData } from "./mock/data";
import { isMockEnabled } from "./mock/settings";
import { clone } from "./mock/utils";
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

export const getUserById = async (userId: number) => {
  if (isMockEnabled()) {
    return clone(mockData.getUserById(userId));
  }

  const config = await withAuthHeader();
  const { data } = await api.get<UserProfileResponse>(
    `/users/${userId}`,
    config,
  );
  return data;
};

export const updateUserById = async (
  userId: number,
  payload: UpdateUserRequest,
) => {
  if (isMockEnabled()) {
    return clone(mockData.updateUserById(userId, payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.put<UserProfileResponse>(
    `/users/${userId}`,
    payload,
    config,
  );
  return data;
};

export const updateUserByIdWithUpload = async (
  userId: number,
  dataPayload: UpdateUserRequest,
  files?: {
    profilePicture?: { uri: string; name: string; type: string };
    gallery?: Array<{ uri: string; name: string; type: string }>;
    galleryPosition?: number[];
    folder?: string;
  },
) => {
  if (isMockEnabled()) {
    return clone(mockData.updateUserById(userId, dataPayload));
  }

  const form = new FormData();
  form.append("data", JSON.stringify(dataPayload));

  if (files?.profilePicture) {
    form.append("profilePicture", files.profilePicture as any);
  }

  if (files?.gallery) {
    files.gallery.forEach((file) => {
      form.append("gallery", file as any);
    });
  }

  if (files?.galleryPosition) {
    files.galleryPosition.forEach((pos) => {
      form.append("galleryPosition", String(pos));
    });
  }

  if (files?.folder) {
    form.append("folder", files.folder);
  }

  const config = await withAuthHeader();
  const { data } = await api.put<UserProfileResponse>(
    `/users/${userId}/upload`,
    form,
    {
      ...config,
      headers: {
        ...(config.headers ?? {}),
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
};

export const getCurrentUser = async () => {
  if (isMockEnabled()) {
    return clone(mockData.getCurrentUser());
  }

  const config = await withAuthHeader();
  const { data } = await api.get<UserProfileResponse>("/users/me", config);
  return data;
};

export const updateCurrentUser = async (payload: UpdateUserRequest) => {
  if (isMockEnabled()) {
    return clone(mockData.updateCurrentUser(payload));
  }

  const config = await withAuthHeader();
  const { data } = await api.put<UserProfileResponse>(
    "/users/me",
    payload,
    config,
  );
  return data;
};

export const updateCurrentUserWithUpload = async (
  dataPayload: UpdateUserRequest,
  files?: {
    profilePicture?: { uri: string; name: string; type: string };
    gallery?: Array<{ uri: string; name: string; type: string }>;
    galleryPosition?: number[];
    folder?: string;
  },
) => {
  if (isMockEnabled()) {
    return clone(mockData.updateCurrentUser(dataPayload));
  }

  const form = new FormData();
  form.append("data", JSON.stringify(dataPayload));

  if (files?.profilePicture) {
    form.append("profilePicture", files.profilePicture as any);
  }

  if (files?.gallery) {
    files.gallery.forEach((file) => {
      form.append("gallery", file as any);
    });
  }

  if (files?.galleryPosition) {
    files.galleryPosition.forEach((pos) => {
      form.append("galleryPosition", String(pos));
    });
  }

  if (files?.folder) {
    form.append("folder", files.folder);
  }

  const config = await withAuthHeader();
  const { data } = await api.put<UserProfileResponse>(
    "/users/me/upload",
    form,
    {
      ...config,
      headers: {
        ...(config.headers ?? {}),
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
};

export interface ListUsersParams {
  membershipTier?: string;
}

export const listUsers = async (params?: ListUsersParams) => {
  if (isMockEnabled()) {
    const mocked: UserSummary[] = mockMembers.map((member) => ({
      id: member.id,
      name: member.name,
      email: `${member.name.toLowerCase().replace(/[^a-z0-9]+/g, ".") || "user"}@mock.com`,
      phone: "",
      birthDate: "",
      membershipTier: member.membershipTier,
      role:
        member.membershipTier === "QUINZE_SELECT"
          ? "CLUB_SELECT"
          : "CLUB_STANDARD",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      plan: undefined,
    }));
    return mocked;
  }

  const config = await withAuthHeader();
  const { data } = await api.get<UserSummary[] | { content?: UserSummary[] }>(
    "/users",
    {
      ...config,
      params: params?.membershipTier
        ? { membershipTier: params.membershipTier }
        : undefined,
    },
  );
  const resolved = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : [];
  return resolved;
};
