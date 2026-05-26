# Performance optimization

## Principles

1. **Measure first** — use Web Vitals + DB query logs before micro-optimizing.  
2. **Server Components by default** — push data fetching to the server; keep islands small.  
3. **Stable dependency arrays** in client hooks to avoid accidental refetch storms.

## Next.js / React

| Area | Recommendation |
|------|------------------|
| Code splitting | Use `dynamic()` for heavy chart or PDF modules on non-critical paths. |
| Dashboard tables | Add virtualization (`@tanstack/react-virtual`) once row counts regularly exceed ~100 visible lines. |
| Charts | Downsample points server-side for weekly trends; lazy load Recharts on analytics pages. |
| Hydration | Avoid passing large serialized blobs to client components; prefer minimal props + later fetch. |

## Data fetching

- Collapse N+1 patterns inside repositories with `include` planning.  
- For read-mostly widgets, consider **cached fetch** (`unstable_cache` / tag revalidation) per user/day.

## Bundles

- `@supabase/*` + PDF stacks dominate — keep them out of middleware-sized graphs where possible (already mitigated via webpack alias for `iceberg-js` in `next.config.ts`).  
- Audit `import *` from `lucide-react`; prefer per-icon imports in hot paths.

## Background work

- Long imports / sync should move to **queue** or **cron + chunking** with progress rows — avoid blocking HTTP request threads.

## Checklist before release

- [ ] Lighthouse mobile ≥85 on storefront hero  
- [ ] No `findMany` without `take` on user-controlled lists  
- [ ] Prisma query log sampled in staging  

## Related docs

- `docs/DATABASE_OPTIMIZATION.md`  
- `docs/ARCHITECTURE_REFACTOR.md`  
