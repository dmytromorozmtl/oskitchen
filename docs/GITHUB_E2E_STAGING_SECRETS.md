# GitHub secrets — E2E Staging workflow

Workflow: `.github/workflows/e2e-staging.yml` (daily 06:00 UTC + manual).

## Required repository secrets

| Secret | Example | Purpose |
|--------|---------|---------|
| `E2E_STAGING_BASE_URL` | `https://staging.kitchenos.app` | Playwright `PLAYWRIGHT_BASE_URL` |
| `E2E_LOGIN_EMAIL` | `workspace.moroz@gmail.com` | Dashboard login |
| `E2E_PASSWORD` | *(app password)* | Dashboard login |

## Optional repository variable

| Variable | Default | Purpose |
|----------|---------|---------|
| `E2E_STOREFRONT_SLUG` | `hello` | Runs `e2e/storefront.spec.ts` |

## Setup steps

1. GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** for each row above
3. **Variables** tab → add `E2E_STOREFRONT_SLUG` if not `hello`
4. **Actions** → **E2E Staging** → **Run workflow** → confirm green

## Local parity

```bash
export PLAYWRIGHT_BASE_URL=https://your-staging-url
export E2E_LOGIN_EMAIL=you@example.com
export E2E_PASSWORD=secret
npx playwright test tests/e2e/platform-access-denial.spec.ts e2e/smoke.spec.ts --project=chromium
```

## Staging smoke (no browser)

```bash
npm run smoke:staging
```

Uses `.env.staging` — never commit passwords.
