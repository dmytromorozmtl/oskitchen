# 🚨 BLOCKER: Ops Vault — 11 Secrets Required

## Why This Matters
Every P0 smoke, every live integration test, every staging proof is **blocked** until these 11 environment variables are configured. Without them:
- Zero live integrations can be certified
- Zero staging proofs can run
- Zero pilots can launch
- Engineering velocity: 0 (all work blocked since May 28)

## What We Need
| # | Variable | Where to Get It | Who Has It |
|---|----------|-----------------|------------|
| 1 | DATABASE_URL | Supabase Dashboard → Settings → Database → Connection string (pooler) | DevOps |
| 2 | ENCRYPTION_KEY | Generate: `openssl rand -hex 32` | DevOps |
| 3 | CHANNEL_SMOKE_OWNER_EMAIL | Test email for WooCommerce/Shopify test stores | Integration |
| 4 | E2E_STAGING_BASE_URL | Vercel Preview URL after deploy | DevOps |
| 5 | E2E_LOGIN_EMAIL | Test user email on staging | QA |
| 6 | E2E_LOGIN_PASSWORD | Test user password on staging | QA |
| 7 | SSO_STAGING_WORKSPACE_ID | Okta/Auth0 dev tenant | Security |
| 8 | SSO_STAGING_IDP_VENDOR | "okta" or "auth0" | Security |
| 9 | SSO_STAGING_ALLOWED_DOMAIN | Test email domain | Security |
| 10 | SSO_STAGING_TEST_EMAIL | Test SSO user email | Security |
| 11 | SSO_STAGING_SUPABASE_PROVIDER_REF | Supabase Auth → SSO settings | Security |

## How Long
- DevOps: 1-2 hours (items 1-6)
- Security: 1-2 hours (items 7-11)
- **Total: 2-4 hours**

## What Happens After
```bash
npm run check-vault-readiness -- --write  # → vaultReady: true
npm run ops:run-p0-staging-proof-execution -- --execute --write  # → P0 PASS
npm run smoke:woo-live && npm run smoke:shopify-live  # → LIVE integrations
npm run smoke:enterprise-sso-idp-staging  # → SSO proven
npm run smoke:pilot-gono-go  # → GO decision
```

## Current Blockers Without Vault
- Pilot executable score: 85/100 (stuck since May 28)
- 0/11 secrets configured
- 0 LIVE integrations
- 0 staging proofs
- 0 paid pilots

## Deadline
**Today.** Every day without vault = one day delayed to first revenue.
