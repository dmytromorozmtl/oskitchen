# Uncommitted Changes Audit

**Generated:** 2026-05-30 (Cycle 63)  
**Base commit:** `6914a7bb` — docs: staging environment setup guide  
**Total uncommitted:** **978** files (969 modified, 9 untracked)  
**Diff size:** +2,722 / −2,284 lines across modified files; **641 files** have ≤3 line changes (mechanical)

---

## Executive summary

The working tree contains a **large pre-Vercel deployment batch** (`fd0d318f chore: pre-Vercel deployment preparation` is the prior committed anchor; most changes remain unstaged). Changes cluster into:

1. **Brand rebrand** — `KitchenOS` → `OS Kitchen`, accent colors, pricing copy (`lib/constants.ts`)
2. **Marketing shell refactor** — new `HomeLanding`, server/client header split, logo component
3. **Mechanical metadata sweep** — 529 docs + 151 app pages + 130 lib files with tiny string replacements
4. **Deploy readiness artifacts** — untracked `.deploy-state/`, `artifacts/deploy-readiness.md`

**Recommendation:** Do **not** blind-commit all 978 files in one cycle. Split into reviewable PRs: (A) branding constants + marketing shell, (B) dashboard/app metadata, (C) docs sweep, (D) scripts/services touch-ups.

**Suspicious / review first:** None contain `.env`, credentials, or API keys. `app/forgot-password/page.tsx` is a normal page edit (not a secret file).

---

## By category

| Category | Modified | Untracked | Notes |
|----------|----------|-----------|-------|
| **docs/** | 529 | 1 | Era session logs, ABSOLUTE_FINAL_*, audit reports; `docs/allreport30may.md` untracked |
| **app/** | 151 | 1 | 67 under `app/dashboard/`; home page refactor; `app/dashboard/not-found.tsx` untracked |
| **lib/** | 130 | 2 | `constants.ts` brand/pricing; `lib/supabase/resolve-public-env.ts` untracked; `lib/ui/` untracked |
| **components/** | 68 | 3 | Marketing shell, dashboard strips; `home-landing.tsx`, `site-header-client.tsx`, `os-kitchen-logo.tsx` untracked |
| **scripts/** | 36 | 0 | Mostly comment/string touch-ups tied to rebrand |
| **services/** | 25 | 0 | Small consistency edits |
| **tests/** | 10 | 0 | Unit test string/assertion updates |
| **actions/** | 4 | 0 | Minor edits |
| **config/** | 3 | 0 | `package.json` name → `os-kitchen`; `next.config.ts`, `tailwind.config.ts` |
| **root docs** | 4 | 0 | README, CHANGELOG, CONTRIBUTING, SECURITY |
| **.github/** | 1 | 0 | `e2e-remote-smoke.yml` |
| **public/** | 3 | 0 | Asset/metadata |
| **e2e/** | 1 | 0 | Staging spec touch-up |
| **marketing/** | 1 | 0 | Top-level marketing file |
| **artifacts/** | 0 | 1 | `deploy-readiness.md` untracked |
| **.deploy-state/** | 0 | 1 | `predeploy-ready.json` — local deploy cache, **do not commit** |

---

## Untracked files (9)

| Path | Verdict |
|------|---------|
| `.deploy-state/predeploy-ready.json` | **Ignore / gitignore** — local deploy state (buildId, node version) |
| `app/dashboard/not-found.tsx` | **Commit with dashboard PR** — new not-found surface |
| `artifacts/deploy-readiness.md` | **Commit with deploy PR** or regenerate in CI |
| `components/marketing/home-landing.tsx` | **Commit with marketing PR** — core home refactor |
| `components/marketing/site-header-client.tsx` | **Commit with marketing PR** — client half of header split |
| `components/ui/os-kitchen-logo.tsx` | **Commit with branding PR** |
| `docs/allreport30may.md` | **Commit with docs PR** — audit report |
| `lib/supabase/resolve-public-env.ts` | **Commit with lib PR** — env resolution helper |
| `lib/ui/` | **Review contents** — likely shared UI tokens/helpers for rebrand |

---

## Thematic breakdown

### A. Brand rebrand (high impact — review carefully)

**Anchor files:**
- `lib/constants.ts` — `APP_NAME`, `BRAND_ACCENT*`, pricing ($29→$79 Starter), descriptions
- `package.json` — `"name": "os-kitchen"`
- `components/marketing/site-header.tsx` → server wrapper + `site-header-client.tsx`
- `app/page.tsx` → delegates to `HomeLanding`

**Risk:** Pricing and product copy changes affect sales/GTM. Verify against `config/marketing/claims-registry.json` before merge (constitution rule 6 — no forbidden claims).

### B. Dashboard & product surfaces (151 app files)

- **67** `app/dashboard/**` pages — likely metadata/title string updates
- Storefront `app/s/[storeSlug]/**`, blog, markets, legal, trust pages
- Pattern: import/metadata/`APP_NAME` substitution, not logic rewrites

### C. Documentation sweep (529 files)

- 84+ files match `ABSOLUTE_FINAL_*` or `era*` naming
- Session execution logs and audit markdown — low runtime risk
- **Do not** treat doc volume as product readiness signal

### D. Scripts & services (61 files)

- Audit scripts, beta launch scripts, env check scripts — comment/string alignment
- No new npm scripts detected in `package.json` diff (name only)

### E. Tests (10 files)

- Unit tests with string/assertion updates for rebrand or scope helpers
- Run targeted suites before bulk commit: `npm test -- --testPathPattern="order-hub|support-ticket|workspace-resource"`

---

## Suspicious change scan

| Check | Result |
|-------|--------|
| `.env*` files | **None** |
| `*credential*`, `*secret*`, `*password*` paths (excluding page routes) | **None** |
| Private keys / tokens in diff | **Not scanned in depth** — run `git diff \| grep -iE 'sk_live\|sk_test\|whsec_\|api_key'` before commit |
| `.deploy-state/` | Local only — exclude from git |

---

## Suggested commit batches (future cycles)

| Batch | Files (approx) | Message sketch |
|-------|----------------|----------------|
| 1 | ~15 | `feat: OS Kitchen brand — constants, logo, home landing, header split` |
| 2 | ~68 components + 30 lib | `refactor: marketing and dashboard chrome for OS Kitchen rebrand` |
| 3 | ~151 app | `chore: app metadata and titles for OS Kitchen rebrand` |
| 4 | ~36 scripts + 25 services | `chore: script and service string alignment for OS Kitchen` |
| 5 | ~529 docs | `docs: era session and audit doc string alignment` |
| 6 | ~10 tests + config | `test: unit test updates for rebrand and scope helpers` |

---

## Blockers unchanged

This audit **does not** change execution score or vault state:

- Vault: **0/11** — human gate per `docs/staging-environment-setup.md`
- P0: **SKIPPED** — `awaiting_ops_credentials`
- GO: **NO-GO**
- Score: **24**

---

## Next cycle recommendation

1. **VP Ops (human):** Configure Phase 1 GitHub secrets
2. **Agent cycle 64:** Branch 2 — `integration-health-support-admin` vault-phased headline (planned since cycle 61)
3. **Agent cycle 65+:** Execute suggested commit batch 1 (marketing rebrand core) after claims-registry review
