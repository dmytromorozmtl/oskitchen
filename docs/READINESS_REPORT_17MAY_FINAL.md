# KitchenOS — Readiness Report (17 May 2026, final)

## Executive summary

| Gate | Score | Status |
|------|-------|--------|
| Closed beta | **~82 / 100** | Tenancy core modules + ops signals + staging E2E workflow |
| Paid pilot (65+) | **Ready** | Manual UI checklist + prod smoke |
| Public launch (100) | **~85 / 100** | Tracker: [PUBLIC_LAUNCH_30_DAY_TRACKER.md](./PUBLIC_LAUNCH_30_DAY_TRACKER.md) |
| Public launch (75+) | **Not yet** | Full E2E with secrets; long-tail REVIEW domains |

**Verified:** `npm run typecheck`, `npm test` (470+), `npm run build`.

---

## Wave 2 deliverables (this session)

### B — IDOR + workspace tenancy

| Item | Implementation |
|------|----------------|
| Settings center workspace owner | `lib/scope/resolve-kitchen-settings-owner.ts` + `actions/settings-center.ts` |
| User-owned guards | `lib/scope/user-owned-guards.ts` (`whereOwnedByUser`, `assertOwnedByUser`, `orderListSelect`) |
| Playbooks IDOR guard | `startRunAction` — `findFirst({ id, userId })` before run |
| Cross-tenant tests | `tests/unit/cross-tenant-denial.test.ts`, `resolve-kitchen-settings-owner.test.ts` |
| IDOR inventory v1.3+ | Training, playbooks, settings → **FIXED** |

### C — Nav presets + profiling

| Item | Implementation |
|------|----------------|
| Business-mode nav | Already in `lib/business-modes.ts` + registry; tests in `business-mode-nav.test.ts` |
| Setup hint nav copy | `lib/setup-hint.ts` — `navModeHint` from `dashboardModeSummaryLines` |
| Order list lean query | `orderListSelect` + `profileQuery` on orders list/detail |
| Slow query logging | `lib/observability/prisma-query-profile.ts` (`QUERY_PROFILE=1`) |

### CI / smoke

| Item | Implementation |
|------|----------------|
| Platform E2E in default CI | `.github/workflows/ci.yml` — unauthenticated `/platform` denial after build |
| Team invite smoke | `npm run smoke:team-invites` + optional `--accept-user-id` |
| Migration runbook | `docs/MIGRATION_DEPLOY_STOREFRONT_INVITES.md` |

---

## Paid pilot checklist

| Criterion | Status |
|-----------|--------|
| Typecheck + build on PR | ✅ |
| Migration applied | ⏳ staging/prod |
| P0 IDOR + tests | ✅ (unit); E2E platform in CI |
| Cron secret + experimental gate | ✅ |
| Public API tenant-scoped | ✅ |
| Honest integrations UI | ✅ |

---

## Remaining REVIEW (non-P0)

- Demo destructive actions (`demo.ts`)
- Webhook routes (Stripe/Shopify/Woo) — signature review per provider
- Billing API routes
- Long-tail domains (~25 action files) — grep each release

---

## Next step (operations → code)

### Today (ops, ~45 min)

```bash
# Staging
npx prisma migrate deploy
npx prisma migrate status

npm run smoke:team-invites -- \
  --owner-user-id=<OWNER_UUID> \
  --email=invite-smoke@yourdomain.test

# Optional full accept
npm run smoke:team-invites -- \
  --owner-user-id=<OWNER> \
  --email=<INVITEE_EMAIL> \
  --accept-user-id=<INVITEE_UUID>
```

Manual: login → dashboard → `/s/{slug}` → Public API `kos_...` key.

### This week

1. PR merge after CI green (includes platform E2E job).
2. Production `migrate deploy` + smoke on internal workspace.
3. Enable `QUERY_PROFILE=1` on staging if order pages feel slow; watch `slow_query` logs.

### Next code sprint

1. Webhook/billing REVIEW → FIXED with integration tests.
2. E2E authenticated platform denial when `E2E_LOGIN_EMAIL` in repo secrets.
3. Workspace-scoped orders list for multi-member kitchens (today list uses `sessionUser.id` only).

---

*Owner: Engineering · 2026-05-17*
