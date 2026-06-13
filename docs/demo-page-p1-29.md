# Demo page — interactive sandbox workspace (P1-29)

**Policy:** `demo-page-p1-29-v1`  
**Updated:** 2026-06-13  
**Route:** `/demo`  
**Audience:** Prospects, sales, design partners — explore Integration Health before launching temp workspace

## Interactive sandbox

Test id: `demo-interactive-sandbox-workspace`

The sandbox embeds a **simulated workspace** with five nav stops. Default view: **Integration Health** (`demo-sandbox-integration-health`).

| Stop | Route | Preview |
|------|-------|---------|
| Today | `/dashboard/today` | Owner Command Center |
| Orders | `/dashboard/orders` | Unified order hub — 50 sample orders |
| KDS | `/dashboard/kitchen` | Kitchen display + production |
| POS | `/dashboard/pos` | Software-first checkout |
| Health | `/dashboard/integration-health` | **Interactive** — click channels for playbook |

## Integration Health channels (6 simulated)

| Channel | Status | Code |
|---------|--------|------|
| DoorDash | FAILED | AUTH_DEGRADED |
| Shopify | PASS | — |
| WooCommerce | PASS | — |
| Uber Eats | SKIPPED | PARTNER_CREDS_MISSING |
| Owned storefront | PASS | — |
| In-store POS | PASS | — |

Click any row to see failure detail + recovery playbook. Data is **simulated** — not live workspace telemetry.

## Claims gate

- Do not imply LIVE DoorDash/Uber Eats fleet-wide on the demo page.
- SKIPPED rows stay visible — no fake green badges.
- Follow [`forbidden-claims-team-cheat-sheet.md`](./forbidden-claims-team-cheat-sheet.md).

Complements P1-83 guided tour (`demo-interactive-sandbox` tabs) on the same `/demo` route.

## CI

```bash
npm run audit:demo-page
npm run check:demo-page
```

Policy: `demo-page-p1-29-v1`
