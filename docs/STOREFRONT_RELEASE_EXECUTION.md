# Storefront release — execution guide

Single entry point for **today → week 4**. All commands are in-repo; secrets stay in 1Password / Vercel / GitHub.

---

## Quick reference

| Phase | Command | Output |
|-------|---------|--------|
| **2-hour block** | `npm run storefront:two-hour-release` | Env → manifest → preflight → optional smoke |
| **All automated** | `npm run storefront:close-release` | Runs preflight + optional smoke |
| **Staging QA** | `npm run storefront:staging-qa` | Needs `.env.storefront.staging.local` |
| **Vercel checklist** | `npm run storefront:vercel-manifest` | Regenerates upload matrix |
| **Closure tracker** | — | [`docs/artifacts/STOREFRONT_RELEASE_CLOSURE_STATUS.md`](artifacts/STOREFRONT_RELEASE_CLOSURE_STATUS.md) |
| **A2 Env** | `npm run storefront:env:sync-local` → `storefront:secrets:generate` → `storefront:release-preflight` | `docs/artifacts/storefront-preflight-latest.md` |
| **A2 Env only** | `npm run check-env:storefront:report` | `docs/artifacts/storefront-env-report-latest.md` |
| **A3 Stripe** | Edit `docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md` | Sign-off |
| **A1 QA** | `npm run storefront:qa-artifact` | `docs/artifacts/storefront-qa-release-YYYY-MM-DD.md` |
| **GitHub** | `npm run github:storefront-gates` | Variables + protection |
| **Post-deploy** | `npm run storefront:post-deploy` | `docs/artifacts/storefront-smoke-production-latest.md` |
| **Week 1** | `npm run storefront:week1-verify` | Console + env warnings |

---

## Today–tomorrow (release)

### 1. A2 — Vercel prod secrets

1. Copy [`.env.storefront.production.example`](../.env.storefront.production.example) → `.env.production.local`
2. Fill from [secrets matrix](STOREFRONT_VERCEL_SECRETS_MATRIX.md)
3. Run:

```bash
set -a && source .env.production.local && set +a
npm run storefront:release-preflight
```

4. Paste same keys into **Vercel → Production** (never commit `.env.production.local`)

### 2. A3 — Stripe decision

1. Open [`docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md`](artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md)
2. Check **Option A** (pay-later) or **Option B** (Stripe)
3. Match **Ordering** admin tab
4. Product + Engineering sign

### 3. A1 — Staging smoke + QA artifact

```bash
export STOREFRONT_SMOKE_BASE_URL=https://<staging-host>
export STOREFRONT_SMOKE_SLUG=<published-slug>
export STOREFRONT_STRIPE_OPTION=A   # or B
npm run storefront:qa-artifact
```

Complete **manual** rows in generated artifact (checkout, promo, blackout, honeypot).

### 4. GitHub gates

```bash
npm run github:storefront-gates
# or CI:
GH_NONINTERACTIVE=1 \
  GITHUB_PLAYWRIGHT_BASE_URL=https://<staging> \
  GITHUB_E2E_STOREFRONT_SLUG=<slug> \
  GITHUB_APPLY_BRANCH_PROTECTION=1 \
  npm run github:storefront-gates:ci
```

Required checks: `quality`, `gate`, `storefront-e2e` (when URL set).

### 5. A4 — Deploy

- Prod `vercel.json`: **6 crons** (`jq '.crons|length' vercel.json`)
- Staging project only: `npm run vercel:crons:staging` before staging deploy
- After prod deploy:

```bash
export STOREFRONT_SMOKE_BASE_URL="https://your-prod.vercel.app"
export STOREFRONT_SMOKE_SLUG=<slug>
npm run storefront:post-deploy
```

Detail: [`docs/runbooks/STOREFRONT_RELEASE_DAY_RUNBOOK.md`](runbooks/STOREFRONT_RELEASE_DAY_RUNBOOK.md)

---

## Week 1

[`docs/STOREFRONT_WEEK1_HARDENING.md`](STOREFRONT_WEEK1_HARDENING.md)

```bash
npm run storefront:week1-verify
```

---

## Weeks 2–4

[`docs/STOREFRONT_PHASE_C_ROADMAP.md`](STOREFRONT_PHASE_C_ROADMAP.md)

---

## Artifact index

| File | Purpose |
|------|---------|
| `docs/artifacts/storefront-preflight-latest.md` | Pre-deploy summary |
| `docs/artifacts/storefront-env-report-latest.md` | Env matrix |
| `docs/artifacts/storefront-qa-release-*.md` | Release QA sign-off |
| `docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md` | A3 decision |
| `docs/artifacts/storefront-smoke-production-latest.md` | Post-deploy HTTP |
