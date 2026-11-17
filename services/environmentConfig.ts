/**
 * Ambientes da API (lógica pura, sem dependência de React Native, para poder ser testada no Node).
 *
 *  - production:  https://clubequinzeapp.cloud           (o que os clientes usam)
 *  - staging:     https://staging.clubequinzeapp.cloud:8443 (homologação, dados falsos; exige a chave de acesso)
 *
 * A chave de acesso da homologação NUNCA fica no código (o repositório é público): o admin a digita uma vez na tela
 * "Ambiente" e ela é guardada no armazenamento seguro do aparelho.
 */
export type EnvironmentName = "production" | "staging";

export interface AppEnvironment {
  name: EnvironmentName;
  label: string;
  /** Raiz do servidor (sem /api/v1): usada em /actuator/info e nos links públicos. */
  rootUrl: string;
  /** Base da API REST. */
  apiBaseUrl: string;
  /** Chave de acesso (só homologação). */
  accessKey?: string;
}

export const STAGING_KEY_HEADER = "X-Staging-Key";

const ROOTS: Record<EnvironmentName, string> = {
  production: "https://clubequinzeapp.cloud",
  staging: "https://staging.clubequinzeapp.cloud:8443",
};

const LABELS: Record<EnvironmentName, string> = {
  production: "Produção",
  staging: "Homologação",
};

export const isEnvironmentName = (value: unknown): value is EnvironmentName =>
  value === "production" || value === "staging";

export function buildEnvironment(name: EnvironmentName, accessKey?: string | null): AppEnvironment {
  const rootUrl = ROOTS[name];
  const key = accessKey?.trim();
  return {
    name,
    label: LABELS[name],
    rootUrl,
    apiBaseUrl: `${rootUrl}/api/v1`,
    // Só a homologação usa a chave: produção nunca a envia.
    accessKey: name === "staging" && key ? key : undefined,
  };
}

/** Homologação sem chave não funciona (a API responde 404): a tela exige a chave antes de trocar. */
export const canUseEnvironment = (name: EnvironmentName, accessKey?: string | null): boolean =>
  name === "production" || Boolean(accessKey?.trim());
