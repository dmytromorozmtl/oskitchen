# Resend webhooks

Endpoint: `POST /api/webhooks/resend`.

## Verification

When `RESEND_WEBHOOK_SECRET` is set, the route:

1. Reads the raw body (Next.js `req.text()`).
2. Pulls the signature header (`svix-signature`, `resend-signature`,
   `x-resend-signature`).
3. Parses the `t=<ts>,v1=<sig>` pairs.
4. Recomputes `HMAC_SHA256(secret, `${ts}.${rawBody}`)`.
5. Compares with `crypto.timingSafeEqual`.

Mismatched signatures return `401`. Missing secret returns `200` with
`ignored: true` so Resend does not retry forever — the UI surfaces
"delivery status unavailable".

## Event handling

Supported event types (Resend ships both prefixed `email.*` and bare
event names depending on dashboard version):

- `email.delivered` → status `DELIVERED`, `deliveredAt = now()`.
- `email.bounced` / `email.complained` / `email.failed` → status
  `FAILED`, `failedAt = now()`, `errorMessage` from `data.reason`.
- `email.opened` → status `OPENED`.
- `email.clicked` → status `CLICKED`.
- `email.delivery_delayed` → no status change, still recorded.

A `NotificationEvent` row is created for every event with the
`providerEventId` unique constraint guaranteeing idempotency.

## Lookup

The route matches incoming events to logs by
`notification_logs.providerMessageId = data.email_id`. The Resend SDK
fills this when `resend.emails.send` returns a `data.id`.
