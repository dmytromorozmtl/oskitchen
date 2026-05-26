# KitchenOS Remediation Fix Plan — 17 May 2026

**Goal:** Stabilize for guided closed beta, then paid pilot.  
**Node:** `>=22 <23` (verified on **v22.22.3**).  
**Status:** In progress — see `docs/remediation-report-17may.md` for latest command outputs.

---

## Phase 1 — Baseline (complete)

### Inspected

| Asset | Path |
|-------|------|
| Package scripts / engines | `package.json` |
| TS config | `tsconfig.json` |
| Next config | `next.config.ts` |
| Middleware | `middleware.ts` |
| Schema | `prisma/schema.prisma` |
| CI | `.github/workflows/ci.yml` |
| IDOR inventory | `docs/IDOR_MUTATION_INVENTORY.md` |
| Capabilities | `lib/capabilities/capability-matrix.ts` |
| Channels | `lib/channels/channel-registry.ts` |

### Baseline command results (17 May 2026, Node 22.22.3)

| Command | Result |
|---------|--------|
| `npm run typecheck` | **FAIL** — was **438** errors; after remediation **~106** (57 files) |
| `npm run lint` | **PASS** (warnings only, e.g. unused imports in patched files) |
| `npx prisma validate` | **PASS** with FK warning (`onDelete: SetNull` on required FK) |
| `npx prisma migrate status` | **1 pending:** `20260625100000_storefront_phase6_invites` |
| `npm test` | **PASS** — 451 passed, 1 skipped (was 17 failing files) |

---

## Phase 2 — TypeScript (in progress)

### Root cause

`Record<string, unknown>` assigned to Prisma `JsonValue` / `InputJsonValue` in ~60+ `services/storefront/*-sync-service.ts` and compliance experiment chains.

### Done

- Added `lib/prisma/json.ts`: `toJsonValue`, `toInputJsonValue`, `coalesceThemeExperimentJson`, `applyThemeExperimentPoll`, `foldThemeExperimentJson`
- Patched experiment sync services to use poll + `toInputJsonValue` on writes
- Fixed `theme-experiment-edge-sync.ts` variable ordering + `crdt.lww_merge` span name
- Fixed `workspace-experiment-rollup-service.ts` (`sloMet` vs `withinSlo`)
- Fixed actions: `storefront-catalog-admin`, `markets`, `team`, `experiment-settings` (workspaceId select)
- Fixed `app/api/internal/experiment-dna-audit-block/route.ts` JSON pipeline
- Replaced `findUnique({ userId })` on `storefrontSettings` with `findFirst` + primary ordering (bulk + targeted action fixes)

### Remaining (~106 errors, 57 files)

Categories:

1. **Storefront production UI** — `app/dashboard/storefront/theme/page.tsx` (missing `coverImageUrl`, `layoutPreset` in select), catalog page row types, `app/s/[storeSlug]/layout.tsx` theme/nav/footer types
2. **Server action return types** — Form actions returning `{ ok, error }` vs React 19 `void` expectation (workspace/team pages)
3. **Experiment/compliance one-offs** — missing exports (`isQuantumSafeAssignmentEnabled`), EU webhook payload types, CMMC routes
4. **Misc** — `order-commerce-context` export, cache tag name, rate limit key for magic-link invite

### Acceptance

- `npm run typecheck` exits 0 on Node 22

---

## Phase 3 — Migration readiness

### Migration: `20260625100000_storefront_phase6_invites`

**Safe characteristics:**

- `CREATE TABLE storefront_team_invites` (new table only)
- Indexes on `storefront_id`, `workspace_id`, `email`
- FKs: CASCADE on storefront/workspace/inviter; `SET NULL` on `accepted_user_id` (nullable column — OK)

**No destructive drops or column rewrites.**

### Deploy commands

```bash
# Staging
npx prisma migrate deploy

# Production (after staging verify)
npx prisma migrate deploy
```

**Rollback:** No automatic down migration. Rollback = restore DB snapshot or manual `DROP TABLE storefront_team_invites` only if no production data yet.

### Prisma FK warning

`onDelete: SetNull` on required FK fields (e.g. `locationId` on models where field is non-optional). **Do not auto-fix in this pass** — requires schema decision: make FK nullable or change to `Restrict`/`Cascade`. Track in paid-pilot hardening.

---

## Phases 4–12 — Planned (not complete)

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 4 IDOR | `lib/scope/tenant-scope.ts` + action audits + tests | **Started** (`tenant-scope.ts` added; inventory not fully updated) |
| 5 RBAC | Single permission import path | Not started |
| 6 Platform | Middleware + impersonation audit | Not started |
| 7 Cron/webhook | `lib/security/cron-auth.ts` + `docs/cron-webhook-surface.md` | **Started** (helper added; routes not migrated) |
| 8 Public API | Zod + pagination + rate limits | Not started |
| 9 Tests | Vitest green | **Done** (server-only mock + Groth16 static import) |
| 10 CI smoke | Playwright in default CI | Not started (remote workflow exists) |
| 11 UX honesty | Beta/placeholder badges | Not started |
| 12 Perf | Unbounded customer scan | Not started |

---

## Execution order (recommended)

1. Finish typecheck (production storefront paths first)
2. Apply migration on staging; verify invite flows
3. IDOR high-risk actions + regression tests
4. Cron auth rollout + experimental cron gate
5. Public API hardening
6. CI smoke + UX honesty pass
7. Final `docs/remediation-report-17may.md` sign-off
