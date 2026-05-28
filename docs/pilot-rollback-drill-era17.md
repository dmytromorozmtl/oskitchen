# Era 17 — Pilot rollback drill + retrospective

**Policy:** `era17-pilot-rollback-drill-v1`  
**Status:** **awaiting_rollback_drill_execution**  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) rollback plan · `era16-commercial-pilot-evidence-pack-v1`

Exercise the six-step paid pilot rollback plan once (tabletop or staging). Does **not** claim a live pilot was terminated without operator-recorded step status.

---

## Drill modes

| Mode | When to use |
|------|-------------|
| **tabletop** | Pre-pilot readiness — walk through steps with owner + support |
| **staging** | After pilot GO — controlled rollback rehearsal on staging tenant |

Set `PILOT_ROLLBACK_DRILL_MODE=tabletop|staging`.

---

## Rollback steps (from Era 16 evidence pack)

| Step | Action | Owner |
|------|--------|-------|
| 1 | Disable storefront publish / blackout window | Owner + support |
| 2 | Pause Woo/Shopify webhooks; revoke API keys | Owner |
| 3 | Document open orders; complete/cancel production/packing | Manager |
| 4 | Export audit log + order snapshot if required | Support admin |
| 5 | Disable staff invites; owner read-only wind-down | Owner |
| 6 | Record rollback date, reason, commit SHA | Support admin |

---

## Recording a drill

```bash
export PILOT_ROLLBACK_DRILL_MODE=tabletop
export PILOT_ROLLBACK_DRILL_OPERATOR_EMAIL="ops@example.com"
export PILOT_ROLLBACK_DRILL_REASON="Quarterly rollback rehearsal"
export PILOT_ROLLBACK_STEP_1_STATUS=PASSED
export PILOT_ROLLBACK_STEP_2_STATUS=PASSED
export PILOT_ROLLBACK_STEP_3_STATUS=PASSED
export PILOT_ROLLBACK_STEP_4_STATUS=PASSED
export PILOT_ROLLBACK_STEP_5_STATUS=PASSED
export PILOT_ROLLBACK_STEP_6_STATUS=PASSED
export PILOT_RETROSPECTIVE_OUTCOME="All steps completed in 35 min tabletop"
export PILOT_RETROSPECTIVE_LESSONS="Webhook revoke checklist needs direct link in runbook"
npm run smoke:pilot-rollback-drill
```

Pre-drill template (all steps skipped):

```bash
npm run smoke:pilot-rollback-drill -- --template-only
```

Review **`artifacts/pilot-rollback-drill-summary.json`** — `rollbackProofStatus` must be `proof_passed` for validated rollback readiness.

---

## Retrospective prompts

After the drill, capture:

- **Outcome:** Did rollback complete within target time? Any blockers?
- **Lessons:** What runbook gaps, tooling gaps, or RBAC surprises appeared?

Use `PILOT_RETROSPECTIVE_OUTCOME` and `PILOT_RETROSPECTIVE_LESSONS`.

---

## Honesty rules

- Do **not** mark `proof_passed` without all six steps `PASSED` and operator email.
- Tabletop PASS is **not** production rollback certification.
- Staging drill requires `PILOT_ROLLBACK_DRILL_STAGING_URL`.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Canonical rollback + escalation |
| [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | Contract Exhibit D rollback |
| [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md) | Integration webhook revoke detail |
