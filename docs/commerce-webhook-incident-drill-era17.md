# Era 17 — Commerce webhook incident drill (Stripe / Woo / Shopify)

**Policy:** `era17-commerce-webhook-drill-v1`  
**Status:** **awaiting_commerce_webhook_drill_execution**  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · `era16-webhook-security-matrix-v1`

Operator checklist for commerce webhook incidents. Does **not** claim full replay monitoring ops or live marketplace integrations.

---

## Drill modes

| Mode | When to use |
|------|-------------|
| **tabletop** | Pre-pilot — walk through incident steps with owner + support |
| **staging** | Controlled rehearsal on staging tenant with test webhooks |

Set `COMMERCE_WEBHOOK_DRILL_MODE=tabletop|staging`.

---

## Provider routes (matrix reference)

| Provider | API path | Signature |
|----------|----------|-----------|
| Stripe | `/api/webhooks/stripe` | `stripe_construct_event` |
| WooCommerce | `/api/webhooks/woocommerce` | `woocommerce_hmac` |
| Shopify | `/api/webhooks/shopify/orders` | `shopify_hmac` |

Source: `lib/security/webhook-security-matrix.ts` · `lib/security/commerce-webhook-drill-era17-policy.ts`

---

## Incident drill steps

| Step | Action | Owner |
|------|--------|-------|
| 1 | Triage failing commerce webhook — provider, route, HTTP status, signature errors | Support + owner |
| 2 | Verify signature secret alignment (Stripe / Woo / Shopify) | Owner + integrations admin |
| 3 | Confirm webhook URL, TLS, tenant mapping (shop domain / connection id) | Integrations admin |
| 4 | Contain duplicate/replay storms — ingress dedupe + webhook_event_store | Platform on-call |
| 5 | Invalid signature fail-closed test — bad HMAC → 401/400, no order side effects | Support + platform |
| 6 | Recovery — fix secret/URL, re-enable, one test event to order hub | Owner + support |

---

## Recording a drill

```bash
export COMMERCE_WEBHOOK_DRILL_MODE=tabletop
export COMMERCE_WEBHOOK_DRILL_OPERATOR_EMAIL="ops@example.com"
export COMMERCE_WEBHOOK_DRILL_INCIDENT_PROVIDER=woocommerce
export COMMERCE_WEBHOOK_DRILL_INCIDENT_SUMMARY="Simulated HMAC mismatch after secret rotation"
export COMMERCE_WEBHOOK_DRILL_STEP_1_STATUS=PASSED
export COMMERCE_WEBHOOK_DRILL_STEP_2_STATUS=PASSED
export COMMERCE_WEBHOOK_DRILL_STEP_3_STATUS=PASSED
export COMMERCE_WEBHOOK_DRILL_STEP_4_STATUS=PASSED
export COMMERCE_WEBHOOK_DRILL_STEP_5_STATUS=PASSED
export COMMERCE_WEBHOOK_DRILL_STEP_6_STATUS=PASSED
export COMMERCE_WEBHOOK_DRILL_POSTMORTEM="Add direct link to Woo webhook settings in runbook"
npm run smoke:commerce-webhook-drill
```

Pre-drill template (all steps skipped):

```bash
npm run smoke:commerce-webhook-drill -- --template-only
```

Review **`artifacts/commerce-webhook-drill-summary.json`** — `commerceWebhookProofStatus` must be `proof_passed` for validated incident readiness.

---

## Validation (engineering)

```bash
npm run test:ci:commerce-webhook-drill-era17:cert
npm run test:ci:webhook-security-era16:cert
```

---

## Honesty rules

- Do **not** mark `proof_passed` without all six steps `PASSED` and operator email.
- Tabletop PASS is **not** production incident certification.
- Staging drill requires `COMMERCE_WEBHOOK_DRILL_STAGING_URL`.
- Do **not** claim zero webhook risk or full replay monitoring ops.

---

## Related

- Webhook replay P1 expansion: `era17-webhook-replay-p1-expansion-v1`
- Channel live smoke: `npm run smoke:woo-shopify-live` (credentials required)
- Cron webhook surface: [`cron-webhook-surface.md`](./cron-webhook-surface.md)
