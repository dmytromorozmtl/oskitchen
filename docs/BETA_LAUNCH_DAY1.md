# Beta Launch — Day 1 Schedule (завтра)

Печатная версия плана. Автоматически: `npm run beta:day1`

## Env setup (перед всеми шагами)

```bash
cp .env.beta.local.example .env.beta.local
# Заполните значения в .env.beta.local (не коммитить)
npm run beta:env-check -- --step=0
npm run beta:day1-complete   # Step 0 программы (Playwright + launch report)
```

| # | Время | Кто | Gate |
|---|-------|-----|------|
| 1 | 15 min | DBA / You | `DBA_SIGNOFF.json` |
| 2 | 30–60 min | DevOps | `check:backfill` all OK |
| 3 | 20 min | DevOps | `verify:staging-env --strict` |
| 4 | 45 min | QA | 0 FAIL в launch report |
| 5 | 20 min | Product | `PRODUCT_SIGNOFF.json` |
| 6 | 1–2 h | Founder | 3× green cohort |

## Step 1 — DBA (15 min)

```bash
npm run dba:migration-review
# Email: docs/templates/DBA_APPROVAL_REQUEST.md
npm run dba:record-signoff -- --by="DBA Name" --ticket=INFRA-123
npm run beta:launch -- --step=1
```

## Step 2 — DevOps (30–60 min)

На staging host с `DATABASE_URL`:

```bash
npm run staging:remediation-all
npm run check:backfill
npm run beta:launch -- --step=2
```

## Step 3 — Vercel env (20 min)

```bash
npm run vercel:staging-checklist
npm run setup:impersonation-totp
# Paste into Vercel → redeploy staging
npm run verify:staging-env -- --strict
```

## Step 4 — QA (45 min)

```bash
export SMOKE_BASE_URL="https://staging.yourdomain.com"
export SMOKE_PUBLIC_API_KEY="kos_..."
export SMOKE_DELIVERY_CONNECTION_ID_OTHER="uuid"
E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... npx playwright test e2e/auth.setup.ts --project=setup
eval "$(npm run smoke:session-cookie --silent)"
npm run beta:qa-bundle -- --with-playwright
```

## Step 5 — Product (20 min)

```bash
export BETA_OWNER_EMAIL="owner@pilot.com"
npm run verify:staff-scope
npm run verify:staff-parity -- --owner-email=$BETA_OWNER_EMAIL
# UI: docs/MANUAL_STAFF_VISIBILITY_CHECKLIST.md
npm run beta:record-product-signoff -- --by="Product Lead" --owner-email=$BETA_OWNER_EMAIL
```

## Step 6 — Founder (1–2 h)

```bash
npm run beta:cohort -- --emails=chef1@,chef2@,chef3@
```

## Final gate

```bash
export BETA_COHORT_EMAILS="chef1@,chef2@,chef3@"
export BETA_OWNER_EMAIL="chef1@"
export E2E_STAFF_EMAIL="staff@..."
export E2E_STAFF_PASSWORD="..."
npm run beta:launch -- --with-playwright --json --html
```

Open `docs/artifacts/BETA_LAUNCH_REPORT.html` for sign-off meeting.
