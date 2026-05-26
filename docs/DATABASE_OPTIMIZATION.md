# Database optimization

## Schema posture

- **~80 models**, broad indexing (`@@index` used extensively on foreign keys, status fields, and timestamps).  
- **Risk:** hot dashboard paths still issue many small queries — indexes help latency but not round-trip count.

## Immediate recommendations

### 1. Dashboard home (`HomeOverview`)

- Today: single `Promise.all` with many counts and one `productionTask.findMany` for all tasks.  
- **Issue:** completion % scales O(n) with tasks.  
- **Fix:** replace full scan with `aggregate` / sampled metrics / nightly rollup table per user.  
- **Rank:** High  

### 2. Pagination defaults

- Use `clampPageSize` + stable `orderBy` from `lib/db/pagination.ts` for any new list endpoints.  
- Audit existing `findMany` without `take` in `actions/*` (search for `findMany({`).

### 3. Select shapes

- Prefer explicit `select` objects over returning full models to server components that only need counts.  
- Introduce **DTO transformers** when the same shape is reused in API + UI.

### 4. JSON columns

- JSON is used for flexible payloads (addresses, mapping templates).  
- Keep JSON for variability; avoid JSON for fields that need frequent range queries unless indexed with expression indexes (Postgres).

### 5. Transactions

- Use `withTransaction` from `lib/db/transaction.ts` for multi-row writes (order + items + external sync).  
- Tune `timeout` per heavy job (imports).

### 6. Observability

- `lib/db/slow-query-log.ts` documents Prisma `$extends` hooking — wire to APM when available.

## New automation tables

Migration `20260511120000_automation_engine_foundation` adds:

- `automation_rules` (+ user scope, template key)  
- `automation_triggers` / `automation_actions` (normalized config JSON)  
- `automation_executions` (audit + retry semantics later)

**Apply locally / CI:** `npm run db:deploy`

## Index backlog ideas (evaluate per slow query log)

- Partial indexes on `orders(status, pickup_date)` for “active pipeline” widgets.  
- Covering indexes only after measuring `EXPLAIN ANALYZE` in production-like data volumes.

## Related

- `docs/ARCHITECTURE_REFACTOR.md` — repository extraction targets  
- `lib/db/*` — helpers added in this professionalization pass  
