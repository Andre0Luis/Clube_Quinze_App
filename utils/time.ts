/** Textos de tempo para a interface (lógica pura, testável no Node). */

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const toTime = (iso?: string | null): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
};

/** "agora", "há 5 min", "há 3 h", "ontem" ou "12/11" — para notificações. */
export function formatRelative(iso: string | undefined | null, now: number = Date.now()): string {
  const t = toTime(iso);
  if (t === null) return "";
  const diff = now - t;
  if (diff < MIN) return "agora";
  if (diff < HOUR) return `há ${Math.floor(diff / MIN)} min`;
  if (diff < DAY) return `há ${Math.floor(diff / HOUR)} h`;
  if (diff < 2 * DAY) return "ontem";
  const d = new Date(t);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "em 25 min", "em 1h20", "amanhã", "em 3 dias" — contagem regressiva do próximo atendimento. */
export function formatCountdown(iso: string | undefined | null, now: number = Date.now()): string {
  const t = toTime(iso);
  if (t === null) return "";
  const diff = t - now;
  if (diff <= 0) return "agora";
  if (diff < HOUR) return `em ${Math.max(1, Math.round(diff / MIN))} min`;
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    const m = Math.round((diff % HOUR) / MIN);
    return m === 0 ? `em ${h} h` : `em ${h}h${String(m).padStart(2, "0")}`;
  }
  const days = Math.round(diff / DAY);
  return days <= 1 ? "amanhã" : `em ${days} dias`;
}

/** Número de telefone para WhatsApp (só dígitos, com DDI 55 quando vier sem). Vazio se inválido. */
export function whatsappNumber(phone?: string | null): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  return digits.length <= 11 ? `55${digits}` : digits;
}
