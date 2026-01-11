# Push Notifications - Briefing para backend

Cenário: App Expo já coleta o `expoPushToken` e o envia (quando existir endpoint) para `/notifications/tokens` com bearer JWT. Precisamos de backend para entregar push de agendamento.


## Endpoints sugeridos

- `POST /notifications/tokens`
  - Auth: Bearer.
  - Body: `{ "token": "ExponentPushToken[xxxxx]" }`.
  - Ação: associar token ao usuário autenticado (1:N, preservando histórico de devices). Invalidar duplicados.

- `POST /notifications/send` (ou jobs internos)
  - Uso interno/cron para disparar campanhas de agenda.
  - Payload genérico: `{ "userId": number, "type": "REMINDER|CANCELLED|REBOOK_SUGGESTION", "title": string, "body": string, "data"?: object }`.
  - Pode ser omitido se o serviço for "fire-and-forget" a partir dos jobs.


## Eventos obrigatórios

1) **Lembrete T-24h**: enviar 1 dia antes do agendamento.
2) **Lembretes no dia**: T-6h, T-3h, T-1h antes do horário.
3) **Cancelamento pelo admin**: push imediato avisando cancelamento do agendamento.
4) (Opcional sugerido) **Reagendamento pelo usuário**: confirmar novo horário.
5) (Opcional sugerido) **Falha de pagamento/renovação pendente**: se aplicável ao plano.


## Como calcular janelas

- Para cada agendamento `scheduledAt` (UTC/ISO), agendar jobs em: `scheduledAt - 24h`, `-6h`, `-3h`, `-1h`.
- Se a janela já passou (ex.: criar agendamento menos de 1h antes), enviar somente as futuras.
- Cancelamento: evento imediato.


## Payload de push (Expo)

- Endpoint: `https://exp.host/--/api/v2/push/send`
- Body por mensagem: `{ "to": "ExponentPushToken[...]", "title": "", "body": "", "sound": "default", "data": { "appointmentId": 123, "kind": "reminder", "offset": "-1h" } }`
- Agrupe em lotes de até 100 tokens.
- Tratar respostas com `status: 'ok'` ou `status: 'error'` (invalid token, rate limit, etc.).


## Persistência

- Tabela `push_tokens`: id, user_id (FK), token, platform, created_at, updated_at, last_success_at, invalidated_at.
- Marcar token inválido quando Expo responder `DeviceNotRegistered`/`MessageTooBig`/`InvalidCredentials`.


## Sugestão de jobs

- Cron a cada 5 min procura agendamentos futuros e cria fila de notificações pendentes.
- Fila/worker envia push e marca status (sent/failed/retry_count/last_error).
- Para cancelamento, disparo síncrono ao registrar o cancelamento.


## Segurança

- Endpoint de registro exige Bearer válido; associa token ao `userId` do token JWT.
- Sanitizar body, limitar tamanho de `data` no push.


## Retorno ao app

- Hoje o app apenas registra o token; backend não precisa responder nada além de 200. Opcional: devolver `tokenId` ou `lastRegisteredAt`.


## Próximos passos para o backend

1) Criar endpoints e tabelas descritas.
2) Implementar serviço de envio via Expo Push (HTTP). Pode usar `expo-server-sdk` ou HTTP simples.
3) Criar cron/worker para lembretes T-24h, T-6h, T-3h, T-1h.
4) Integrar cancelamento para disparo imediato.
5) Expor logs ou dashboard mínimo de entregas/falhas.


## Ajustes no app depois do backend

- Atualizar `services/push-tokens.ts` para refletir o endpoint real (path e payload).
- Opcional: enviar `platform`/`appVersion` no corpo.
- Consumir `data` da notificação para deep-linkar (`expo-router`), ex.: abrir `/appointments/[appointmentId]`.
