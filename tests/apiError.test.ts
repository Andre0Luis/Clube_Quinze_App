import assert from "node:assert/strict";
import { test } from "node:test";

import { AxiosError } from "axios";

import { apiMessage } from "../utils/apiError.ts";

const axiosError = (data: unknown) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    data,
    status: 422,
    statusText: "Unprocessable Entity",
    headers: {},
    config: {} as never,
  });

test("usa a mensagem de regra de negócio devolvida pelo backend (ex.: conflito de horário)", () => {
  const message = "Conflito: 12/03/2027 às 16:00 já está ocupado por Fulano (16:00–16:30).";
  assert.equal(apiMessage(axiosError({ message }), "padrão"), message);
});

test("sem mensagem do backend, ou com erro que não é da API, devolve o texto padrão", () => {
  assert.equal(apiMessage(axiosError({}), "padrão"), "padrão");
  assert.equal(apiMessage(axiosError({ message: 42 }), "padrão"), "padrão");
  assert.equal(apiMessage(new Error("boom"), "padrão"), "padrão");
  assert.equal(apiMessage(undefined, "padrão"), "padrão");
});
