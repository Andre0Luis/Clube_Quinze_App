import assert from "node:assert/strict";
import { test } from "node:test";

import { routeForNotification } from "../utils/notificationRoute.ts";

test("pedido de confirmação abre o detalhe destacando a confirmação", () => {
  assert.equal(
    routeForNotification({ kind: "appointment_confirmation", appointmentId: 42 }),
    "/appointments/42?action=confirm",
  );
});

test("avisos do admin (não confirmou / pedido de remarcação) abrem as solicitações com foco no agendamento", () => {
  assert.equal(routeForNotification({ kind: "admin_unconfirmed", appointmentId: "7" }), "/admin-requests?focus=7");
  assert.equal(routeForNotification({ kind: "admin_reschedule_request", appointmentId: 9 }), "/admin-requests?focus=9");
  assert.equal(routeForNotification({ kind: "admin_unconfirmed" }), "/admin-requests");
});

test("lembretes e demais avisos abrem o detalhe do agendamento", () => {
  assert.equal(routeForNotification({ kind: "reminder", appointmentId: 5 }), "/appointments/5");
  assert.equal(routeForNotification({ appointmentId: "5" }), "/appointments/5");
  assert.equal(routeForNotification({ kind: "admin_appointment_confirmed", appointmentId: 5 }), "/appointments/5");
});

test("sem agendamento nem tipo conhecido, não navega", () => {
  assert.equal(routeForNotification({}), null);
  assert.equal(routeForNotification(undefined), null);
  assert.equal(routeForNotification({ kind: "appointment_confirmation" }), null);
});
