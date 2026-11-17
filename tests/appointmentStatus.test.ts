import assert from "node:assert/strict";
import { test } from "node:test";

import { ACTIVE_STATUSES, getStatusMeta, isActiveStatus } from "../constants/appointmentStatus.ts";

test("agendado, confirmado e remarcação em análise contam como ativos; concluído e cancelado não", () => {
  for (const status of ["SCHEDULED", "CONFIRMED", "RESCHEDULE_REQUESTED"]) {
    assert.equal(isActiveStatus(status), true, status);
  }
  for (const status of ["COMPLETED", "CANCELED", "QUALQUER", undefined]) {
    assert.equal(isActiveStatus(status), false, String(status));
  }
  assert.deepEqual([...ACTIVE_STATUSES], ["SCHEDULED", "CONFIRMED", "RESCHEDULE_REQUESTED"]);
});

test("confirmado é verde e remarcação em análise é laranja; cada status tem cor própria", () => {
  assert.equal(getStatusMeta("CONFIRMED").label, "Confirmado");
  assert.equal(getStatusMeta("CONFIRMED").background, "#2E9E5B");
  assert.equal(getStatusMeta("RESCHEDULE_REQUESTED").background, "#E07B00");
  const colors = ["SCHEDULED", "CONFIRMED", "RESCHEDULE_REQUESTED", "COMPLETED", "CANCELED"].map(
    (s) => getStatusMeta(s).background,
  );
  assert.equal(new Set(colors).size, colors.length, "cada status precisa de uma cor distinta");
});

test("status desconhecido não quebra: mostra o próprio texto", () => {
  assert.equal(getStatusMeta("NOVO_STATUS").label, "NOVO_STATUS");
  assert.equal(getStatusMeta(undefined).label, "Desconhecido");
});
