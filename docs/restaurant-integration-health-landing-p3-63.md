# Restaurant integration health landing page (P3-63)

**Policy:** `restaurant-integration-health-landing-p3-63-v1`  
**Department:** Marketing  
**Registry:** [`artifacts/restaurant-integration-health-landing-p3-63-registry.json`](../artifacts/restaurant-integration-health-landing-p3-63-registry.json)

---

## Canonical route

**`/restaurant-integration-health`** — SEO landing for restaurant POS integration health monitoring.

Related: `/integration-health-center` (sales page) · `/dashboard/integration-health` (live dashboard)

---

## Highlights

- Per-channel health scores — not green tiles that lie
- DoorDash failure diagnostic with recovery playbooks
- SKIPPED / BETA honesty labels
- Webhook audit trail and catalog sync freshness
- Honest limitations section — no uptime theater

Primary keyword: **restaurant integration health**

---

## Verify

```bash
npm run check:restaurant-integration-health-landing-p3-63
npm run audit:restaurant-integration-health-landing-p3-63
npm run test:ci:restaurant-integration-health-landing:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## References

- `components/marketing/restaurant-integration-health-landing.tsx`
- `app/blog/restaurant-pos-integration-health/page.tsx`
