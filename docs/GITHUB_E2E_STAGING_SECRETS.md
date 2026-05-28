# GitHub secrets — E2E Staging workflow

Workflow: `.github/workflows/e2e-staging.yml` (daily 06:00 UTC + manual).

**Policy:** `era12-e2e-staging-secrets-align-v1` (`lib/ci/e2e-staging-secrets-era12-policy.ts`) — Playwright and `e2e/auth.setup.ts` use **`E2E_LOGIN_PASSWORD`**; workflows map GitHub secrets to that env name. Legacy secret name **`E2E_PASSWORD`** is accepted as an alias in CI only.

## Required repository secrets

| Secret | Example | Purpose |
|--------|---------|---------|
| `E2E_STAGING_BASE_URL` | `https://staging.kitchenos.app` | Playwright `PLAYWRIGHT_BASE_URL` |
| `E2E_LOGIN_EMAIL` | `workspace.moroz@gmail.com` | Dashboard login |
| `E2E_LOGIN_PASSWORD` | *(app password)* | Dashboard login (canonical) |

**Legacy alias:** `E2E_PASSWORD` — if your repo still uses this secret name, workflows accept it and map to `E2E_LOGIN_PASSWORD` in the job env. Prefer renaming to `E2E_LOGIN_PASSWORD` for parity with POS/KDS staging workflows.

## Optional repository variable

| Variable | Default | Purpose |
|----------|---------|---------|
| `E2E_STOREFRONT_SLUG` | `hello` | Runs `e2e/storefront.spec.ts` |

## Setup steps

1. GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** for each row above (use `E2E_LOGIN_PASSWORD`, not `E2E_PASSWORD`, for new repos)
3. **Variables** tab → add `E2E_STOREFRONT_SLUG` if not `hello`
4. **Actions** → **E2E Staging** → **Run workflow** → confirm green (job skipped entirely when secrets missing — not a silent pass)

## Local parity

```bash
export PLAYWRIGHT_BASE_URL=https://your-staging-url
export E2E_LOGIN_EMAIL=you@example.com
export E2E_LOGIN_PASSWORD=secret
npx playwright test tests/e2e/platform-access-denial.spec.ts e2e/smoke.spec.ts --project=chromium
```

## Staging smoke (no browser)

```bash
npm run smoke:staging
```

Uses `.env.staging` — never commit passwords.

## CI certification

- `npm run test:ci:e2e-staging-secrets-era12`
- `npm run test:ci:e2e-staging-secrets-era12:cert` (wired in `test:ci:governance-bundles:partition-platform`)
