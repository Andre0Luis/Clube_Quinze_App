// Flags de funcionalidade do app.
// BOOKING_ENABLED=false: cliente NÃO pode agendar/escolher horário (apenas visualiza
// seus agendamentos). Reativar quando o fluxo de "solicitação de agendamento" (com
// aprovação do admin) estiver pronto.
export const BOOKING_ENABLED = false;

// Google Agenda do clube (conectar conta do admin e sincronizar). Congelado enquanto o Google não aprova o app
// (verificação do domínio). O backend e as telas já existem: basta virar para true quando liberar.
export const GOOGLE_CALENDAR_ENABLED = false;
