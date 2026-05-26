# Architecture refactor plan

This document aligns the codebase with **thin UI**, **thick domain services**, and **predictable data access** without a big-bang rewrite.

## Current snapshot

| Layer | Today | Target |
|-------|--------|--------|
| UI (`app/*`, `components/*`) | Rich server components + some client islands | Presentational + wiring only |
| Actions (`actions/*`) | Prisma + business rules mixed | Orchestration calling services/repositories |
| Services (`services/*`) | Partial coverage (delivery, forecasting, integrations) | Expand per subdomain |
| Data | `import { prisma } from "@/lib/prisma"` everywhere | Repositories encapsulating queries |
| Cross-cutting | Zod in `lib/schemas`, permissions in `lib/permissions` | Validators + policies packages |

## New / standardized directories

| Path | Role |
|------|------|
| `repositories/` | Prisma query modules per aggregate (see `README.md`). |
| `validators/` | Shared Zod DTOs for actions and public API. |
| `formatters/` | Locale-safe string/number/date formatters. |
| `policies/` | Authorization + state transition rules. |
| `adapters/` | Third-party client boundaries (beyond `lib/integrations`). |
| `transformers/` | DB ↔ DTO ↔ API response shapes. |
| `orchestrators/` | Multi-step workflows (imports, go-live, partner handoff). |
| `lib/db/` | Pagination, transactions, health, slow-query placeholder. |
| `services/db/` | Re-export for service-layer ergonomics. |
| `services/events/` | In-process event bus (swap for queue later). |
| `services/intelligence/` | Deterministic hints (expand to ML off-process). |
| `services/automation/` | Templates + future engine wiring. |
| `lib/errors/` | `AppError` taxonomy for consistent HTTP/UI mapping. |
| `lib/retry/` | Shared backoff for flaky IO. |

## Server vs client boundaries

- **Never** import `lib/prisma` or `services/*` that touch secrets from Client Components.
- Server Actions remain the default mutation path; route handlers for webhooks only.
- Public API (`app/api/public/v1`) should depend on transformers + validators only.

## Migration strategy (incremental)

1. Pick **one** vertical (recommended: **Orders**) and add `repositories/order-repository.ts` with the 3–5 hottest queries moved out of actions.  
2. Point existing actions at the repository without behavior change.  
3. Repeat for **Customers**, **Integrations health**, **Production tasks**.  
4. Extract `HomeOverview` metrics to `services/dashboard/ops-snapshot.ts` (single exported function returning DTO).  
5. Introduce orchestrators only when a flow touches ≥3 repositories.

## Anti-patterns to remove over time

- Copy-pasted `where: { userId }` blocks without shared helper.  
- Large `select` trees inlined in UI files.  
- Unbounded `findMany` without `take` + stable order (use `lib/db/pagination`).  

## Related docs

- `docs/GLOBAL_SYSTEM_REVIEW.md`  
- `docs/DATABASE_OPTIMIZATION.md`  
- `docs/PERFORMANCE_OPTIMIZATION.md`  
