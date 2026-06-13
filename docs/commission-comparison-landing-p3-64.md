# Commission comparison landing page (P3-64)

**Policy:** `commission-comparison-landing-p3-64-v1`  
**Department:** Marketing  
**Registry:** [`artifacts/commission-comparison-landing-p3-64-registry.json`](../artifacts/commission-comparison-landing-p3-64-registry.json)

---

## Canonical route

**`/commission-comparison`** — interactive commission comparison calculator (ChowNow parity).

---

## Interactive surfaces

1. **DoorDash 30% vs owned 0%** — simplified ChowNow-style panel
2. **Full marketplace mix** — DoorDash, Uber Eats, Grubhub, Uber Direct vs owned processing

Primary keyword: **commission comparison calculator**

---

## Verify

```bash
npm run check:commission-comparison-landing-p3-64
npm run audit:commission-comparison-landing-p3-64
npm run test:ci:commission-comparison-landing:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## References

- `components/marketing/commission-comparison-landing.tsx`
- `docs/commission-comparison-calculator-p2-46.md`
