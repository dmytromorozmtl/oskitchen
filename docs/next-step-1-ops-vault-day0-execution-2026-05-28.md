# P0 Ops Vault — Day 0 Execution (28 May 2026)

**Audience:** DevOps / founder with GitHub admin  
**Time:** 2–4 hours  
**Outcome:** Phase 1 + Phase 2 complete → `ops:validate-p0-vault-env` shows 5/11 vars  
**Next:** [`next-step-2-after-p0-pass-2026-05-28.md`](./next-step-2-after-p0-pass-2026-05-28.md)

---

## Before you start

```bash
npm run ops:export-p0-vault-env-template -- --write
npm run smoke:p0-staging-proof-unblock -- --checklist-only
npm run ops:print-p0-github-secrets-checklist   # after first artifact exists
npm run ops:sync-p0-vault-progress-report -- --write   # standup markdown
```

**Product surfaces that reflect progress (no fake PASS):**

| Surface | What you'll see |
|---------|-----------------|
| `/dashboard/integration-health` | P0 banner + 4 phased checklist |
| `/dashboard/today` (Owner Briefing) | Compact ops vault panel + **#1 top action** (P0 ops vault Day 0) |
| `/dashboard/launch-wizard?from=go-live` | Redirect banner from hidden Go-live nav |
| `/dashboard/launch-wizard` | Commercial blockers + Tier 2 panel (blocked until P0) |
| Platform support → Pilot ops | P0 phases + Tier 2 artifact rows |

---

## Step 1 — Confirm staging deploy (15 min)

1. Deploy `main` to staging (Vercel or equivalent).
2. Record URL without trailing slash: `https://YOUR-STAGING.example.com`
3. Verify health:

```bash
curl -sf "https://YOUR-STAGING.example.com/api/health"
```

4. Create or confirm **owner test user** can log in at `/login`.

---

## Step 2 — GitHub Secrets Phase 1 (30 min)

**Path:** Repository → Settings → Secrets and variables → Actions → New repository secret

| Secret | Value source |
|--------|--------------|
| `E2E_STAGING_BASE_URL` | Staging URL from Step 1 |
| `E2E_LOGIN_EMAIL` | Owner test user email |
| `E2E_LOGIN_PASSWORD` | Owner test user password |

**Also set in local ops shell** (never commit):

```bash
export E2E_STAGING_BASE_URL="https://YOUR-STAGING.example.com"
export E2E_LOGIN_EMAIL="owner@pilot.example.com"
export E2E_LOGIN_PASSWORD="***"
```

**Validation:**

```bash
npm run ops:validate-p0-vault-env
# Phase 1 — Staging login: ✓ complete (or 1–2 missing)
```

---

## Step 3 — GitHub Secrets Phase 2 (30 min)

| Secret | Value source |
|--------|--------------|
| `DATABASE_URL` | Vercel staging → Environment Variables → Postgres connection string |
| `ENCRYPTION_KEY` | Vercel staging → **must match runtime** or channel creds won't decrypt |

**Critical:** `ENCRYPTION_KEY` on GitHub Actions must equal Vercel staging app env.

**Validation:**

```bash
npm run ops:validate-p0-vault-env
# Phase 1 + Phase 2 complete → 5/11 present
```

---

## Step 4 — Local smoke dry-run (15 min)

Without all 11 vars, expect **SKIPPED WITH REASON** (exit 0):

```bash
npm run smoke:staging-workflows-first-green -- --checklist-only
npm run smoke:p0-staging-proof-unblock -- --checklist-only
```

Review artifact (honest state):

```bash
cat artifacts/p0-staging-proof-unblock-summary.json | head -30
# p0ProofStatus: awaiting_ops_credentials — expected until all 11 vars
```

---

## Step 5 — Handoff to Phase 3–4 (same day or next)

| Phase | Owner | Vars |
|-------|-------|------|
| 3 Channel | Integrations engineer | `CHANNEL_SMOKE_OWNER_EMAIL` + Woo/Shopify creds in DB |
| 4 SSO | Security | `SSO_STAGING_*` (5 vars) |

Playbook: [`p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md)

---

## Step 6 — Full orchestrator (after all 11 vars)

```bash
npm run ops:validate-p0-vault-env          # 11/11
npm run smoke:p0-staging-proof-unblock     # target proof_passed
```

**Acceptance:**

```json
{ "p0ProofStatus": "proof_passed", "overall": "PASSED" }
```

**UI acceptance:** Integration Health P0 banner **disappears**. Launch Wizard Tier 2 panel unlocks.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Phase 1 complete but E2E fails | Check staging login manually; password special chars in GitHub secret |
| Channel smoke SKIPPED | `ENCRYPTION_KEY` mismatch between Vercel and GitHub |
| SSO smoke SKIPPED | Supabase SAML provider ref wrong |
| Artifact says PASSED but UI shows blocked | Redeploy app so artifact on host matches; refresh dashboard |

---

## Forbidden

- Committing `.env.staging` with real values  
- Editing `artifacts/*.json` manually to PASS  
- Telling sales "staging proven" before `proof_passed`  

---

## Next step after Day 0 partial (5/11 vars)

Continue Phase 3–4 in playbook, then:

→ [`next-step-2-after-p0-pass-2026-05-28.md`](./next-step-2-after-p0-pass-2026-05-28.md)
