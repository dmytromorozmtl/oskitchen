# Uncommitted Changes Audit

**Generated:** 2026-05-31 (Cycle 91)  
**Base commit:** `b258aa59` — fix: workspace legacy OR scope default and test expectations  
**Total uncommitted:** **975** files (965 modified, 10 untracked)  
**Diff size:** +2,697 / −2,274 lines across modified files  
**Prior audit:** Cycle 88 (`ce1b9973` base) — −3 files after cycles 89–90 pilot commits on `main`

---

## Executive summary

The working tree still holds a **large pre-Vercel / OS Kitchen rebrand batch** orthogonal to pilot-readiness work. **30 execution-cycle commits** (cycles 64–90) are on `main`; this batch must not be blind-committed.

Changes cluster into:

1. **Brand rebrand** — `KitchenOS` → `OS Kitchen`, accent colors, pricing copy (`lib/constants.ts`)
2. **Marketing shell refactor** — `HomeLanding`, server/client header split, `os-kitchen-logo.tsx`
3. **Mechanical metadata sweep** — ~485 docs + app pages + lib files (mostly ≤3 line string swaps)
4. **Deploy readiness artifacts** — `.deploy-state/predeploy-ready.json`, `artifacts/deploy-readiness.md` (untracked)

**Recommendation:** Split into reviewable PRs (see batch table below). **Do not** merge with pilot-readiness work in one commit.

**Suspicious scan:** No `.env`, credentials, or private keys in paths. Run `git diff | grep -iE 'sk_live|sk_test|whsec_|api_key'` before any bulk commit.

---

## By category (top-level)

| Category | Modified (approx) | Untracked | Notes |
|----------|-------------------|-----------|-------|
| **docs/** | 485 | 1 | Era logs, ABSOLUTE_FINAL_*, audits; `docs/allreport30may.md` untracked |
| **scripts/** | 33 | 1 | `scripts/debug-today-page-prod.ts` |
| **lib/marketing/** | 23 | 0 | Blog, pricing, claims copy |
| **components/marketing/** | 19 | 3 | `home-landing.tsx`, `site-header-client.tsx`, `os-kitchen-logo.tsx` |
| **lib/ops/** | 17 | 0 | Ops script string touch-ups |
| **components/dashboard/** | 17 | 0 | Dashboard chrome strings |
| **tests/unit/** | 6 | 0 | Rebrand assertion updates (workspace scope tests committed cycle 90) |
| **lib/storefront/** | 9 | 0 | Storefront strings |
| **app/** | 6+ | 1 | `app/dashboard/not-found.tsx` untracked |
| **lib/** (root) | 8 | 2 | `resolve-public-env.ts`, `lib/ui/` untracked |
| **config/** | 3 | 0 | `package.json` name → `os-kitchen`; `next.config.ts`, `tailwind.config.ts` |
| **root docs** | 4 | 0 | README, CHANGELOG, CONTRIBUTING, SECURITY |
| **.github/** | 1 | 0 | `e2e-remote-smoke.yml` |
| **artifacts/** | 0 | 1 | `deploy-readiness.md` — regenerate or commit with deploy PR |
| **.deploy-state/** | 0 | 1 | `predeploy-ready.json` — **do not commit** (local deploy cache) |

---

## Untracked files (10)

| Path | Verdict |
|------|---------|
| `.deploy-state/predeploy-ready.json` | **Ignore / gitignore** |
| `app/dashboard/not-found.tsx` | Commit with dashboard PR |
| `artifacts/deploy-readiness.md` | Commit with deploy PR or CI artifact |
| `components/marketing/home-landing.tsx` | Commit with marketing PR |
| `components/marketing/site-header-client.tsx` | Commit with marketing PR |
| `components/ui/os-kitchen-logo.tsx` | Commit with branding PR — **blocks dashboard-shell tests** (missing React import) |
| `docs/allreport30may.md` | Commit with docs PR |
| `lib/supabase/resolve-public-env.ts` | Commit with lib PR |
| `lib/ui/` | Review — shared UI tokens for rebrand |
| `scripts/debug-today-page-prod.ts` | **Review** — debug script; likely exclude from rebrand PR |

---

## Already on main (cycles 64–90 — do not duplicate)

| Area | Examples |
|------|----------|
| Pilot E2E | `e2e/cross-tenant-isolation.spec.ts`, `e2e/kds-staging.spec.ts`, `e2e/pos-*` |
| Infra | `lib/rate-limit.ts`, `vitest.config.ts`, `lib/scope/workspace-resource-scope.ts` (cycle 90) |
| Docs RFC | `docs/scim-provisioning-rfc.md`, `docs/pen-test-plan.md`, `docs/domain-map.md` |
| Reports | `artifacts/final-execution-report.json` v3 (cycle 89) |

---

## Suggested commit batches (future cycles)

| Batch | Files (approx) | Message sketch |
|-------|----------------|----------------|
| 1 | ~15 | `feat: OS Kitchen brand — constants, logo, home landing, header split` |
| 2 | ~74 components + 32 lib | `refactor: marketing and dashboard chrome for OS Kitchen rebrand` |
| 3 | ~152 app | `chore: app metadata and titles for OS Kitchen rebrand` |
| 4 | ~36 scripts + 25 services | `chore: script and service string alignment` |
| 5 | ~485 docs | `docs: era session and audit doc string alignment` |
| 6 | ~6 tests + config | `test: unit test updates for rebrand` |

**Pre-merge gate for batch 1:** Verify pricing against `config/marketing/claims-registry.json` (constitution rule 6).

---

## Blockers unchanged

| Metric | Value |
|--------|-------|
| Vault | **0/11** |
| P0 | `awaiting_ops_credentials` |
| Score | **85** (agent checklist 26/26; vault blocks 100) |
| Vitest | ~**30 failed** / 4993 (down after cycle 90 workspace scope fix; dashboard-shell + cert-live remain) |
| GO | **NO-GO** |

This audit catalogs working-tree drift only — it does **not** change pilot score or vault state.

---

## Next recommendation

1. **Human:** Populate ops vault (11/11) per `docs/ops-vault-matrix.md`
2. **Engineering:** Rebrand batch 1 — fix `os-kitchen-logo.tsx` React import + land ~15 brand files
3. **Agent:** Do **not** claim `ready:true` until vaultReady + p0ProofPassed
