# Shopify-to-KDS landing page (P3-62)

**Policy:** `shopify-to-kds-landing-p3-62-v1`  
**Department:** Marketing  
**Registry:** [`artifacts/shopify-to-kds-landing-p3-62-registry.json`](../artifacts/shopify-to-kds-landing-p3-62-registry.json)

---

## Canonical route

**`/shopify-to-kds`** — SEO landing for Shopify stores routing online orders to kitchen display.

---

## Highlights

- HMAC-verified Shopify webhook ingest
- Modifier & variant mapping to prep profiles
- KDS bump/expo on shared production board
- Integration Health Center for failed syncs
- Honest limitations section — BETA connector labels

Primary keyword: **shopify to kds**

---

## Verify

```bash
npm run check:shopify-to-kds-landing-p3-62
npm run audit:shopify-to-kds-landing-p3-62
npm run test:ci:shopify-to-kds-landing:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## References

- `components/marketing/shopify-to-kds-landing.tsx`
- `app/blog/shopify-orders-to-kds/page.tsx`
