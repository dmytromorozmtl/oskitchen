# workspaceId Migration Runbook

**Security P0** — tenant-scoped rows without `workspace_id` are IDOR risk after backfill gaps.  
**ADR:** `docs/adr/0002-tenant-workspace-scoping.md`

---

## Current status (2026-05-24)

| Layer | Status |
|-------|--------|
| Prisma schema | **219 / 219** user-scoped models have `workspaceId` |
| CI schema gate | `npm run workspace:coverage:strict` (baseline 0) |
| Hot-path runtime | POS, production, staff, storefront, **Today** command center scoped |
| Data backfill | `workspace:backfill:full` + `provision-orphans` + SQL owner |
| NOT NULL migration | `20260525000000_workspace_id_not_null` — apply after verify |

```bash
npm run workspace:audit
npm run workspace:coverage:check
```

---

## Deploy sequence (staging → prod)

```bash
# 1. Schema
npm run workspace:deploy:preflight    # schema + dry-run backfill + data hint
npm run prisma:migrate:safe

# 2. Data (full — not only phases 12–29)
npm run workspace:backfill:full -- --dry-run
npm run workspace:backfill:full -- --execute
npx tsx scripts/provision-workspace-for-orphan-owners.ts --execute
npx tsx scripts/backfill-workspace-only-tables.ts --execute

# Or one shot:
npm run workspace:prod:deploy:execute

# 3. Gates
npm run workspace:strict:all
# schema only:
npm run workspace:coverage:strict
# data only (strict = fail if any table missing column):
npm run workspace:post-backfill:verify:strict

# 4. NOT NULL (when strict:all green on target DB)
npm run workspace:generate:not-null
npm run prisma:migrate:safe

# 5. App
npm run ci:check && npm test
```

---

## Scripts reference

| Command | Purpose |
|---------|---------|
| `workspace:backfill:full` | Phases 1–11 + SQL owner + 12–29 |
| `workspace:backfill:provision-orphans` | Workspace for users with kitchen_settings but no Workspace |
| `workspace:backfill:sql-owner` | SQL UPDATE all tables with `user_id` |
| `workspace:backfill:phases-12-29` | Aggregate backfill phases 12–29 only |
| `workspace:post-backfill:verify` | NULL `workspace_id` scan + 5 owner spot-check |
| `workspace:post-backfill:verify:strict` | Same + **fail** if column missing on any table |
| `workspace:strict:all` | Schema 100% + strict data verify |
| `workspace:generate:not-null` | Regenerate NOT NULL SQL from schema |
| `workspace:audit:services:strict` | Service scope gate (baseline **0**, in CI) |
| `workspace:prod:deploy` | Migrate + backfill dry-run gate |
| `workspace:prod:deploy:execute` | Backfill execute + `strict:all` |

`scripts/workspace-post-backfill-verify.ts` maps Prisma `@@map` tables via `scripts/lib/workspace-table-map.ts`.

---

## Verify behaviour

| Outcome | Meaning |
|---------|---------|
| `OK — N tables checked` | No NULL `workspace_id` in checked tables |
| `SKIP` (no `--strict`) | Local DB behind migrations — run `prisma:migrate:safe` |
| `FAIL (--strict)` | Column missing on ≥1 table — do **not** apply NOT NULL |
| `FAIL — N table(s)` | Rows still need `backfill --execute` |

---

## Post-NOT NULL (Sprint 23) ✅

Default scope is **workspace-only** (`buildOwnerScopedWhere` → `{ workspaceId }`).

Emergency rollback before NOT NULL on a DB: `WORKSPACE_SCOPE_LEGACY_OR=1`.

Smoke: [`SMOKE_POST_NOT_NULL_CHECKLIST.md`](SMOKE_POST_NOT_NULL_CHECKLIST.md)

---

## Definition of done

- [x] Schema 219/219 `workspaceId`
- [x] Hot-path services scoped
- [x] Post-backfill verify + NOT NULL generator
- [x] `workspace:strict:all` green on linked DB (Sprint 22)
- [x] NOT NULL migration applied on linked DB
- [ ] Repeat on dedicated prod if separate instance
- [x] Legacy OR removed (default; env rollback)

See also: [`NEXT_STEPS_TO_100.md`](NEXT_STEPS_TO_100.md).
