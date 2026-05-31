# Notifications architecture

## Layers

```
lib/notifications/*               pure utilities (no I/O)
services/notifications/*          Prisma + Resend
actions/notifications-center.ts   Next.js server actions (auth + zod)
app/api/webhooks/resend/route.ts  Resend → OS Kitchen webhook
app/dashboard/notifications/*     Notification Center UI (server + client)
components/dashboard/notifications/*  shared UI bits
```

## Source files

| File | Purpose |
|------|---------|
| `lib/notifications/notification-types.ts` | Categories, channels, audiences, provider modes. |
| `lib/notifications/notification-status.ts` | Widened status enum + tone helpers + terminal set. |
| `lib/notifications/template-registry.ts` | 22 system templates with vars + marketing flag. |
| `lib/notifications/template-renderer.ts` | Safe `{{var}}` interpolation with HTML escape. |
| `lib/notifications/reminder-rules.ts` | Default rule pack with offsets and dedupe windows. |
| `lib/notifications/dedupe.ts` | Build deterministic dedupe keys. |
| `lib/notifications/provider-resend.ts` | Presence-only Resend diagnostics. Never returns values. |
| `lib/notifications/notification-permissions.ts` | 9-capability role gate + superadmin bypass. |
| `services/notifications/notification-service.ts` | Single entrypoint to send / retry / cancel. |
| `services/notifications/reminder-service.ts` | Install defaults / list / update rules. |
| `services/notifications/alert-service.ts` | Internal alert helper for ops modules. |
| `actions/notifications-center.ts` | Server actions for UI buttons. |
| `app/api/webhooks/resend/route.ts` | Resend webhook with signature verification + idempotency. |

## Data model (additive)

`NotificationLog` — new optional columns:
`status`, `category`, `channel`, `provider`, `templateKey`, `ruleId`,
`recipientUserId`, `recipientCustomerId`, `subject`, `triggerType`,
`sourceType`, `sourceId`, `providerMessageId`, `errorMessage`,
`sentAt`, `deliveredAt`, `failedAt`, `retryCount`. Existing rows keep
working (all new columns nullable, `retryCount` defaults to 0).

`NotificationRule` — new optional columns:
`ruleKey`, `category`, `audience`, `templateKey`, `triggerKey`,
`conditionsJson`, `dedupeWindowMinutes`, `brandId`, `locationId`.
Legacy `type` / `trigger` enums remain authoritative for older code
paths. A unique `(user_id, rule_key)` index supports idempotent
defaults install.

`NotificationTemplate` — new table for per-workspace template
overrides (brand / location aware).

`NotificationEvent` — provider event log, idempotent on
`providerEventId`. Created by the Resend webhook.

`NotificationPreference` — per-customer / per-staff / per-user opt-out
record. Marketing/reminder categories check this before sending;
transactional categories never gate on it.

## Send pipeline

```
sendNotification(input)
  └─ validate template + recipient
  └─ recipientAllowed (consent check, marketing-only)
  └─ renderTemplate (HTML escape, variable validation)
  └─ provider gate (RESEND_API_KEY present? log-only otherwise)
  └─ Resend.emails.send
  └─ recordLog(SENT | FAILED | SKIPPED | …, providerMessageId)
```

The function never throws. Failures and skips always produce a log row
with `status`, `errorMessage`, and `retryCount = 0`. Duplicate dedupe
keys are recorded as a salted SKIPPED row.

## Retry

`retryNotification(logId)` enforces a 5-attempt cap, refuses if the
log lacks template / recipient / category / channel, and salts the
dedupe key with `|retry|N`. Retries pass through the same provider /
consent gates.

## Webhook

`/api/webhooks/resend` requires `RESEND_WEBHOOK_SECRET` to mutate.
Without it, events are accepted but ignored. With it, the signature is
verified in constant time, the matching `NotificationLog` is updated
(`status`, `deliveredAt`, `failedAt`, `errorMessage`), and a
`NotificationEvent` row is created. Idempotency is enforced by
`providerEventId` unique index.

## Permissions

`lib/notifications/notification-permissions.ts` defines 9 capabilities:

- `view_overview`, `view_logs`
- `manage_templates`, `manage_rules`, `manage_alerts`
- `send_test_email`, `retry_failed`
- `manage_preferences`, `manage_provider`

`workspace.moroz@gmail.com` always passes.
