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

api.interceptors.request.use(async (config) => {
  const env = await getEnvironment();
  config.baseURL = env.apiBaseUrl;
  if (env.accessKey) {
    config.headers.set(STAGING_KEY_HEADER, env.accessKey);
  }
  return config;
});

export default api;
