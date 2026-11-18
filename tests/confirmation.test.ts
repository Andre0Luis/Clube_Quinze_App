import assert from "node:assert/strict";
import { test } from "node:test";

import { needsConfirmation } from "../utils/confirmation.ts";

const NOW = new Date("2026-11-18T20:00:00").getTime();
const at = (minutesFromNow: number, status = "SCHEDULED") => ({
  status,
  scheduledAt: new Date(NOW + minutesFromNow * 60000).toISOString(),
});

test("pede confirmação quando faltam 90 minutos e ainda está agendado", () => {
  assert.equal(needsConfirmation(at(90), NOW), true);
});

test("não pede muito antes da hora (amanhã)", () => {
  assert.equal(needsConfirmation(at(24 * 60), NOW), false);
});

test("não pede se já confirmou, cancelou ou pediu remarcação", () => {
  for (const status of ["CONFIRMED", "CANCELED", "RESCHEDULE_REQUESTED", "COMPLETED"]) {
    assert.equal(needsConfirmation(at(60, status), NOW), false, status);
  }
});

test("segue pedindo logo depois do início, mas para depois de 30 minutos", () => {
  assert.equal(needsConfirmation(at(-10), NOW), true);
  assert.equal(needsConfirmation(at(-31), NOW), false);
});

test("dados inválidos não quebram", () => {
  assert.equal(needsConfirmation(null, NOW), false);
  assert.equal(needsConfirmation({ status: "SCHEDULED", scheduledAt: "x" }, NOW), false);
});
