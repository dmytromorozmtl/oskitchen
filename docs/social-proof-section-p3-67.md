# Social proof section (P3-67)

**Policy:** `social-proof-section-p3-67-v1`  
**Department:** Marketing  
**Registry:** [`artifacts/social-proof-section-p3-67-registry.json`](../artifacts/social-proof-section-p3-67-registry.json)

---

## Component

**`components/marketing/social-proof-section.tsx`** — reusable honest social proof:

- Directional stats (design partner cohort, integration adapters, trial)
- Illustrative placeholder testimonial with disclaimer (no fabricated quotes)
- No fabricated customer counts or verified quotes

Test id: `social-proof-section`

---

## Wired landings (6)

- `/commissary-kitchen-software`
- `/ghost-kitchen-software`
- `/meal-prep-software`
- `/shopify-to-kds`
- `/restaurant-integration-health`
- `/commission-comparison`

---

## Verify

```bash
npm run check:social-proof-section-p3-67
npm run audit:social-proof-section-p3-67
npm run test:ci:social-proof-section:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`
