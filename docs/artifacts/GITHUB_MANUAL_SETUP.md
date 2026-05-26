# GitHub manual setup (when `gh` CLI unavailable)

## Repository variables

**Settings → Secrets and variables → Actions → Variables**

| Name | Example |
|------|---------|
| `PLAYWRIGHT_BASE_URL` | `https://staging.yourdomain.com` |
| `E2E_STOREFRONT_SLUG` | `your-published-slug` |
| `NEXT_PUBLIC_APP_URL` | `https://app.yourdomain.com` |
| `STOREFRONT_CHECK_STRIPE` | `0` (Option A) or `1` (Option B) |

## Repository secrets

| Name | Notes |
|------|-------|
| `DATABASE_URL` | For staging gate env check |
| `DIRECT_URL` | |
| `STOREFRONT_MIDDLEWARE_SECRET` | |
| `CRON_SECRET` | |
| `AUTH_SECRET` | |
| `E2E_LOGIN_EMAIL` | Optional builder E2E |
| `E2E_LOGIN_PASSWORD` | |

## Branch protection (`main`)

**Settings → Branches → Add rule**

- Require pull request before merging  
- Required status checks:
  - `quality` (CI)
  - `gate` (Storefront staging gate)
  - `storefront-e2e` (Playwright storefront — when `PLAYWRIGHT_BASE_URL` set)
  - `Lighthouse storefront` (optional)

## Install `gh` later

```bash
brew install gh
gh auth login
npm run github:storefront-gates:ci
```
