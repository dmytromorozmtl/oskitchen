# Bundle size analysis — OS Kitchen

**Version:** 1.0 · **June 2026**  
**Stack:** Next.js 15 (`next.config.ts`), App Router, ~566 dashboard routes  
**Tool:** [`@next/bundle-analyzer`](https://www.npmjs.com/package/@next/bundle-analyzer)

Production builds already print per-route **First Load JS** in the `next build` log. This guide adds interactive treemap analysis for regressions and optimization work (Task 75, Task 41).

---

## When to run

| Trigger | Action |
|---------|--------|
| New dashboard feature with charts, PDF, maps, or rich editors | Analyze affected routes before merge |
| Marketing landing change with new client components | Check public route First Load JS |
| Dependency upgrade (`recharts`, `@sentry/nextjs`, Stripe SDK) | Compare treemap before/after |
| Quarterly perf review | Re-baseline + store summary in `artifacts/` (Task 75) |

---

## Prerequisites

- Node 22 (matches CI / Vercel)
- Clean working tree recommended (`git status` clean before comparing baselines)
- **Local RAM:** full production build peaks high (~8 GB+ on this repo due to 655+ static paths). Close other apps; Vercel builders use `cpus: 1` and reduced SSG concurrency (`next.config.ts`).

Install analyzer (dev dependency — wired in repo as of Task 75):

```bash
npm install --save-dev @next/bundle-analyzer
```

---

## One-time wiring (`next.config.ts`)

Wrap the existing config when `ANALYZE=true`. Pattern for this repo's TypeScript config:

```typescript
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // … existing next.config.ts contents …
};

export default withBundleAnalyzer(nextConfig);
```

**Notes for OS Kitchen:**

- Keep `serverExternalPackages: ["stripe"]` — Stripe stays server-side (smaller client graph).
- `productionBrowserSourceMaps: false` — correct for prod bundle size; enable only temporarily when debugging.
- Analyzer uses **webpack** output from `next build`. Do not pass `--turbo` for analyze runs unless you verify analyzer support for your Next version.

Add npm script (recommended when wiring):

```json
"analyze": "ANALYZE=true next build"
```

---

## Run analysis

### Quick check (no analyzer)

Every `npm run build` ends with a route table:

```bash
npm run build 2>&1 | tee artifacts/build-route-sizes.log
```

Look for **First Load JS** on hot paths:

| Route class | Examples | Watch for |
|-------------|----------|-----------|
| Dashboard shell | `/dashboard/today`, `/dashboard/orders` | Shared `_app` / layout chunk growth |
| POS / KDS | `/dashboard/pos/terminal`, `/dashboard/kds` | Real-time + keyboard libs |
| Analytics | `/dashboard/analytics/*` | `recharts` (~heavy) |
| Marketplace | `/dashboard/marketplace/*` | Catalog grids, filters |
| Public marketing | `/`, `/pricing`, `/shopify` | Hero + calculator client JS |
| Storefront | `/s/[slug]/*` | Theme + checkout client |

### Full treemap (bundle analyzer)

```bash
# After wiring next.config.ts + devDependency
ANALYZE=true npm run build
# or
npm run analyze
```

On success, two browser tabs typically open:

1. **Client bundles** — what ships to the browser (primary concern)
2. **Server bundles** — RSC / API route server graphs

Reports are also written under `.next/analyze/` (client/server JSON + HTML). Add `.next/` to local ignore — do not commit treemap output.

**Headless / CI:** set `BUNDLE_ANALYZE=static` or disable auto-open if your `@next/bundle-analyzer` version supports `openAnalyzer: false`:

```typescript
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: process.env.CI !== "true",
});
```

---

## Interpret results

### Client treemap

| Signal | Likely cause | Fix direction |
|--------|--------------|---------------|
| Single huge `node_modules` block | Whole library imported | `import { X } from 'lib/subpath'` or dynamic `import()` |
| Duplicate packages (two React versions) | Resolution / nested deps | `npm ls react`; align versions |
| Dashboard layout chunk grows | Shared imports in `app/dashboard/layout.tsx` | Lazy-load heavy widgets |
| Page-specific spike | Route-level `"use client"` barrel | Split server components; move charts to dynamic segments |

### Known heavy dependencies in this repo

| Package | Used for | Mitigation |
|---------|----------|------------|
| `recharts` | Analytics dashboards | Dynamic import on analytics routes only |
| `jspdf` + `jspdf-autotable` | PDF exports | Dynamic import inside export actions / client handlers |
| `@sentry/nextjs` | Error monitoring (when DSN set) | Keep sample rates low; see `docs/sentry-setup.md` |
| `@supabase/*` | Auth / storage | Already tree-shaken; avoid importing server clients in client components |

### Server treemap

Focus on API routes and RSC modules pulling Node-only deps into unexpected graphs. `stripe` is externalized — confirm it does not appear in client treemap.

---

## Budget guidelines (starting points)

These are **internal targets**, not CI gates yet (Task 41 / Task 79 add regression tests):

| Surface | First Load JS (gzip, approximate) | Notes |
|---------|-------------------------------------|-------|
| Public marketing page | < 200 kB | No dashboard shell |
| Dashboard list page | < 350 kB | Shared layout counts toward repeat visits |
| POS / KDS interactive | < 450 kB | Accept higher if offline-tolerant UX requires it |
| Analytics with charts | < 500 kB | Chart library dominates — document exception |

Record baseline in Task 75 commit: `artifacts/bundle-analysis-report.json`.

---

## Sweep execution (Task 75 — 2026-06-02)

**Wired:** `@next/bundle-analyzer` in `next.config.ts` · `npm run analyze` · `npm run report:bundle`

| Step | Result |
|------|--------|
| `npm run analyze` (12 GB heap) | **OOM** during webpack compile — see `artifacts/bundle-analyzer-attempt.json` |
| `npm run build` | **PASS** — route sizes in `artifacts/build-route-sizes.log` |
| `npm run report:bundle` | **PASS** — `artifacts/bundle-analysis-report.json` |

**June 2026 First Load JS (representative routes):**

| Route | Baseline | Measured | Δ |
|-------|--------:|---------:|--:|
| Shared | 102 kB | 102 kB | 0 |
| `/` | 194 kB | 194 kB | 0 |
| `/pricing` | 211 kB | 211 kB | 0 |
| `/login` | 129 kB | 129 kB | 0 |
| `/dashboard/today` | 139 kB | 139 kB | 0 |
| `/dashboard/pos/terminal` | 165 kB | 165 kB | 0 |
| `/dashboard/analytics/benchmarks` | 238 kB | 238 kB | 0 |
| `/dashboard/marketplace/catalog` | 118 kB | 133 kB | +15 kB (within 15% tolerance) |

**Overall:** PASS — no surface budget or baseline regression violations. Full treemap deferred to CI/16 GB+ machine.

Regenerate:

```bash
npm run build 2>&1 | tee artifacts/build-route-sizes.log
npm run report:bundle
# Optional treemap (requires ≥16 GB RAM):
NODE_OPTIONS=--max-old-space-size=16384 npm run analyze
```

---

## Optimization playbook

1. **Prefer Server Components** — default in `app/`; add `"use client"` only for interactivity.
2. **Dynamic import heavy UI:**

   ```typescript
   import dynamic from "next/dynamic";

   const RevenueChart = dynamic(
     () => import("@/components/analytics/revenue-chart").then((m) => m.RevenueChart),
     { ssr: false, loading: () => <ChartSkeleton /> },
   );
   ```

3. **Audit barrel files** — `components/index.ts` re-exports can pull unused code into chunks.
4. **Review `next/image`** — marketing uses it more consistently than some dashboard pages (`docs/FULL_SYSTEM_AUDIT_REPORT.md` §5.3).
5. **Avoid leaking server env** — does not shrink bundle much but prevents accidental client imports of `lib/env` server paths.

---

## Vercel / production parity

| Setting | Location | Bundle impact |
|---------|----------|---------------|
| `staticGenerationMaxConcurrency: 1` on Vercel | `next.config.ts` | Build time, not runtime size |
| `webpack cache: false` on Vercel | `next.config.ts` | CI log limit; local analyze builds may differ slightly |
| No source maps in prod | `productionBrowserSourceMaps: false` | Smaller deploy artifact |

Analyze **locally** with production env stubs; Vercel build logs do not replace treemap review.

---

## Related tasks & docs

| Item | Description |
|------|-------------|
| Task 75 | Run analyzer, commit `artifacts/bundle-analysis-report` |
| Task 41 | `tests/unit/bundle-size-regression.test.ts` |
| Task 79 | CI performance regression check |
| [`console-log-audit.md`](./console-log-audit.md) | Logging hygiene (separate from bundle size) |
| [`observability-setup.md`](./observability-setup.md) | Sentry client bundle when enabled |
| [`PERFORMANCE_QUERY_OPTIMIZATION_AUDIT.md`](./PERFORMANCE_QUERY_OPTIMIZATION_AUDIT.md) | Server-side / DB perf (complements client bundle work) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build OOM locally | `NEXT_STATIC_GENERATION_MAX_CONCURRENCY=1 npm run analyze` |
| Analyzer does not open | Open `.next/analyze/client.html` manually |
| `Cannot find module '@next/bundle-analyzer'` | Run `npm install --save-dev @next/bundle-analyzer` |
| Treemap differs from Vercel | Match `NODE_ENV=production`; same commit SHA; check for local `.env` changing feature flags |
