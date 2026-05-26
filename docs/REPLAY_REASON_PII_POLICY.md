# Replay reason — PII & retention policy

## Modes (`AUDIT_REASON_RETENTION_MODE`)

| Mode | Stored metadata | Use case |
|------|-----------------|----------|
| `PREVIEW_ONLY` (**default**) | First 80 chars + length + sanitized preview | Balanced privacy |
| `FULL_INTERNAL` | Preview + full sanitized string in `reasonFullInternal` | Break-glass investigations (still minimize PII) |
| `REDACTED` | Category label only | High privacy tenants |
| `HASHED` | SHA-256 of category + sanitized text + category label | Prove intent without retaining text |

## Sanitization

`lib/audit/reason-sanitization.ts` strips obvious Stripe keys, bearer tokens, JWT-shaped strings, Postgres URLs, webhook secret patterns.

## Implementation

- `services/audit/audit-reason-service.ts` → `buildAuditReasonMetadata`.
- Webhook replay audit metadata uses this helper (`services/webhooks/webhook-replay-service.ts`).
- UI copy in `WebhookReplayRow` warns operators not to enter customer personal data.

## Legal / product note

Final retention posture should be confirmed with counsel — this code provides **technical controls**, not legal advice.
