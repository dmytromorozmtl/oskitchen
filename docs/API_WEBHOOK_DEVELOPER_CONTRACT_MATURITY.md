# API / Webhook / Developer Contract Maturity

## API scopes

- Source of truth: `lib/developer/api-scopes.ts` (`DEVELOPER_API_SCOPES`, `DEVELOPER_API_SCOPE_LABEL`).  
- Service helper: `services/developer/api-contract-service.ts`.

## Webhook taxonomy

- `lib/developer/webhook-event-types.ts` + `services/developer/webhook-contract-service.ts`.  
- Retry / redaction notes documented in service (`WEBHOOK_RETRY_POLICY_NOTES`).

## Security rules

- Never show raw API keys after creation (existing developer center behavior).  
- Payload previews must go through `redactFreeText` patterns (extend as needed).

## Next

- Rate limit tables + external developer portal authentication.
