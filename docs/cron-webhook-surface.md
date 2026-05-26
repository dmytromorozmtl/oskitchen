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

Verify per provider in route handlers:

| Provider | Verification |
|----------|----------------|
| Stripe | Webhook signing secret |
| WooCommerce | HMAC |
| Shopify | HMAC |
| Resend | Signature header |

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
