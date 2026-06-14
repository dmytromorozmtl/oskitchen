# Not-found.tsx audit — all verticals (P3-99)

**Policy:** `not-found-audit-p3-99-v1`  
**Status:** **DONE** — 8 vertical segment `not-found.tsx` files + root fallback  
**Registry:** [`artifacts/not-found-audit-p3-99.json`](../artifacts/not-found-audit-p3-99.json)

---

## Scope

Expands P1-33 (3 segments) and P3-79 (regression gate) to **all app verticals** with contextual 404 pages.

| Vertical | Path | testId | Primary CTA |
|----------|------|--------|-------------|
| Dashboard | `app/dashboard/not-found.tsx` | `segment-not-found-dashboard` | `/dashboard/today` |
| Vendor | `app/vendor/not-found.tsx` | `segment-not-found-vendor` | `/vendor/dashboard` |
| Storefront | `app/s/not-found.tsx` | `segment-not-found-storefront` | `/` |
| Platform | `app/platform/not-found.tsx` | `segment-not-found-platform` | `/platform/dashboard` |
| Onboarding | `app/onboarding/not-found.tsx` | `segment-not-found-onboarding` | `/onboarding` |
| Help | `app/help/not-found.tsx` | `segment-not-found-help` | `/help` |
| QR ordering | `app/q/not-found.tsx` | `segment-not-found-q` | `/` |
| Integrations | `app/integrations/not-found.tsx` | `segment-not-found-integrations` | `/integrations` |

Root marketing fallback: `app/not-found.tsx`

---

## Verify

```bash
npm run check:not-found-audit-p3-99
```

CI gate: `.github/workflows/ci.yml`

Cross-links: P1-33 `check:segment-level-not-found-p1-33` · P3-79 `check:segment-not-found-p3-79`
