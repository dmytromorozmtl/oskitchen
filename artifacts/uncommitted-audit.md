# Uncommitted Changes Audit

**Generated:** 2026-05-31 (Cycle 93)  
**Base commit:** `41ee9ae1` — feat: OS Kitchen brand — constants, logo, home landing, header split  
**Total uncommitted:** **964** files (957 modified, 7 untracked)  
**Diff size:** +2,602 / −2,104 lines across modified files  
**Prior audit:** Cycle 91 (`b258aa59` base) — −11 files after rebrand batch 1 (cycle 92)

---

## Executive summary

Rebrand **batch 1 landed** on `main` (logo, constants, home landing, header split, dashboard shell logo). **964 files** remain in the working tree — mostly mechanical string/metadata sweeps across docs, app pages, and lib.

Changes still uncommitted cluster into:

1. **Marketing/dashboard chrome** — remaining components + lib/marketing string swaps (batch 2)
2. **App metadata sweep** — ~152 app pages (batch 3)
3. **Mechanical docs sweep** — ~485 docs (batch 5)
4. **Scripts/services alignment** — batch 4
5. **Deploy artifacts** — `.deploy-state/`, `artifacts/deploy-readiness.md` (do not blind-commit)

**Recommendation:** Continue batch commits per table below. **Do not** merge remaining 964 files in one commit.

---

## Batch 1 — committed (cycle 92)

| Path | Status |
|------|--------|
| `lib/constants.ts` | ✅ APP_NAME, accent tokens, pricing |
| `components/ui/os-kitchen-logo.tsx` | ✅ Logo component |
| `components/marketing/home-landing.tsx` | ✅ Home page shell |
| `components/marketing/site-header-client.tsx` | ✅ Client header |
| `components/marketing/site-header.tsx` | ✅ Server header wrapper |
| `app/page.tsx` | ✅ Uses HomeLanding |
| `components/marketing/site-footer.tsx` | ✅ Logo |
| `components/marketing/site-mobile-nav.tsx` | ✅ Logo |
| `components/dashboard/dashboard-shell.tsx` | ✅ Logo chrome |
| `tests/unit/dashboard-shell.test.ts` | ✅ Mailto encoding |

---

## Untracked files (7)

| Path | Verdict |
|------|---------|
| `.deploy-state/predeploy-ready.json` | **Ignore / gitignore** |
| `app/dashboard/not-found.tsx` | Commit with dashboard PR (batch 3) |
| `artifacts/deploy-readiness.md` | Commit with deploy PR |
| `docs/allreport30may.md` | Commit with docs PR (batch 5) |
| `lib/supabase/resolve-public-env.ts` | Commit with lib PR (batch 2) |
| `lib/ui/` | Review — shared UI tokens (batch 2) |
| `scripts/debug-today-page-prod.ts` | **Exclude** — debug script |

---

## Suggested commit batches (remaining)

| Batch | Files (approx) | Message sketch | Status |
|-------|----------------|----------------|--------|
| 1 | ~11 | `feat: OS Kitchen brand — constants, logo, home landing, header split` | ✅ cycle 92 |
| 2 | ~106 | `refactor: marketing and dashboard chrome for OS Kitchen rebrand` | **Next** |
| 3 | ~152 app | `chore: app metadata and titles for OS Kitchen rebrand` | Pending |
| 4 | ~36 scripts + 25 services | `chore: script and service string alignment` | Pending |
| 5 | ~485 docs | `docs: era session and audit doc string alignment` | Pending |
| 6 | ~6 tests + config | `test: unit test updates for rebrand` | Pending |

**Pre-merge gate for batch 2:** Spot-check pricing/claims in touched marketing components against `config/marketing/claims-registry.json`.

---

## Blockers unchanged

| Metric | Value |
|--------|-------|
| Vault | **0/11** |
| P0 | `awaiting_ops_credentials` |
| Score | **85** |
| Uncommitted | **964** |
| GO | **NO-GO** |

This audit catalogs working-tree drift only — it does **not** change pilot score or vault state.

---

## Next recommendation

1. **Human:** Populate ops vault (11/11) per `docs/ops-vault-matrix.md`
2. **Engineering:** Rebrand batch 2 — marketing + dashboard chrome (~106 files)
3. **Agent:** Do **not** claim `ready:true` until vaultReady + p0ProofPassed
