# Era 20 — Pilot GO/NO-GO Blocker Playbook

**Policy:** `era20-pilot-gono-go-blocker-taxonomy-v1`  
**Smoke:** `npm run smoke:pilot-gono-go`  
**Artifact:** `artifacts/pilot-gono-go-summary.json` (includes `blockerTaxonomy`)

---

## Workstream A status (Cycle 2 re-run)

| Check | Result |
|-------|--------|
| P0 smoke | **SKIPPED** — `awaiting_ops_credentials` (11 env vars) |
| `p0ProofStatus` | Not `proof_passed` |
| Fake PASS | **None** |

---

## Workstream B — Blocker categories

| Category | Owner | Typical blockers |
|----------|-------|------------------|
| `ops_credential` | DevOps/Ops | P0 env vars, staging URL, channel live, SSO IdP |
| `engineering_tier` | Engineering | Tier 0 CI failures |
| `staging_tier` | Ops | Tier 1 `verify:staging-env` |
| `operator_tier` | Ops/GTM | Tier 2 golden path, role checklists |
| `claims_enforcement` | GTM | Forbidden claims smoke |
| `icp_qualification` | Founder/GTM | Missing ICP JSON fields |
| `customer_prospect` | Legal | No LOI / customer name |
| `documentation` | Ops | Staging URL not in evidence pack |
| `proof_artifact` | Ops | SSO pilot_ready when required |

---

## Era 20 Cycle 2 product fix — Tier 0 gate

**Issue:** `tier0ProofStatus: proof_passed` but GO/NO-GO reported "Tier 0 engineering CI gate failed" because `overall: SKIPPED` (Tier 1 staging env missing).

**Fix:** `deriveTier0Pass` now evaluates **Tier 0 only** — honest separation of engineering vs staging prerequisites.

---

## Qualify ICP (example — not a customer)

```bash
export PILOT_GONOGO_ICP_INPUT_JSON="$(cat config/commercial/pilot-icp-qualified-example.template.json)"
export PILOT_GONOGO_PROSPECT_NAME="Example Ghost Kitchen (prospect — not signed)"
npm run smoke:pilot-gono-go
```

Removes ICP blocker when criteria match. Does **not** remove customer/LOI or P0 blockers.

---

## Path to CONDITIONAL GO

1. Tier 0 **PASS** (engineering — may already pass locally)
2. Tier 1 PASS or documented SKIPPED WITH REASON
3. Forbidden claims PASS
4. ICP qualified via JSON
5. P0 proof PASS (ops vault)
6. Tier 2 golden path PASS (staging operator)
7. Customer + LOI when real signature exists

**Still NO-GO** until 5–7 for paid pilot kickoff.

---

*Next: Workstream A Cycle 3 — ops configures 11 P0 env vars.*
