# Notification Center — ready report

## What changed

`/dashboard/notifications` is now a 9-tab Notification Center: Overview,
Templates, Rules, Internal alerts, Log, Retry, Provider, Preferences,
Settings. The Resend gate, dedupe, and existing master settings keep
working unchanged.

### New files

- 8 `lib/notifications/*` modules.
- 3 `services/notifications/*` services.
- `actions/notifications-center.ts`.
- `app/api/webhooks/resend/route.ts`.
- 9 pages under `app/dashboard/notifications/*` + layout.
- 5 UI components under `components/dashboard/notifications/*`.
- 10 documentation files in `docs/NOTIFICATION*.md`.

### Updated files

- `prisma/schema.prisma` — `NotificationLog` + `NotificationRule`
  extended with optional columns; 3 new models added; UserProfile
  back-relations added.
- `prisma/migrations/20260527100000_notification_center/migration.sql`
  — purely additive migration.
- `app/dashboard/notifications/page.tsx` and
  `app/dashboard/notifications/rules/page.tsx` — rewritten to use the
  new Center.

## Provider diagnostics

`getResendDiagnostics()` returns presence-only data for 6 env vars and
classifies the workspace as `RESEND` / `DEVELOPMENT_LOG_ONLY` /
`MANUAL_PREVIEW` / `DISABLED`. The API key value is never returned.

## Template center

22 system templates across 6 categories with safe variable lists,
preview, test-send, and marketing flags. Per-workspace overrides land
in the new `NotificationTemplate` table.

## Reminder rules

10 default rules with offsets and dedupe windows. UI exposes
enable / disable / offset / dedupe-window edits. Master on/off
remains in Workspace settings.

## Internal alerts

11-template catalog + `fireInternalAlert(...)` helper for any module
to emit a deduped operator alert. Logged with `category = INTERNAL_ALERT`.

## Log / retry system

Logs now carry status, category, channel, provider, template, rule,
source, retry count, error, sent/delivered/failed timestamps. The Retry
queue enforces a 5-attempt cap and refuses to retry without a configured
provider.

## Resend integration

Webhook at `/api/webhooks/resend` verifies Svix-style signatures with
`RESEND_WEBHOOK_SECRET`, updates the matching log row, and idempotently
creates a `NotificationEvent` per provider event id.

## Consent / privacy

Marketing/reminder sends honor `NotificationPreference` and fall back
to `KitchenCustomer.marketingConsent`. Transactional templates bypass.
No body content is persisted in logs.

## Settings integration

The Settings tab mirrors `KitchenSettings.notifyXxx` flags; rules
short to SKIPPED when those master switches are off.

## Permissions

9-capability gate with superadmin bypass for `workspace.moroz@gmail.com`.

## Remaining limitations

- The send pipeline is invoked from order actions and cron today;
  a future patch will route every order-level call through
  `sendNotification` for unified logging.
- Filters on the Log tab (status, date range, category) are not yet
  built — the table is sortable but unfiltered.
- No SMS provider — channel exists in the type system but the SMS
  pathway is a placeholder.
- Per-customer / per-staff preference editing UI is read-only here;
  full CRUD lives with the CRM detail page (next iteration).
- No global throttle / rate-limit yet — relying on per-rule dedupe.

## Next recommendations

1. Route every legacy email send (order confirmation, ready, pickup,
   delivery, preorder reminder) through `sendNotification` so the
   Log/Retry surfaces become complete.
2. Add filter UI (status, template, recipient, date) to the Log tab.
3. Add an unsubscribe handler that writes `NotificationPreference`
   rows by signed token.
4. Add SMS provider abstraction once a vendor is selected.
5. Wire `fireInternalAlert` into the existing webhook-failure paths
   (Shopify, Woo, Uber) and into the Go-live blocker change events.
