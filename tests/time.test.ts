import assert from "node:assert/strict";
import { test } from "node:test";

import { formatCountdown, formatRelative, whatsappNumber } from "../utils/time.ts";

const NOW = new Date("2026-11-18T12:00:00").getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const ahead = (ms: number) => new Date(NOW + ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

test("formatRelative: agora, minutos, horas, ontem e data", () => {
  assert.equal(formatRelative(ago(10_000), NOW), "agora");
  assert.equal(formatRelative(ago(5 * MIN), NOW), "há 5 min");
  assert.equal(formatRelative(ago(3 * HOUR), NOW), "há 3 h");
  assert.equal(formatRelative(ago(30 * HOUR), NOW), "ontem");
  assert.match(formatRelative(ago(5 * DAY), NOW), /^\d{2}\/\d{2}$/);
  assert.equal(formatRelative(undefined, NOW), "");
});

test("formatCountdown: minutos, horas, amanhã e dias", () => {
  assert.equal(formatCountdown(ahead(25 * MIN), NOW), "em 25 min");
  assert.equal(formatCountdown(ahead(80 * MIN), NOW), "em 1h20");
  assert.equal(formatCountdown(ahead(2 * HOUR), NOW), "em 2 h");
  assert.equal(formatCountdown(ahead(30 * HOUR), NOW), "amanhã");
  assert.equal(formatCountdown(ahead(3 * DAY), NOW), "em 3 dias");
  assert.equal(formatCountdown(ahead(-MIN), NOW), "agora");
});

test("whatsappNumber: adiciona 55 e rejeita inválidos", () => {
  assert.equal(whatsappNumber("(11) 91234-5678"), "5511912345678");
  assert.equal(whatsappNumber("+55 11 91234-5678"), "5511912345678");
  assert.equal(whatsappNumber("123"), "");
  assert.equal(whatsappNumber(null), "");
});
