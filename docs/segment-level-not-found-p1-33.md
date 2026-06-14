# P1-33 — Segment-level not-found.tsx

**Policy:** `segment-level-not-found-p1-33-v1`  
**Registry:** [`artifacts/segment-level-not-found-p1-33.json`](../artifacts/segment-level-not-found-p1-33.json)

## Contract

Each major app vertical must render a contextual 404 instead of falling through to the root `app/not-found.tsx`:

| Segment | Path | Primary CTA |
|---------|------|-------------|
| Dashboard | `app/dashboard/not-found.tsx` | `/dashboard/today` |
| Vendor | `app/vendor/not-found.tsx` | `/vendor/dashboard` |
| Storefront | `app/s/not-found.tsx` | `/` (home) |

Each segment page exposes `data-testid="segment-not-found-{segment}"`.

## Verify

```bash
npm run check:segment-level-not-found-p1-33
```
