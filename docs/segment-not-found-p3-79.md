# Segment-level not-found.tsx (P3-79)

**Policy:** `segment-not-found-p3-79-v1`  
**Status:** **DONE** — dashboard/, vendor/, s/* contextual 404s  
**Updated:** 2026-06-16

Gap closure: verify segment-level `not-found.tsx` for the three primary app verticals (implemented in P1-33, regression-gated in P3-79).

## Segments

| Segment | Path | testId | Primary CTA |
|---------|------|--------|-------------|
| Dashboard | `app/dashboard/not-found.tsx` | `segment-not-found-dashboard` | `/dashboard/today` |
| Vendor | `app/vendor/not-found.tsx` | `segment-not-found-vendor` | `/vendor/dashboard` |
| Storefront | `app/s/not-found.tsx` | `segment-not-found-storefront` | `/` |

Root marketing fallback: `app/not-found.tsx`

## Verify

```bash
npm run check:segment-not-found-p3-79
```

## Artifact

`artifacts/segment-not-found-p3-79.json`
