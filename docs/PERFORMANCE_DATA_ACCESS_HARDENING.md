# Performance & Data Access Hardening

## Known hot surfaces

- `loadExecutiveOverview` — wide order selects; mitigate with indexed filters + narrower `select` over time.  
- Platform cross-tenant queries — always `take` limits (observability services use ≤100 rows).  
- Today command center — ensure blocker queries stay indexed on `userId` + `createdAt`.

## Patterns to apply

1. **Server-side pagination** on audit, support, webhook lists.  
2. **Snapshot tables** for KPIs when queries exceed p95 SLA (materialized view optional).  
3. **Lazy detail drawers** — list endpoints return summary cards only.  
4. **Kill N+1** — batch `in` queries for mapping tables.

## This pass

- Observability lists bounded by `take` constants.  
- Documented follow-ups rather than risky large migrations.
