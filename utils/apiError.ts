import { isAxiosError } from "axios";

/** Mensagem de erro da API (campo "message" do backend, ex.: "Conflito: ...") ou um texto padrão. */
export const apiMessage = (error: unknown, fallback: string): string =>
  isAxiosError(error) && typeof error.response?.data?.message === "string"
    ? (error.response.data.message as string)
    : fallback;
