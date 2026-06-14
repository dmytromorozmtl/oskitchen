# Dashboard error.tsx — 45 operator routes (P2-42)

**Policy:** `dashboard-error-tsx-p2-42-v1`

Gap closure for Frontend task P2-42: templated `error.tsx` on 45 pilot-critical operator routes across Today, Marketplace, POS, and Kitchen.

## Scope

45 routes = Suspense wave-1 operator pages minus 10 marketplace admin/demo routes.

Each route uses `ErrorBoundaryTemplate` via:

```tsx
"use client";

import { ErrorBoundaryTemplate } from "@/components/dashboard/error-boundary-template";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryTemplate {...props} />;
}
```

## Scaffold / migrate

```bash
npx tsx scripts/scaffold-dashboard-error-tsx-p2-42.ts
```

## CI

```bash
npm run check:dashboard-error-tsx-p2-42
```

## Artifact

`artifacts/dashboard-error-tsx-p2-42.json`
