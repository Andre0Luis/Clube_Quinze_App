import type { AppointmentStatus } from "../types/api";

/** Status em que o atendimento ainda vai acontecer (aparece em "próximos", pode ser confirmado/remarcado/cancelado). */
export const ACTIVE_STATUSES: AppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "RESCHEDULE_REQUESTED",
];

export const isActiveStatus = (status?: string): boolean =>
  ACTIVE_STATUSES.includes(status as AppointmentStatus);

export interface StatusMeta {
  label: string;
  /** Fundo do selo (também usado como cor de destaque). */
  background: string;
  text: string;
}

// Confirmado = verde; agendado (ainda sem confirmação) = azul-acinzentado; remarcação em análise = laranja.
const META: Record<string, StatusMeta> = {
  SCHEDULED: { label: "Agendado", background: "#5B6B8C", text: "#FFFFFF" },
  CONFIRMED: { label: "Confirmado", background: "#2E9E5B", text: "#FFFFFF" },
  RESCHEDULE_REQUESTED: {
    label: "Remarcação em análise",
    background: "#E07B00",
    text: "#FFFFFF",
  },
  COMPLETED: { label: "Concluído", background: "#6B7280", text: "#FFFFFF" },
  CANCELED: { label: "Cancelado", background: "#D7263D", text: "#FFFFFF" },
};

export const getStatusMeta = (status?: string): StatusMeta =>
  META[status ?? ""] ?? {
    label: status ? status : "Desconhecido",
    background: "#E4E7EC",
    text: "#1D2939",
  };
