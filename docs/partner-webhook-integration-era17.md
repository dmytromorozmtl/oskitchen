# Era 17 — Partner webhook integration guide

**Policy:** `era17-partner-webhook-docs-v1`  
**Status:** **partner_webhook_docs_ready**  
**Audience:** integration partners, implementation leads, buyer security reviewers  
**Parent:** [`API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`](./API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md)

This guide documents how partners connect **inbound** commerce webhooks to OS Kitchen and how **outbound** event types are catalogued. It does **not** claim production webhook SLA, guaranteed delivery, SOC2 certification, or a full outbound subscription platform.

---

## Two webhook directions

| Direction | Who sends | OS Kitchen role | Pilot scope |
|-----------|-----------|----------------|-------------|
| **Inbound (commerce)** | Stripe, WooCommerce, Shopify | Verify signature → persist `WebhookEvent` → normalize order | **pilot_ready** with live smoke attestation |
| **Outbound (developer)** | OS Kitchen → partner URL | Documented event taxonomy; delivery/retry notes | **beta** — taxonomy only, no SLA |

---

## Inbound commerce webhooks (pilot)

### Routes and tenant mapping

| Provider | OS Kitchen URL | Signature | Tenant routing |
|----------|---------------|-----------|----------------|
| Stripe | `/api/webhooks/stripe` | Stripe `constructEvent` signing secret | Billing connection / Stripe account |
| WooCommerce | `/api/webhooks/woocommerce?cid=<connection-uuid>` | `X-WC-Webhook-Signature` HMAC-SHA256 (raw body) | `cid` query param = `IntegrationConnection.id` |
| Shopify | `/api/webhooks/shopify/orders` | `X-Shopify-Hmac-Sha256` HMAC-SHA256 (raw body) | `X-Shopify-Shop-Domain` → connection `shopDomain` |

Source: `lib/security/webhook-security-matrix.ts` · `lib/developer/partner-webhook-era17-policy.ts`

### Setup checklist

1. Save integration credentials in Dashboard → Sales channels (secrets encrypted at rest).
2. Register the OS Kitchen webhook URL at the provider admin (HTTPS required).
3. Copy the provider signing secret into OS Kitchen — must match exactly.
4. For Woo, append `?cid=<uuid>` from the connection row — Woo cannot infer tenant from headers alone.
5. Send a test order/event; confirm row appears in Dashboard → Developer → Webhooks monitor.
6. Invalid signature must fail closed (401/400) with **no** order side effects.

### Idempotency and retries

Providers retry on non-2xx or timeouts. OS Kitchen dedupes using stable external IDs:

- **Shopify** — webhook id header  
- **WooCommerce** — `X-WC-Webhook-Delivery-Id`  
- **Stripe** — `stripeEventId` on billing events  

See [`WEBHOOK_SECURITY.md`](./WEBHOOK_SECURITY.md) and [`INTEGRATIONS_ARCHITECTURE.md`](./INTEGRATIONS_ARCHITECTURE.md).

### Incident response

Before pilot go-live, walk the commerce webhook incident drill:

```bash
npm run smoke:commerce-webhook-drill -- --checklist-only
```

Operator doc: [`commerce-webhook-incident-drill-era17.md`](./commerce-webhook-incident-drill-era17.md)

---

## Outbound event taxonomy (beta)

OS Kitchen documents outbound webhook event types for partner planning. Full subscription UI and delivery SLA are **not** pilot-ready.

**Source:** `lib/developer/webhook-event-types.ts` · `services/developer/webhook-contract-service.ts`

| Event type | Typical use |
|------------|-------------|
| `order.created` | New order in order hub |
| `order.updated` | Field changes on existing order |
| `order.status_changed` | Lifecycle transition |
| `product_mapping.required` | Channel SKU needs manual mapping |
| `production.completed` | Kitchen production milestone |
| `packing.verified` | Packing QC complete |
| `route.assigned` | Delivery route assignment |
| `pos.transaction_created` | Register sale recorded |
| `support.ticket_created` | Support escalation |
| `integration.failed` | Integration health degradation |

### Retry policy notes (documented, not SLA)

- Exponential backoff with jitter for transient 5xx/429 responses.  
- Non-retryable 4xx (except 429) require manual intervention.  
- Raw payloads are never echoed in OS Kitchen UI — redacted previews only.

**Not claimed:** guaranteed delivery, sub-second latency, production SLA, webhook signing for all outbound types.

---

## Pairing with Public API v1

Partners may combine inbound webhooks (push) with Public API v1 (pull):

1. Create API key (`kos_` prefix) in Dashboard → Developer.  
2. Confirm `api_access` entitlement and paid plan.  
3. Fetch `GET /api/openapi.json` — bearer scheme documented.  
4. Per-route scopes enforced (`era17-public-api-per-route-scope-v1`).  
5. Optional live proof: `SMOKE_PUBLIC_API_KEY=kos_... npm run smoke:public-api-live`.

See [`API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`](./API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md).

---

## Partner integration checklist

| # | Task | Blocker? |
|---|------|----------|
| 1 | Register inbound webhook URLs at provider | Yes |
| 2 | Align signature secrets | Yes |
| 3 | Confirm tenant mapping (cid / shop domain) | Yes |
| 4 | Verify idempotency on provider retries | Yes |
| 5 | Monitor Developer → Webhooks dashboard | No |
| 6 | Complete commerce webhook incident drill | No |
| 7 | Optional Public API v1 integration | No |
| 8 | Review forbidden claims in contract | Yes |

Programmatic checklist: `lib/developer/partner-webhook-pack.ts` → `PARTNER_WEBHOOK_CHECKLIST`.

---

## Recording partner attestation (optional)

```bash
export PARTNER_WEBHOOK_ATTESTATION_EMAIL="integrations@partner.example"
export PARTNER_WEBHOOK_ATTESTATION_NOTES="Woo inbound webhook verified on staging 2026-05-28"
npm run smoke:partner-webhook-docs
```

Without attestation email → **docs_ready_awaiting_partner_attestation** (not fake success).

Review **`artifacts/partner-webhook-docs-summary.json`**.

---

## Validation (engineering)

```bash
npm run test:ci:partner-webhook-docs-era17:cert
npm run test:ci:webhook-security-era16:cert
npm run test:ci:public-api-v1:cert
```

---

## Forbidden claims

Do **not** state in partner contracts or sales decks:

- Production webhook SLA or uptime guarantee  
- Guaranteed webhook delivery  
- SOC2 webhook certification  
- Full outbound webhook subscription platform  
- Zero webhook incident risk  
- Live DoorDash / Uber Eats / Grubhub marketplace delivery  

---

## Related docs

- [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md) — Woo/Shopify operator setup  
- [`cron-webhook-surface.md`](./cron-webhook-surface.md) — full webhook route inventory  
- [`public-post-abuse-review-era17.md`](./public-post-abuse-review-era17.md) — public POST hardening  
