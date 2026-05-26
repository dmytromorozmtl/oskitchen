# Notifications QA

## Smoke

- `/dashboard/notifications` loads without `RESEND_API_KEY`.
- Provider warning card appears when sending is disabled.
- `/dashboard/notifications/templates` renders previews for all 22 templates.
- Test-send button is disabled when provider is off **or** the role
  lacks `send_test_email`.
- Test-send button works when both gates are satisfied.
- `/dashboard/notifications/rules` shows defaults after install; offset
  and dedupe window save correctly.
- `/dashboard/notifications/log` records SKIPPED / SENT / FAILED with
  the right status badge.
- `/dashboard/notifications/retry` retries a failed row and shows the
  new attempt; refuses past 5 attempts.
- `/dashboard/notifications/preferences` lists no preferences by default.
- `/dashboard/notifications/settings` mirrors `KitchenSettings.notifyXxx`.

## Safety

- No body content is persisted in logs.
- `RESEND_API_KEY` is not returned in any HTTP response, including the
  Provider tab JSON.
- Marketing template send to a customer without consent results in
  `status = SKIPPED` with a reason.
- Resend webhook returns `401` when the signature does not match.
- Resend webhook returns `200 ignored:true` when secret is missing.
- Idempotency: replaying the same Resend `event_id` does not double-write.
- Existing `kitchen_settings.notifyXxx` master toggles still gate cron.
- Superadmin `workspace.moroz@gmail.com` bypasses every role check.

## Commands

```
npx prisma migrate deploy
npx prisma generate
npm run typecheck
npm run build
```

All four pass.
