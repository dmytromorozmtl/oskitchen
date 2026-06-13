# Bundle budget CI gate (P3-59)

**Policy:** `bundle-budget-gate-p3-59-v1`  
**Department:** DevOps  
**Registry:** [`artifacts/bundle-budget-gate-p3-59-registry.json`](../artifacts/bundle-budget-gate-p3-59-registry.json)

---

## Scope

CI gate that **fails** when any route **First Load JS exceeds 1000 kB** (warn at 500 kB).

Parses `next build` output from `artifacts/build-route-sizes.log` and compares against:

- Committed baseline (`artifacts/bundle-size-baseline.json`)
- Per-surface ceilings (marketing, dashboard, POS, analytics)
- Absolute fail threshold: **>1000 kB**

---

## Run

```bash
npm run build 2>&1 | tee artifacts/build-route-sizes.log
npm run check:bundle-size-regression
npm run check:bundle-budget-gate-p3-59
npm run audit:bundle-budget-gate-p3-59
npm run test:ci:bundle-size-regression
```

CI: `.github/workflows/ci.yml` — **Performance regression (bundle size)**  
Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## References

- `lib/performance/bundle-size-budget-policy.ts` — thresholds and parsers
- `docs/bundle-analysis.md` — treemap analysis guide
