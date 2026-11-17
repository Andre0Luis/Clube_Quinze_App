import * as SecureStore from "expo-secure-store";

import {
    AppEnvironment,
    EnvironmentName,
    STAGING_KEY_HEADER,
    buildEnvironment,
    isEnvironmentName,
} from "./environmentConfig";
import { deleteAccessToken, deleteRefreshToken } from "./storage";

const ENV_KEY = "api_environment";
const STAGING_ACCESS_KEY = "staging_access_key";

let cached: AppEnvironment | null = null;
let loading: Promise<AppEnvironment> | null = null;
const listeners = new Set<(env: AppEnvironment) => void>();

async function load(): Promise<AppEnvironment> {
  try {
    const [name, key] = await Promise.all([
      SecureStore.getItemAsync(ENV_KEY),
      SecureStore.getItemAsync(STAGING_ACCESS_KEY),
    ]);
    // Homologação sem chave guardada volta para produção (evita ficar preso num ambiente que responde 404).
    const env = isEnvironmentName(name) && (name === "production" || key)
      ? buildEnvironment(name, key)
      : buildEnvironment("production");
    return env;
  } catch {
    return buildEnvironment("production");
  }
}

/** Ambiente atual (lido uma vez do armazenamento seguro e mantido em memória). */
export function getEnvironment(): Promise<AppEnvironment> {
  if (cached) return Promise.resolve(cached);
  if (!loading) {
    loading = load().then((env) => {
      cached = env;
      return env;
    });
  }
  return loading;
}

/** Chave de homologação guardada (para pré-preencher a tela). */
export const getStoredStagingKey = () => SecureStore.getItemAsync(STAGING_ACCESS_KEY);

export function subscribeEnvironment(listener: (env: AppEnvironment) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Troca de ambiente. A sessão (tokens) é do ambiente antigo e não vale no novo, então é apagada: o usuário entra de novo
 * com uma conta do ambiente escolhido.
 */
export async function switchEnvironment(name: EnvironmentName, accessKey?: string): Promise<AppEnvironment> {
  if (name === "staging") {
    await SecureStore.setItemAsync(STAGING_ACCESS_KEY, (accessKey ?? "").trim());
  }
  await SecureStore.setItemAsync(ENV_KEY, name);
  await Promise.all([deleteAccessToken(), deleteRefreshToken()]);

  const env = buildEnvironment(name, name === "staging" ? await SecureStore.getItemAsync(STAGING_ACCESS_KEY) : null);
  cached = env;
  listeners.forEach((listener) => listener(env));
  return env;
}

export interface ConnectionInfo {
  ok: boolean;
  version?: string;
  build?: string;
  message: string;
}

/** Testa o servidor do ambiente (GET /actuator/info com a chave, se houver). */
export async function testConnection(env: AppEnvironment): Promise<ConnectionInfo> {
  try {
    const response = await fetch(`${env.rootUrl}/actuator/info`, {
      headers: env.accessKey ? { [STAGING_KEY_HEADER]: env.accessKey } : undefined,
    });
    if (response.status === 404 && env.name === "staging") {
      return { ok: false, message: "A homologação respondeu 404: a chave de acesso está incorreta." };
    }
    if (!response.ok) {
      return { ok: false, message: `O servidor respondeu ${response.status}.` };
    }
    const data = (await response.json()) as { app?: { version?: string; build?: string } };
    return {
      ok: true,
      version: data.app?.version,
      build: data.app?.build,
      message: `Conectado (versão ${data.app?.version ?? "?"}, build ${data.app?.build ?? "?"}).`,
    };
  } catch {
    return { ok: false, message: "Não foi possível conectar ao servidor. Verifique a internet." };
  }
}
