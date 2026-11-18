/**
 * Para onde levar o usuário quando ele toca numa notificação. O backend manda `kind` e `appointmentId`
 * (no push, em `data`; na lista, nos campos da notificação).
 *  - appointment_confirmation  → detalhe do agendamento, destacando "Confirmar presença"
 *  - admin_* (pedido de remarcação, sem confirmação…) → detalhe do agendamento do CLIENTE em modo admin,
 *    onde estão aprovar / recusar / outro horário / cancelar. Sem id, cai na lista de solicitações.
 *  - demais (lembretes, remarcado, cancelado…) → detalhe do agendamento
 */
export type PushData = Record<string, unknown> | undefined | null;

const asString = (value: unknown): string | undefined =>
  value === undefined || value === null ? undefined : String(value);

export function routeForNotification(data: PushData): string | null {
  const id = asString(data?.appointmentId);
  const kind = asString(data?.kind);

  if (kind === "admin_unconfirmed" || kind === "admin_reschedule_request") {
    return id ? `/appointments/${id}?allowAdmin=1` : "/admin-requests";
  }
  if (!id) {
    return null;
  }
  if (kind === "appointment_confirmation") {
    return `/appointments/${id}?action=confirm`;
  }
  return `/appointments/${id}`;
}
