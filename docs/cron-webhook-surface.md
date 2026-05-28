# Cron & Webhook Surface — 17 May 2026

Inventory for security review and closed-beta gating.

## Summary

| Surface | Count | Auth |
|---------|------:|------|
| Cron routes (`app/api/cron/**/route.ts`) | 131 | `CRON_SECRET` via `runCronRoute` |
| Webhook routes (`app/api/webhooks/**`) | 46 | Provider HMAC / Stripe signature (per route) |
| Internal experiment routes (`app/api/internal/**`) | ~15 | Session / internal flags |

## Cron authentication

- **Helper:** `lib/security/cron-auth.ts`
  - `verifyCronSecret(request)` — requires `Authorization: Bearer $CRON_SECRET`
  - `verifyExperimentalCron(request)` — secret + `ENABLE_EXPERIMENTAL_CRONS=true`
- **Runner:** `lib/api/run-cron.ts` — `runCronRoute(request, handler, { experimental?: boolean })`
- **Default:** experimental/regulatory crons **disabled** unless `ENABLE_EXPERIMENTAL_CRONS=true`

### Production storefront crons (examples)

- `storefront-domain-recheck`
- `storefront-team-invite-reminders`
- `storefront-invite-audit-retention`
- `storefront-experiment-edge-sync` (when enabled)

### Experimental crons (gated)

Prefix examples: `hypergraph-*`, `multiverse-*`, `eu-ai-*`, `zk-dna*`, `iso-42001*`, `brainstem-*`, regulatory mesh syncs.

## Webhooks

**Era 16 security matrix (2026-05-28):** `era16-webhook-security-matrix-v1` — `lib/security/webhook-security-matrix.ts` inventories **46 webhook routes** with signature validation, replay protection, tenant mapping, and risk tier (P0–P3). Run `npm run cert:webhook-security-era16` → `artifacts/webhook-security-matrix-summary.json`. CI cert: `test:ci:webhook-security-era16:cert` (in `test:security`). Does **not** claim full replay monitoring ops.

**Era 16 replay hardening (2026-05-28):** `era16-webhook-replay-hardening-v1` — `lib/webhooks/webhook-ingress-replay-guard.ts` + `webhook_ingress_dedupe` ingress dedupe for Uber Direct and Slack; duplicate deliveries return `{ ok: true, duplicate: true }`. Cert: `test:ci:webhook-replay-hardening-era16:cert`.

**Era 17 replay P1 expansion (2026-05-28):** `era17-webhook-replay-p1-expansion-v1` — Resend ingress dedupe + Uber Eats webhook_event_store cert; `npm run smoke:webhook-replay-p1-expansion`; cert `test:ci:webhook-replay-p1-expansion-era17:cert` (in `test:ci:webhook-security-era16:cert`). Not full replay monitoring ops.

**Era 17 commerce webhook incident drill (2026-05-28):** `era17-commerce-webhook-drill-v1` — Stripe/Woo/Shopify operator incident checklist; `npm run smoke:commerce-webhook-drill`; cert `test:ci:commerce-webhook-drill-era17:cert` (in `test:ci:webhook-security-era16:cert`). Awaiting operator tabletop/staging execution.

Verify per provider in route handlers:

| Provider | Verification | Replay / idempotency |
|----------|----------------|----------------------|
| Stripe | Webhook signing secret | `billingEvent.stripeEventId` |
| WooCommerce | HMAC | `webhook_event_store` + delivery id |
| Shopify | HMAC | `webhook_event_store` + webhook id |
| Resend | Signature header | `notificationEvent.providerEventId` |
| Uber Eats | HMAC (placeholder marketplace) | `webhook_event_store` |
| Uber Direct | Bearer secret (placeholder) | `webhook_ingress_dedupe` via `event_id` or body hash |
| BigQuery / experiment | Bearer secret | none — experimental only |
| Slack interactive | Slack signing secret | `webhook_ingress_dedupe` via `trigger_id` |
| SCIM experiment auditor | Bearer `EXPERIMENT_SCIM_WEBHOOK_SECRET` | upsert idempotent |

Placeholder / roadmap channels (Uber Eats, DoorDash) must not be marketed as live — see `lib/capabilities/capability-matrix.ts`.

## Operational commands

```bash
# Staging / production
curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/storefront-domain-recheck

# Experimental (staging only)
ENABLE_EXPERIMENTAL_CRONS=true curl -H "Authorization: Bearer $CRON_SECRET" \
  https://<host>/api/cron/hypergraph-evolution-anchor
```

## Rollout status

- **114+ cron routes** migrated to `runCronRoute` (May 2026 remediation).
- Remaining routes should use the same pattern when touched.
- Review any custom auth blocks during PR review.
