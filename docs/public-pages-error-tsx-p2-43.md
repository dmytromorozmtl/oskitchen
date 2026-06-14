# Public pages error.tsx — layout catch-all (P2-43)

**Policy:** `public-pages-error-tsx-p2-43-v1`

Gap closure for Frontend task P2-43: layout-level `error.tsx` catch-alls covering 251 public pages (excluding `app/dashboard`).

## Layout error boundaries

| Segment | Path | Home CTA |
|---------|------|----------|
| Root | `app/error.tsx` | `/` |
| Platform | `app/platform/error.tsx` | `/platform/dashboard` |
| Vendor | `app/vendor/error.tsx` | `/vendor/dashboard` |
| Storefront | `app/s/[storeSlug]/error.tsx` | `/` |
| Help | `app/help/error.tsx` | `/help` |
| Legal | `app/legal/error.tsx` | `/legal` |
| Pricing | `app/pricing/error.tsx` | `/pricing` |
| Integrations | `app/integrations/error.tsx` | `/integrations` |
| Onboarding | `app/onboarding/error.tsx` | `/onboarding` |
| QR | `app/q/error.tsx` | `/` |

Component: `components/marketing/public-layout-error.tsx`

## Scaffold

```bash
npx tsx scripts/scaffold-public-pages-error-tsx-p2-43.ts
```

## CI

```bash
npm run check:public-pages-error-tsx-p2-43
```

## Artifact

`artifacts/public-pages-error-tsx-p2-43.json`
