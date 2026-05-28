# Era 20 Integration Health trust layer (2026-05-28)

**Policy:** `era20-integration-health-trust-layer-v1`

**Status:** `trust_layer_wired_awaiting_p0_proof`

---

## Purpose

Integration Health Center is the single **trust layer** for Woo, Shopify, Stripe, webhooks, API, SSO, and engineering smokes. Era 20 prevents **fake green** when P0 or channel smokes are SKIPPED.

---

## P0 trust banner

When `p0ProofStatus !== proof_passed`, `/dashboard/integration-health` shows **P0 staging proof — not passed** with:

- `p0ProofStatus` and missing env var list from `artifacts/p0-staging-proof-unblock-summary.json`
- Honesty note: SKIPPED is not PASS
- CTAs: Launch Wizard, recovery checklist

Anchor: `#integration-health-p0-trust`

---

## Channel card smoke honesty

| Smoke status | Max state tone when connection is CONNECTED |
| --- | --- |
| `PASSED` | unchanged (still not a marketplace LIVE claim) |
| `SKIPPED WITH REASON` | **degraded** (never healthy) |
| `FAILED` | **down** |

Applies to Woo, Shopify, and SSO cards.

---

## Required proof artifacts

| Artifact | Smoke |
| --- | --- |
| `artifacts/p0-staging-proof-unblock-summary.json` | `smoke:p0-staging-proof-unblock` |
| `artifacts/channel-live-smoke-summary.json` | `smoke:woo-shopify-live` |
| SSO / staging workflow children | P0 orchestrator |

---

## CI

```bash
npm run test:ci:integration-health-trust-layer-era20
npm run test:ci:integration-health-trust-layer-era20:cert
```

Chained in `test:ci:integration-health-smoke-artifacts-era19:cert` when present.
