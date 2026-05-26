# Notifications module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/notifications`, `/dashboard/notifications/rules`,
`lib/email.ts`, `lib/email/templates.ts`, `lib/notification-log.ts`,
`lib/env.ts → isResendConfigured`, `app/api/cron/reminders/route.ts`,
`actions/notification-rules.ts`, the Prisma `NotificationLog` and
`NotificationRule` models.

## TL;DR

The current page is a static checklist. There is a working Resend
gate (`lib/email.ts → getResend`), real cron-driven dedupe in
`NotificationLog`, and a starter `NotificationRule` table — but
operators cannot see, edit, retry, or test any of this from the UI.

## Findings

| # | Area | Current state | Risk | Affected workflow | Fix | Priority |
|---|------|---------------|------|-------------------|-----|----------|
| 1 | Provider diagnostics | Single "Configured/Setup required" pill | Operators cannot tell *why* sending is failing (no from address, no domain verified, wrong env) | Every customer email | Dedicated `/provider` page with presence-only diagnostics — never returns the API key value | P0 |
| 2 | Templates | 5 hard-coded templates in `lib/email/templates.ts`, no preview, no test send, no per-brand override | Operators ship the wrong copy without knowing | Catering quote, order confirmation, etc. | Registry + safe renderer + preview/test UI | P1 |
| 3 | Rule editor | `/rules` page only seeds defaults + toggles enable/disable | No offset edit, no template binding, no audience, no dedupe window | Pickup/delivery/preorder reminders | New Rules tab with edit form | P1 |
| 4 | Notification log | Schema has `type`, `recipient`, `dedupeKey`, `metadata`, no `status`, no `subject`, no `templateKey`, no `category`, no `failureReason`, no `retryCount` | Cannot tell sent vs skipped vs failed; cannot retry | All sends | Extend log additively + add `NotificationEvent` for provider events | P0 |
| 5 | Retry queue | Does not exist | Failed sends silently drop or repeat | Order confirmation under provider outage | New retry queue UI + service guard | P1 |
| 6 | Resend webhook | Not handled | Cannot tell delivery / bounce / complaint | Deliverability hygiene | New `/api/webhooks/resend` route with signature verification | P1 |
| 7 | Internal alerts | Only ad-hoc (some routes call `sendRawEmail` directly) | Inconsistent destination & dedupe | Failed webhook, unmapped SKU, packing issues | Centralized alert service + log | P1 |
| 8 | Consent / marketing | No flag separating transactional vs marketing | Risk of spam complaints | Weekly menu reminder, promotional copy | `NotificationPreference` + per-rule `audience` field with consent check | P0 |
| 9 | Dev safety | Resend gate works, but `sendRawEmail` and templates throw if key missing only at call time | OK; the page does not surface "log-only" mode | Local dev | Surface a `DEVELOPMENT_LOG_ONLY` provider mode | P2 |
| 10 | Preferences | No user-level mute toggles, no per-customer | Hard to comply with personal opt-out requests | Catering, marketing | `NotificationPreference` model | P1 |
| 11 | Permissions | None — anyone signed in sees / mutates | Risk for low-trust roles | Larger teams | Capability gate (`canManageNotifications`) | P2 |
| 12 | Settings duplication | `kitchen_settings.notifyXxx` toggles already drive cron and order actions; new module must not duplicate | Drift | Existing reminders | Keep `kitchen_settings` as the **on/off master**; new `NotificationRule` only refines *which template* and *offset* | P0 |
| 13 | PII safety | `notification_logs.recipient` stores full email | Allowed (transactional); but body content is not stored — keep that way | All sends | Continue avoiding storing rendered body / template variables verbatim | P1 |
| 14 | Webhook secret | Not used today | Without it, anyone can replay POSTs | Resend → app webhook | Require `RESEND_WEBHOOK_SECRET` to enable signature verification | P1 |
| 15 | Empty states | "No rows yet" works | OK | All | Keep, add specific empty states for templates/rules/retry | P3 |
| 16 | Business modes | Templates do not adapt to bakery/catering/etc. | Generic copy | All non-meal-prep | Per-template tagging + business-mode notes in doc | P2 |
| 17 | Test email | Does not exist | Operators cannot self-validate | All | Test-send button gated by provider status + permission | P1 |
| 18 | Idempotency | Dedupe via `dedupeKey` unique constraint — works | OK | Cron | Keep + extend to per-rule + per-window dedupe | P1 |

## Priority legend

- **P0** — Privacy / security / deliverability.
- **P1** — Core notification lifecycle.
- **P2** — UX.
- **P3** — Future.

## Safety contract

1. No email send code path may continue if `RESEND_API_KEY` is missing.
2. API key value never leaves the server.
3. Marketing-category templates require recipient consent.
4. Settings-level on/off toggles remain the master switch — the new
   rule editor refines timing/templates only.
5. All existing rows in `NotificationLog` and `NotificationRule` keep
   working. New columns are nullable and additive.
6. `workspace.moroz@gmail.com` bypasses every role check.
