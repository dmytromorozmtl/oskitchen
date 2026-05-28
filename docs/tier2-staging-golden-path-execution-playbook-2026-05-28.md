# Tier 2 Staging Golden Path — Execution Playbook (28 May 2026)

**Policy:** `era20-tier2-staging-golden-path-v1`  
**Orchestrator:** `npm run smoke:tier2-staging-golden-path`  
**Artifact:** `artifacts/tier2-staging-golden-path-summary.json`  
**Prerequisite:** `artifacts/p0-staging-proof-unblock-summary.json` → `p0ProofStatus: proof_passed`

**Honesty:** Until P0 PASS, orchestrator writes **SKIPPED** — never fake Tier 2 PASS.

---

## Scope

End-to-end operator path on **real staging**:

```
Woo/Shopify webhook → Order Hub → KDS bump → Packing complete
```

Plus GitHub evidence: KDS Playwright green URL.

---

## Roles

| Role | Responsibility |
|------|----------------|
| **Integrations engineer** | Live store webhook, verify canonical order |
| **Kitchen operator** | KDS bump on staging tablet |
| **Packer** | Packing verify + label |
| **QA** | Record env vars, GitHub run URL, sign-off artifact |
| **DevOps** | Ensure staging workflows have secrets from P0 |

---

## Phase 0 — Verify P0 PASS

```bash
npm run ops:validate-p0-vault-env          # 11/11 present
npm run smoke:p0-staging-proof-unblock     # proof_passed
cat artifacts/p0-staging-proof-unblock-summary.json | jq .p0ProofStatus
```

**Gate:** If not `proof_passed`, stop — return to [`p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md).

---

## Phase 1 — Automated child smokes

```bash
export PILOT_GOLDEN_PATH_STAGING_URL="$E2E_STAGING_BASE_URL"
export PILOT_GOLDEN_PATH_OPERATOR_EMAIL="$E2E_LOGIN_EMAIL"
export PILOT_GOLDEN_PATH_COMMIT_SHA="$(git rev-parse HEAD)"

npm run smoke:tier2-staging-golden-path
```

Runs (when P0 passed):

1. `smoke:woo-shopify-live` — channel live artifact  
2. `smoke:staging-workflows-first-green` — GitHub staging workflows  
3. `smoke:pilot-operator-golden-path` — Tier 2 CI wiring + manual phase slots  

---

## Phase 2 — Manual golden path (staging browser)

Execute in order. Record each step:

| Step | Route | Action | Env sign-off |
|------|-------|--------|--------------|
| 1 | `/dashboard/sales-channels` | Confirm Woo **or** Shopify row LIVE | — |
| 2 | Staging store | Place test order (real webhook) | — |
| 3 | `/dashboard/order-hub` | Canonical external order visible | `TIER2_CHANNEL_WEBHOOK_MANUAL=PASSED` |
| 4 | `/dashboard/kitchen` | Bump ticket (note 15s poll banner) | `TIER2_KDS_BUMP_MANUAL=PASSED` |
| 5 | `/dashboard/packing` | Verify + complete packing | `TIER2_PACKING_COMPLETE_MANUAL=PASSED` |

```bash
export TIER2_CHANNEL_WEBHOOK_MANUAL=PASSED
export TIER2_KDS_BUMP_MANUAL=PASSED
export TIER2_PACKING_COMPLETE_MANUAL=PASSED
```

---

## Phase 3 — GitHub KDS Playwright evidence

1. GitHub → **Actions → Playwright KDS Staging** → Run workflow  
2. Wait for green run  
3. Record:

```bash
export GITHUB_KDS_STAGING_RUN_URL="https://github.com/ORG/REPO/actions/runs/XXXXX"
export GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED
```

Optional: `GITHUB_E2E_STAGING_RUN_URL` from `e2e-staging.yml`.

---

## Phase 4 — Re-run orchestrator + sign-off

```bash
npm run smoke:tier2-staging-golden-path
```

**Acceptance:**

```json
{
  "overall": "PASSED",
  "tier2ProofStatus": "proof_passed"
}
```

Then:

```bash
npm run smoke:pilot-gono-go
```

Tier 2 gate in GO/NO-GO reads `artifacts/pilot-operator-golden-path-summary.json` + this artifact.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Order not in hub | Check webhook delivery in Sales channels → Webhooks; verify `ENCRYPTION_KEY` matches staging |
| KDS empty | Order must reach kitchen-eligible status; check operating mode |
| SKIPPED child smokes | Re-run P0 orchestrator; verify `DATABASE_URL` points at staging |
| GitHub workflow red | See [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) |

---

## Forbidden claims until Tier 2 PASS

- "Live channel integration verified" without `TIER2_CHANNEL_WEBHOOK_MANUAL=PASSED`  
- "KDS staging certified" without `GITHUB_KDS_STAGING_RUN_URL`  
- "Pilot golden path complete" without `tier2ProofStatus: proof_passed`  

---

## Related

- [`era20-operator-golden-path-proof-2026-05-28.md`](./era20-operator-golden-path-proof-2026-05-28.md)  
- [`pilot-operator-golden-path-era17.md`](./pilot-operator-golden-path-era17.md)  
- [`next-step-2-after-p0-pass-2026-05-28.md`](./next-step-2-after-p0-pass-2026-05-28.md)
