# Works with OS Kitchen (P2-57)

**Policy:** `works-with-os-kitchen-p2-57-v1`  
**Route:** `/works-with-os-kitchen`  
**Updated:** 2026-06-16

## Gap closure

Public page now shows **17 LIVE integrations** from `integration-registry.ts` — each with:

- Brand logo tile (`public/integrations/logos/{id}.svg`)
- Registry **LIVE** status badge
- Capability one-liner (honest scaffold wording)
- Dashboard setup route link

## 17 LIVE integrations

| Category | Integrations |
|----------|-------------|
| Delivery | DoorDash, Skip / Just Eat, Grubhub, Uber Eats |
| Commerce | WooCommerce, Shopify |
| Accounting | QuickBooks, Xero |
| Labor | 7shifts, Homebase |
| Marketing | Klaviyo, Mailchimp |
| Payments | Stripe, Square Payments, Moneris |
| Reservations | Resy, OpenTable |

## Honesty

- **Registry status** reflects scaffold + smoke proof — not workspace connection state
- **Workspace credentials** still required per merchant
- **LIVE scaffold** ≠ not a blanket connected badge
- Hardware compatibility center (P2-87) remains as secondary section on same route

## CI

```bash
npm run check:works-with-os-kitchen-p2-57
```

## Artifact

`artifacts/works-with-os-kitchen-p2-57.json`

## Related

- `lib/integrations/integration-registry.ts` — source of truth
- `artifacts/smoke-live-integration-dod-summary.json` — liveCount: 17
- `/integration-health-center` — post-signup health dashboard
