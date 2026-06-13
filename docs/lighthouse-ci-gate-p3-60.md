# Lighthouse CI gate (P3-60)

**Policy:** `lighthouse-ci-gate-p3-60-v1`  
**Department:** DevOps  
**Registry:** [`artifacts/lighthouse-ci-gate-p3-60-registry.json`](../artifacts/lighthouse-ci-gate-p3-60-registry.json)

---

## Scope

Lighthouse CI gate enforcing Core Web Vitals on revenue-critical marketing paths:

| Metric | Threshold |
|--------|-----------|
| **FCP** (First Contentful Paint) | < **2000 ms** (2s) |
| **LCP** (Largest Contentful Paint) | < **3500 ms** (3.5s) |
| **CLS** (Cumulative Layout Shift) | < **0.1** |

Paths: `/`, `/pricing`, `/login`, `/shopify`

Config: `lighthouserc.core-web-vitals.cjs`  
CI workflow: `.github/workflows/lighthouse.yml`

---

## Run

```bash
npm run build
npm run start -- -p 3000 &
npm run check:lighthouse-ci-gate-p3-60
npm run audit:lighthouse-ci-gate-p3-60
npm run test:ci:lighthouse-core-web-vitals
LHCI_BASE_URL=http://127.0.0.1:3000 npm run lighthouse:core-web-vitals
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## References

- `lib/performance/lighthouse-core-web-vitals-policy.ts` — upstream thresholds
- `.github/workflows/lighthouse-storefront.yml` — optional storefront slice
