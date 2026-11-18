import assert from "node:assert/strict";
import { test } from "node:test";

import { planLabel } from "../utils/planLabel.ts";

test("traduz os códigos conhecidos e preserva nomes já legíveis", () => {
  assert.equal(planLabel("QUINZE_STANDARD"), "Quinze Standard");
  assert.equal(planLabel("quinze_select"), "Quinze Select");
  assert.equal(planLabel("Plano Ouro"), "Plano Ouro");
});

test("vazio usa o fallback", () => {
  assert.equal(planLabel(undefined), "Plano");
  assert.equal(planLabel("  ", "—"), "—");
});
