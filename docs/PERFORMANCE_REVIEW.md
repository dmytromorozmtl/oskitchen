# Performance review — KitchenOS

Target assumptions for beta: ~1k orders/month per workspace, ~100 products, ~1k customers, multiple channels, ~10 staff users.

## Current posture

- Next.js App Router with server components reduces client JS for many dashboard routes.
- Prisma queries should use narrow `select` / `include` — audit heavy list pages (orders, production, CRM) when latency appears.

## Recommendations (prioritized)

### P1 — Data fetching

- Add **pagination** or cursor-based loading on Order Hub, CRM list, inventory movements.
- **Server-side filters** for date ranges and status; avoid loading full histories into memory.
- Defer expensive payloads (raw webhook bodies, large JSON) until a detail drawer opens.

### P2 — Bundles

- **Dynamic import** PDF generators, chart libraries, and map widgets.
- Split admin-only tools (developer, raw payload viewers) behind lazy routes.

### P3 — Caching

- Use `revalidateTag` / route segment config where reads are stable (settings, plan metadata).
- Avoid over-caching tenant-specific operational data without explicit invalidation.

## Measurement

- Use Vercel Analytics / Web Vitals for production.
- For DB: enable query logging in staging during load tests; add indexes noted in `docs/DATA_MODEL_REVIEW.md`.

## Known gaps

- Full pagination audit not applied app-wide; track per module during stabilization sprints.
