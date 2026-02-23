import { PaymentRenewalResponse } from "../types/api";
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

export interface ListPaymentRenewalsParams {
  windowDays?: number;
}

export const listPaymentRenewals = async (
  params?: ListPaymentRenewalsParams,
) => {
  if (isMockEnabled()) {
    return [] as PaymentRenewalResponse[];
  }

  const config = await withAuthHeader();
  const { data } = await api.get<PaymentRenewalResponse[]>(
    "/payments/renewals",
    {
      ...config,
      params,
    },
  );
  return data;
};
