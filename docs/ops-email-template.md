# Email template — P0 ops vault secrets (VP Operations)

**To:** VP Operations, DevOps lead  
**Subject:** ACTION REQUIRED — 11 staging secrets blocking paid pilot (KitchenOS P0)

---

Hi team,

KitchenOS is **blocked on paid pilot kickoff** until we configure **11 staging secrets** in the ops vault and GitHub Actions. All P0 child smokes currently report `awaiting_ops_credentials` — this is honest SKIPPED state, not a product defect.

**Why this matters**

- Without these secrets we cannot prove SSO IdP login, GitHub staging workflows, or live Woo/Shopify channel ingest on staging.
- `pilot-gono-go-summary.json` remains **NO-GO** until P0 PASS.
- Governance score (100/100) does **not** substitute for staging proof.

**What we need (11 variables)**

| Phase | Variables | Owner |
|-------|-----------|-------|
| Staging login | `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD` | DevOps |
| SSO IdP | `SSO_STAGING_WORKSPACE_ID`, `SSO_STAGING_IDP_VENDOR`, `SSO_STAGING_ALLOWED_DOMAIN`, `SSO_STAGING_TEST_EMAIL`, `SSO_STAGING_SUPABASE_PROVIDER_REF` | Security / CTO |
| Channel live | `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL` | DevOps + Integration |

**Canonical docs**

- Matrix: [`docs/ops-vault-matrix.md`](./ops-vault-matrix.md)
- Checklist: [`docs/era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)
- Playbook: [`docs/p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md)

**Verification (after secrets are set)**

```bash
npm run check-vault-readiness
npm run smoke:p0-staging-proof-unblock
npm run smoke:pilot-gono-go
```

**Acceptance criteria**

- `artifacts/vault-readiness-report.json` → `vaultReady: true`
- `artifacts/p0-staging-proof-unblock-summary.json` → `p0ProofStatus: proof_passed`
- No SKIPPED artifacts committed as PASS

Please confirm ETA for vault access and ticket ownership by reply.

Thanks,  
[Engineering / Program]
