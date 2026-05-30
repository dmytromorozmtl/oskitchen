# Uncommitted Changes Audit

**Generated:** 2026-05-31 (Cycle 85)  
**Base commit:** `2511d840` — docs: soft delete standard  
**Total uncommitted:** **977** files (968 modified, 9 untracked)  
**Diff size:** +2,721 / −2,283 lines across modified files  
**Prior audit:** Cycle 63 (`6914a7bb` base) — counts unchanged; pilot cycles 64–84 landed separately on `main`

---

## Executive summary

The working tree still holds a **large pre-Vercel / OS Kitchen rebrand batch** that predates execution cycles 64–84. **24 pilot-readiness commits** (webhook E2E, KDS, POS, SCIM RFC, rate limiting, Prisma audit, domain map, soft delete, etc.) are on `main`; this batch is **orthogonal** and must not be blind-committed.

Changes cluster into:

1. **Brand rebrand** — `KitchenOS` → `OS Kitchen`, accent colors, pricing copy (`lib/constants.ts`)
2. **Marketing shell refactor** — `HomeLanding`, server/client header split, `os-kitchen-logo.tsx`
3. **Mechanical metadata sweep** — 529 docs + 152 app pages + 132 lib files (mostly ≤3 line string swaps)
4. **Deploy readiness artifacts** — `.deploy-state/predeploy-ready.json`, `artifacts/deploy-readiness.md` (untracked)

**Recommendation:** Split into reviewable PRs (see batch table below). **Do not** merge with pilot-readiness work in one commit.

**Suspicious scan:** No `.env`, credentials, or private keys in paths. Run `git diff | grep -iE 'sk_live|sk_test|whsec_|api_key'` before any bulk commit.

---

## By category

| Category | Modified | Untracked | Notes |
|----------|----------|-----------|-------|
| **docs/** | 529 | 1 | Era logs, ABSOLUTE_FINAL_*, audits; `docs/allreport30may.md` untracked |
| **app/** | 152 | 1 | 67+ under `app/dashboard/`; `app/dashboard/not-found.tsx` untracked |
| **lib/** | 132 | 2 | `constants.ts` brand/pricing; `lib/supabase/resolve-public-env.ts`, `lib/ui/` untracked |
| **components/** | 71 | 3 | Marketing shell; `home-landing.tsx`, `site-header-client.tsx`, `os-kitchen-logo.tsx` |
| **scripts/** | 36 | 0 | Comment/string touch-ups |
| **services/** | 25 | 0 | Consistency edits |
| **tests/** | 10 | 0 | Unit test assertion updates |
| **actions/** | 4 | 0 | Minor edits |
| **config/** | 3 | 0 | `package.json` name → `os-kitchen`; `next.config.ts`, `tailwind.config.ts` |
| **root docs** | 4 | 0 | README, CHANGELOG, CONTRIBUTING, SECURITY |
| **.github/** | 1 | 0 | `e2e-remote-smoke.yml` |
| **public/** | 3 | 0 | Asset/metadata |
| **e2e/** | 1 | 0 | Staging spec touch-up |
| **marketing/** | 1 | 0 | Top-level marketing file |
| **artifacts/** | 0 | 1 | `deploy-readiness.md` — regenerate or commit with deploy PR |
| **.deploy-state/** | 0 | 1 | `predeploy-ready.json` — **do not commit** (local deploy cache) |

---

## Untracked files (9)

| Path | Verdict |
|------|---------|
| `.deploy-state/predeploy-ready.json` | **Ignore / gitignore** |
| `app/dashboard/not-found.tsx` | Commit with dashboard PR |
| `artifacts/deploy-readiness.md` | Commit with deploy PR or CI artifact |
| `components/marketing/home-landing.tsx` | Commit with marketing PR |
| `components/marketing/site-header-client.tsx` | Commit with marketing PR |
| `components/ui/os-kitchen-logo.tsx` | Commit with branding PR |
| `docs/allreport30may.md` | Commit with docs PR |
| `lib/supabase/resolve-public-env.ts` | Commit with lib PR |
| `lib/ui/` | Review — shared UI tokens for rebrand |

---

## Already on main (cycles 64–84 — do not duplicate)

These paths are **committed** and independent of the rebrand batch:

| Area | Examples |
|------|----------|
| Pilot E2E | `e2e/cross-tenant-isolation.spec.ts`, `e2e/kds-staging.spec.ts`, `e2e/pos-*` |
| Docs RFC | `docs/scim-provisioning-rfc.md`, `docs/pen-test-plan.md`, `docs/domain-map.md`, `docs/soft-delete-standard.md` |
| Infra | `lib/rate-limit.ts`, `scripts/audit-prisma-performance.ts`, `artifacts/prisma-performance-audit.json` |
| Product | `app/dashboard/floor-plans/`, `services/kds-websocket.ts` |

Steps 24–25 (`docs/vercel-env-vars.md`, `docs/staging-environment-setup.md`) were committed in earlier deploy prep — **no action needed**.

---

## Suggested commit batches (future cycles)

| Batch | Files (approx) | Message sketch |
|-------|----------------|----------------|
| 1 | ~15 | `feat: OS Kitchen brand — constants, logo, home landing, header split` |
| 2 | ~74 components + 32 lib | `refactor: marketing and dashboard chrome for OS Kitchen rebrand` |
| 3 | ~152 app | `chore: app metadata and titles for OS Kitchen rebrand` |
| 4 | ~36 scripts + 25 services | `chore: script and service string alignment` |
| 5 | ~529 docs | `docs: era session and audit doc string alignment` |
| 6 | ~10 tests + config | `test: unit test updates for rebrand` |

**Pre-merge gate for batch 1:** Verify pricing against `config/marketing/claims-registry.json` (constitution rule 6).

---

## Blockers unchanged

| Metric | Value |
|--------|-------|
| Vault | **0/11** |
| P0 | `awaiting_ops_credentials` |
| Score | **24** |
| GO | **NO-GO** |

This audit catalogs working-tree drift only — it does **not** change pilot score or vault state.

---

## Next recommendation

1. **Human:** Populate ops vault (11/11) per `docs/ops-vault-matrix.md`
2. **Agent:** Step 27 only when all 26 decision-tree items verified complete
3. **Engineering:** Execute rebrand batch 1 after claims-registry review (separate from pilot cycles)
