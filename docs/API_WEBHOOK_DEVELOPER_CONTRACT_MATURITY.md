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

## Partner readiness (Era 16)

- **Policy:** `era16-public-api-partner-confidence-v1` (`lib/api-public/public-api-partner-confidence-pack.ts`).  
- **Registry:** eight v1 resources in `lib/api-public/public-api-v1-registry.ts`.  
- **Cert:** `npm run test:ci:public-api-partner-confidence-era16:cert` (chained in `test:ci:public-api-v1:cert`).  
- **Artifact:** `artifacts/public-api-partner-confidence-summary.json`.  
- **Live smoke:** `npm run smoke:public-api-live` — SKIPPED WITH REASON without `SMOKE_PUBLIC_API_KEY`; not in default CI.  
- **Honest scope:** beta Public API v1 — no production SLA, no unlimited rate limits, no SOC2 API certification claim.

## Per-route scope enforcement (Era 17)

- **Policy:** `era17-public-api-per-route-scope-v1` — **per_route_scope_enforced**.  
- **Mapping:** `lib/api-public/public-api-v1-route-scopes.ts` — each v1 route/method requires one `DEVELOPER_API_SCOPES` value.  
- **Guard:** `guardPublicApiV1Resource` in `lib/api-public/guard.ts` — 403 when API key lacks required scope.  
- **Key storage:** optional `api_keys.scopes_json` (null = all documented scopes for legacy keys).  
- **Cert:** `npm run test:ci:public-api-per-route-scope-era17:cert` (chained in `test:ci:public-api-v1:cert`).  
- **Smoke:** `npm run smoke:public-api-per-route-scope` — cert-only locally; live restricted-key proof via staging optional.  
- **Not claimed:** production SLA, full scope picker UI, SOC2 API certification.

## Public API v1 auth and entitlement

- Header: `Authorization: Bearer kos_...` (prefix required; minimum length enforced).  
- Resolver: `resolveEnterpriseApiCredential` — validates API key hash, scopes, `api_access` entitlement, and paid subscription (dev/platform bypass excepted).  
- Tenant scope: workspace owner `userId` from active API key — cross-tenant isolation tested in `tests/unit/public-api-tenant-isolation.test.ts`.  
- OpenAPI: `GET /api/openapi.json` — public v1 routes document `bearerApiKey` security scheme.

## Standard error responses

| Status | Body | When |
|--------|------|------|
| 401 | `{ "error": "Unauthorized" }` | Missing/invalid key, revoked key, or entitlement denied |
| 403 | `{ "error": "Forbidden", "message": "API key missing required scope: ...", "requiredScope": "..." }` | Valid key without route scope (Era 17) |
| 429 | `{ "error": "Too many requests. Please slow down." }` | Rate limit exceeded; `Retry-After` header set |
| 503 | `{ "error": "Public API temporarily unavailable: distributed rate limiting is not configured." }` | Rate limit backend misconfigured — fail-closed |
| 400 | `{ "error": "Invalid body", "details": { ... } }` | POST body fails validation |

## Rate limits

- Default v1 GET: `public_api_v1_get` — 120 requests / 60s per user+IP.  
- Orders GET/POST: `public_api_orders_get` / `public_api_orders_post` — 120 / 60s.  
- Customers GET: `public_api_customers_get` — 60 / 60s.  
- Source: `lib/rate-limit/rate-limit-policies.ts`; enforced in `lib/api-public/guard.ts`.

## Partner integration checklist

1. Create API key in Dashboard → Developer (`kos_` prefix).  
2. Confirm workspace has `api_access` entitlement and paid plan.  
3. Run `npm run test:ci:public-api-v1` (contract + tenant isolation).  
4. Fetch `GET /api/openapi.json` for route manifest.  
5. Integrate orders read (+ optional create) with 429 backoff.  
6. Optional live proof: `SMOKE_PUBLIC_API_KEY=kos_... npm run smoke:public-api-live`.  
7. Review forbidden claims before partner-facing decks (no SLA / unlimited / SOC2 / marketplace-live claims).

**Era 16 public API partner confidence (2026-05-28):** partner readiness evaluator in `lib/api-public/public-api-partner-confidence-pack.ts`; cert writes summary artifact for integration-led pilots.

## Partner webhook integration (Era 17)

- **Policy:** `era17-partner-webhook-docs-v1` — **partner_webhook_docs_ready**.  
- **Partner doc:** `docs/partner-webhook-integration-era17.md` — inbound Stripe/Woo/Shopify routes, outbound event taxonomy, idempotency, incident drill cross-link.  
- **Pack:** `lib/developer/partner-webhook-pack.ts` — eight-item partner checklist + readiness evaluator.  
- **Smoke:** `npm run smoke:partner-webhook-docs` → `artifacts/partner-webhook-docs-summary.json`; attestation via `PARTNER_WEBHOOK_ATTESTATION_EMAIL` optional — **docs_ready_awaiting_partner_attestation** without email (not fake success).  
- **Cert:** `npm run test:ci:partner-webhook-docs-era17:cert` (chained in `test:ci:webhook-security-era16:cert`).  
- **Not claimed:** production webhook SLA, guaranteed delivery, SOC2 webhook certification, full outbound subscription platform.

## Next

- External developer portal authentication.  
- Dashboard scope picker UI for API key creation (Era 17 enforces scopes at runtime; UI deferred).
