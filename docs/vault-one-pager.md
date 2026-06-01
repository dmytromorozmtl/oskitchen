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

| Metric | Value | Evidence |
|--------|-------|----------|
| Secrets configured | **0/11** | `artifacts/vault-readiness-report.json` |
| `vaultReady` | **false** | same |
| `p0ProofStatus` | `awaiting_ops_credentials` | same |
| Pilot GO/NO-GO | **NO-GO** | `artifacts/pilot-gono-go-summary.json` |
| Pilot executable score | **26/100** | `docs/fullreport1june.md` §1 |
| LIVE integrations | **0** | `lib/integrations/integration-registry.ts` |
| Paid pilots | **0** | — |
| Git remote configured | **No** | `git remote -v` empty — see [`git-remote-setup.md`](./git-remote-setup.md) |
| Duplicate asset cleanup | **Done (cycle 2, session 29)** | Removed cron `* 2` dirs, playwright-report copies, `.vercel/project 2.json` |
| Auth0 enterprise SSO | **Done** | Commit `2647e1f1` — SAML IdP via Supabase; see [`auth0-supabase-saml-setup.md`](./auth0-supabase-saml-setup.md) |

## Human gate (VP Operations)

This step **cannot be completed by engineering alone**. VP Ops must:

1. Assign owners in [`ops-vault-matrix.md`](./ops-vault-matrix.md) (DevOps ×6, Security ×5, Integration ×1).
2. Store all 11 values in company secrets manager (1Password / Vault) — **never commit to git**.
3. Mirror to GitHub Actions secrets + Vercel staging env (see matrix per-variable).
4. Run verification:
   ```bash
   npm run ops:validate-p0-vault-env
   npm run check-vault-readiness -- --write
   ```
5. Sign [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md).

**Pass criteria:** `presentCount: 11`, `vaultReady: true` in `artifacts/vault-readiness-report.json`.

Track progress: `artifacts/30-action-tracker.json` → `1-vault-secrets` (docs done; credentials pending human).

## 30-action executor status (2026-06-01, cyclic session — cycle 1/30)

| Bucket | Done | Blocked on vault |
|--------|------|------------------|
| P0 docs (1–4) | ✅ | — |
| P0 proof (5–7) | — | `ops:run-p0-staging-proof`, SSO smoke, live Woo/Shopify |
| P1 (8–19) | ✅ 12/12 | — |
| P2 (20–27) | ✅ 8/8 | — |
| P3 (28–30) | ✅ 3/3 | — |
| **Agent total** | **27/30** | **3/30** need `presentCount: 11` |

**Pre-flight (cycle 1 diagnostic):** TS 0 errors, build green, tests green, vault **0/11**, git remote unset, Auth0 SAML landed (`2647e1f1`), repo **815** commits local-only.

After vault PASS, run in order (tracker actions 5→7):

```bash
npm run ops:run-p0-staging-proof-execution -- --execute --write   # action 5
npm run smoke:enterprise-sso-idp-staging -- --execute            # action 6
npm run smoke:woo-live && npm run smoke:shopify-live             # action 7
```

**Do not** set `artifacts/final-execution-report.json` → `ready: true` until actions 5–7 PASS — see [`investor-narrative-hold.md`](./investor-narrative-hold.md).

## Deadline

**Today.** Every day without vault = one day delayed to first revenue.
