# Commissary landing page (P3-61)

**Policy:** `commissary-landing-p3-61-v1`  
**Department:** Marketing  
**Registry:** [`artifacts/commissary-landing-p3-61-registry.json`](../artifacts/commissary-landing-p3-61-registry.json)

---

## Canonical route

**`/commissary-kitchen-software`** — SEO landing for commissary & shared kitchen operators.

Legacy redirect: `/commissary-software` → `/commissary-kitchen-software`

---

## Highlights

- Multi-tenant production calendar & batch waves
- Tenant order hub with lane routing
- B2B marketplace catalog (BETA)
- Honest limitations section — no ERP overclaims

Primary keyword: **commissary kitchen software**

---

## Verify

```bash
npm run check:commissary-landing-p3-61
npm run audit:commissary-landing-p3-61
npm run test:ci:commissary-kitchen-software-landing:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## References

- `components/marketing/commissary-kitchen-software-landing.tsx`
- `docs/icp-definition-final.md`
