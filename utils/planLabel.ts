/** Nome de plano legível: o backend guarda códigos como QUINZE_STANDARD no nome do plano. */
const LABELS: Record<string, string> = {
  QUINZE_STANDARD: "Quinze Standard",
  QUINZE_PREMIUM: "Quinze Premium",
  QUINZE_SELECT: "Quinze Select",
};

export function planLabel(name?: string | null, fallback = "Plano"): string {
  const raw = name?.trim();
  if (!raw) return fallback;
  return LABELS[raw.toUpperCase()] ?? raw;
}
