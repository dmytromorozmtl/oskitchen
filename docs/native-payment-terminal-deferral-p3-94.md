# Native payment terminal deferral (P3-94)

**Policy:** `native-payment-terminal-deferral-p3-94-v1`  
**Department:** Hardware  
**Status:** **DEFERRED** — no native OS Kitchen payment terminals or Stripe Terminal SDK integration  
**Registry:** [`artifacts/native-payment-terminal-deferral-p3-94.json`](../artifacts/native-payment-terminal-deferral-p3-94.json)

---

## Decision

OS Kitchen is **software-first**. We do **not** manufacture proprietary card readers, bundle Toast-style terminal leases, or ship a native payment terminal SDK in 2026.

Stripe Terminal hardware SDK integration is **deferred with no calendar date** until design partner demand and PCI scope are clear.

---

## Use today instead

| Alternative | Path | Status |
|-------------|------|--------|
| Browser counter POS | `/dashboard/pos` | BETA |
| Cash + external terminal workflow | `/dashboard/pos` | LIVE |
| Stripe hosted storefront checkout | `/dashboard/storefront` | BETA |
| Stripe Connect payments setup | `/dashboard/settings` | BETA |

Public line: *No native OS Kitchen payment terminals — browser POS on BYOD, cash/external terminal workflows, and Stripe hosted checkout today.*

---

## Sales / GTM

Do **not** promise:

- "Native payment terminal coming soon"
- "OS Kitchen card reader"
- "Certified OS Kitchen terminal"

Do say:

- "Run counter POS in the browser on tablets you already own. Card-present today is cash or your existing external terminal; online orders use Stripe hosted checkout when configured."

---

## Verify

```bash
npm run check:native-payment-terminal-deferral-p3-94
```

CI gate: `.github/workflows/ci.yml`

Cross-links: [`/roadmap`](../app/roadmap/page.tsx) Out of scope · [`docs/PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md)
