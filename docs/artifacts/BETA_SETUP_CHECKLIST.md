# KitchenOS Beta — Setup Checklist

Readiness: **22/100** (launch 0, env 12, program 10)

| Phase | Status | Command |
|-------|--------|---------|
| Create .env.beta.local from template | DONE | `cp .env.beta.local.example .env.beta.local` |
| Fill Step 0 smoke + E2E credentials | TODO | `npm run beta:env-check -- --step=0` |
| | _Missing: E2E_LOGIN_PASSWORD_ | |
| Staging: remediation + backfill + verify --strict | TODO | `npm run beta:staging-prep` |
| | _Run on staging host with DATABASE_URL_ | |
| DBA migration approval recorded | TODO | `npm run dba:record-signoff -- --by="DBA" --ticket=INFRA-123` |
| Day 1 launch gates green (HTML report) | TODO | `npm run beta:day1-complete` |
| Cohort emails configured (1–3 kitchens) | DONE | `npm run beta:cohort -- --emails=owner1@,owner2@` |
| Kitchens marked LIVE in registry | TODO | `npm run beta:go-live -- --emails=...` |
| Support channel + Slack webhook | DONE | `npm run beta:support-setup` |
| Week 1 daily ops running | TODO | `npm run beta:daily-ops` |

## Env keys reference (Step 0)

- `SMOKE_BASE_URL` (required) — Staging app URL
- `SMOKE_PUBLIC_API_KEY` (required) — Public API key for smoke
- `SMOKE_DELIVERY_CONNECTION_ID_OTHER` (required) — Tenant B UUID for IDOR test
- `E2E_LOGIN_EMAIL` (required) — Owner login for Playwright
- `E2E_LOGIN_PASSWORD` (required) — Owner password
- `DATABASE_URL` (required) — Staging DB for backfill/migrate checks
- `E2E_STAFF_EMAIL` — Staff E2E (step 5 in launch)
- `E2E_STAFF_PASSWORD` — Staff password
- `SMOKE_DELIVERY_CONNECTION_ID` — Own tenant connection
- `CRON_SECRET` — Experimental cron smoke