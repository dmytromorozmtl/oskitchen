# Webhook test lab

`/dashboard/sales-channels/webhook-lab` stores JSON fixtures as **processed** `WebhookEvent` rows for diagnostics.

## Boundaries
Does **not** replace `/api/webhooks/*` routes. Does not verify HMAC against live secrets — paste payloads you already validated in partner admin.
