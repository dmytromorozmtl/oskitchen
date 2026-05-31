# Resend setup

OS Kitchen uses [Resend](https://resend.com) as the transactional email
provider. All sends pass through `services/notifications/notification-service.ts`,
which never falls back to a fake provider.

## Environment variables

| Var | Required | Notes |
|-----|---------|-------|
| `RESEND_API_KEY` | yes (for sending) | Server-only. Never returned by any UI. |
| `RESEND_FROM_EMAIL` | yes (for sending) | Verified sender at Resend. |
| `RESEND_REPLY_TO_EMAIL` | no | Optional reply-to. |
| `RESEND_WEBHOOK_SECRET` | no | Required to update delivery status. |
| `RESEND_DOMAIN_VERIFIED` | no | Set to `1` (or any non-empty value) once DNS records pass. UI signal only. |
| `NOTIFICATIONS_LOG_ONLY` | no | Force log-only mode in dev even when a key is present. |

## Modes

The Notification Center surfaces one of four modes:

- **Resend configured** — `RESEND_API_KEY` present, sends enabled.
- **Development · log-only** — no key in dev, or `NOTIFICATIONS_LOG_ONLY` set.
- **Manual · preview-only** — reserved for future when admins disable Resend manually.
- **Disabled (no key)** — production without a key. Sends produce SKIPPED rows.

## Webhook

Point Resend at `https://<your-domain>/api/webhooks/resend`. OS Kitchen
verifies the Svix-style `t=…,v1=…` signature using
`RESEND_WEBHOOK_SECRET` before mutating any rows.

## Safety

- Secrets never leave the server.
- The Provider tab returns *presence-only* booleans per env var.
- `canSendEmails()` is the only function that allows an outbound send.
