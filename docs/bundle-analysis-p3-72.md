# Bundle analysis optimization (P3-72)

**Policy:** `bundle-analysis-p3-72-v1`  
**Department:** Frontend  
**Upstream:** `bundle-analysis-p1-39-v1`  
**Registry:** [`artifacts/bundle-analysis-p3-72-registry.json`](../artifacts/bundle-analysis-p3-72-registry.json)

---

## Wave 2 code-split (recharts)

| Route | Lazy export | Package deferred |
|-------|-------------|------------------|
| `/dashboard/partner` | `LazyPartnerOperationsCenter` | recharts |
| `/dashboard/growth` | `LazyGrowthCommandCenter` | recharts |
| `/vendor/analytics` | `LazyVendorAnalyticsClient` | recharts |

Wave 1 (P1-39): benchmarks, food-cost, marketplace analytics, vendor finance, overview charts.

Full guide: [`docs/bundle-analysis.md`](./bundle-analysis.md)

---

## Verify

```bash
npm run check:bundle-analysis-p3-72
npm run audit:bundle-analysis-p3-72
npm run audit:bundle-chunks
npm run test:ci:bundle-analysis-p3-72:cert
```

Treemap build: `npm run analyze`

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## Status

8 code-split chart targets wired — recharts deferred from First Load JS on partner, growth, and vendor analytics routes.
