import assert from "node:assert/strict";
import { test } from "node:test";

import { buildEnvironment, canUseEnvironment, isEnvironmentName, STAGING_KEY_HEADER } from "../services/environmentConfig.ts";

test("produção aponta para o domínio oficial e nunca leva a chave da homologação", () => {
  const env = buildEnvironment("production", "chave-que-nao-deve-ir");
  assert.equal(env.apiBaseUrl, "https://clubequinzeapp.cloud/api/v1");
  assert.equal(env.rootUrl, "https://clubequinzeapp.cloud");
  assert.equal(env.accessKey, undefined);
});

test("homologação usa o subdomínio na porta 8443 e leva a chave sem espaços", () => {
  const env = buildEnvironment("staging", "  abc123  ");
  assert.equal(env.apiBaseUrl, "https://staging.clubequinzeapp.cloud:8443/api/v1");
  assert.equal(env.rootUrl, "https://staging.clubequinzeapp.cloud:8443");
  assert.equal(env.accessKey, "abc123");
  assert.equal(env.label, "Homologação");
});

test("homologação sem chave (ou só espaços) fica sem chave e não pode ser usada", () => {
  assert.equal(buildEnvironment("staging", "   ").accessKey, undefined);
  assert.equal(canUseEnvironment("staging", ""), false);
  assert.equal(canUseEnvironment("staging", null), false);
  assert.equal(canUseEnvironment("staging", "abc"), true);
  assert.equal(canUseEnvironment("production", ""), true);
});

test("só aceita os nomes de ambiente conhecidos e o cabeçalho é o do backend", () => {
  assert.equal(isEnvironmentName("production"), true);
  assert.equal(isEnvironmentName("staging"), true);
  assert.equal(isEnvironmentName("dev"), false);
  assert.equal(isEnvironmentName(undefined), false);
  assert.equal(STAGING_KEY_HEADER, "X-Staging-Key");
});
