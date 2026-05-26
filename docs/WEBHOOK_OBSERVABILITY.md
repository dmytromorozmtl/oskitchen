# Webhook Observability

## Runtime sources

- Table `webhook_events`: provider, topic, `signature_valid`, `processed`, `processing_error`, timestamps.
- UI: `/dashboard/developer/webhooks` — 24h totals + recent rows with derived pipeline status (`processed` / `pending` / `failed` / `ignored`).

## Safety

- Payload JSON is **not** rendered in Developer Center (avoid accidental PII in screenshots). Use existing integration webhook drill-down where redaction policies apply.

## Next steps

- Provider filters, replay queue, signature replay with dual-control approval, and correlation IDs across `AuditLog.request_id`.
