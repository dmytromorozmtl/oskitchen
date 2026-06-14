# Suspense boundaries — wave 1 (P2-41)

**Policy:** `suspense-boundaries-p2-41-v1`

Gap closure for Frontend task P2-41: wrap Today, Marketplace, POS, and Kitchen operator pages with in-page Suspense + sector skeleton fallbacks.

## Scope

| Sector | Wave 1 pages | Skeleton |
|--------|--------------|----------|
| Today | 1 (`/today/profit`) | `TodaySkeleton` |
| Marketplace | 21 sub-routes | `MarketplaceSkeleton` |
| POS | 17 sub-routes | `POSSkeleton` |
| Kitchen | 16 sub-routes | `KDSSkeleton` |

**Total:** 55 pages wrapped in wave 1 + 5 baseline hub pages = **60/60** sector pages with Suspense.

## Pattern

```tsx
export default function SomePage(props: SomePageProps) {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <SomePageAsync {...props} />
    </SuspenseWave1PageBoundary>
  );
}

async function SomePageAsync(props: SomePageProps) {
  // existing async data fetch + render
}
```

Component: `components/dashboard/suspense-wave1-page-boundary.tsx`

## Codemod

```bash
npx tsx scripts/wrap-suspense-wave1-p2-41.ts
```

## CI

```bash
npm run check:suspense-boundaries-p2-41
```

## Artifact

`artifacts/suspense-boundaries-p2-41.json`
