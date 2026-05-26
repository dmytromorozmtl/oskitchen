# Pilot readiness report — 18 May 2026 (final)

**Status:** **READY_FOR_PILOT** (code) · staging deploy + ops checklist required before first paying operator

---

## Verification summary (Phases F–L)

| Gate | Result | Notes |
|------|--------|-------|
| `npm ci` | **PASS** | Node 22.22.3 |
| `npm run typecheck` | **PASS** | |
| `npm run lint` | **PASS** | Warnings only in `_experiments` libs |
| `npm test` | **PASS** | 604 passed, 1 skipped |
| `npx prisma validate` | **PASS** | |
| `npm run build` | **PASS** | After clean `npm ci`; may need `NODE_OPTIONS=--max-old-space-size=8192` locally |
| File-level F.1 audit | **PASS** | See `docs/CTO_FIXES_APPLIED.md` § Phase F–L |
| Regression spot-check | **PASS** | `actions/pos.ts`, `order-lifecycle`, middleware unchanged |

---

## What blocks first paying customer (ops only)

1. Staging deploy + `workspace:backfill:all`
2. Upstash + `RATE_LIMIT_ADAPTER=upstash`
3. Vercel Cron aligned to 10 production slugs
4. Manual golden path + `test:e2e:pilot`
5. Sales sign-off (`docs/CAPABILITY_SIGNOFF_SALES.md`)

---

## Ops handoff (single command)

```bash
bash scripts/ops/pilot-preflight.sh
```

Then follow `docs/PILOT_STAGING_RUNBOOK.md`.

---

## Document index

| Doc | Audience |
|-----|----------|
| `PILOT_EXECUTIVE_SUMMARY_18MAY.md` | CEO / investors |
| `PILOT_STAGING_RUNBOOK.md` | Ops / infra |
| `PILOT_KNOWN_ISSUES.md` | Eng + ops |
| `PILOT_MONITORING_DASHBOARD.md` | On-call |
| `CAPABILITY_SIGNOFF_SALES.md` | Sales |
| `CTO_FIXES_APPLIED.md` | Engineering |
| `PILOT_PR_DESCRIPTION.md` | PR template |

---

## Known engineering caveats

- DSR route: no dedicated rate limit (superadmin + MFA only; low traffic)
- `PilotReleaseRouteNotice` uses `navReleaseProfile`, not per-feature name (banner is generic)
- `withWorkspaceScope` uses `buildOwnerScopedWhere` (no separate `buildWorkspaceScopedWhere` symbol)

*Last verified: 18 May 2026.*
