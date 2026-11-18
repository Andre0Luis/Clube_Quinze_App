/**
 * Quando a home do cliente deve destacar "Confirme seu atendimento".
 *
 * O backend manda o pedido de confirmação (push + e-mail) 1h30 antes do atendimento (configurável pelo admin).
 * No app, o destaque aparece enquanto o agendamento ainda está só AGENDADO e faltam até CONFIRM_WINDOW_MINUTES para
 * começar (folga acima dos 90 min para cobrir configurações maiores). Passou da hora de início há mais de
 * GRACE_AFTER_START_MINUTES, deixa de pedir.
 */
export const CONFIRM_WINDOW_MINUTES = 180;
export const GRACE_AFTER_START_MINUTES = 30;

export type ConfirmableAppointment = {
  status?: string;
  scheduledAt?: string;
};

export function needsConfirmation(
  appointment: ConfirmableAppointment | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!appointment || appointment.status !== "SCHEDULED" || !appointment.scheduledAt) {
    return false;
  }
  const start = new Date(appointment.scheduledAt).getTime();
  if (Number.isNaN(start)) {
    return false;
  }
  const minutesToStart = (start - now) / 60000;
  return (
    minutesToStart <= CONFIRM_WINDOW_MINUTES &&
    minutesToStart >= -GRACE_AFTER_START_MINUTES
  );
}
