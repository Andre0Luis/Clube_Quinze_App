import axios from "axios";

import { getEnvironment } from "./environment";
import { STAGING_KEY_HEADER } from "./environmentConfig";

const api = axios.create({
  // Valor inicial (produção). A cada requisição o interceptor abaixo aplica o ambiente escolhido (produção/homologação).
  baseURL: "https://clubequinzeapp.cloud/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Só em desenvolvimento: EXPO_PUBLIC_API_URL aponta o app para um backend local (ex.: http://localhost:8090/api/v1).
// Em build de release (__DEV__ falso) é ignorado, então nunca desvia usuários reais.
const DEV_API_URL = __DEV__ ? process.env.EXPO_PUBLIC_API_URL : undefined;

api.interceptors.request.use(async (config) => {
  const env = await getEnvironment();
  config.baseURL = DEV_API_URL || env.apiBaseUrl;
  if (env.accessKey) {
    config.headers.set(STAGING_KEY_HEADER, env.accessKey);
  }
  return config;
});

export default api;
