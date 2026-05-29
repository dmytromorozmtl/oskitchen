# KitchenOS — era25 First Product Slice Blueprint

**Status:** **BLOCKED until `era25_engineering_gates_open` · NOT auto-implemented**

**Prerequisite:** Engineering gates enforcement PASS + signed `docs/era25-<name>-charter-2026-*.md`

---

## Declaration

This doc describes the **first era25 product engineering slice** — not process/gate orchestration.

| Rule | Verdict |
|------|---------|
| Start before `era25_engineering_gates_open` | **FORBIDDEN** |
| Add Step 18+ to linear doc chain | **FORBIDDEN** |
| Extend `COMMERCIAL_PILOT_PATH_STEP_CATALOG` | **FORBIDDEN** |
| Re-use era21 briefing scheme 0–8 for era25 product | **FORBIDDEN** |
| Nest under `#maintenance-mode` Steps 1–16 anchors | **FORBIDDEN** |

---

## Pre-flight verification (all must pass)

```bash
npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json
npm run ops:run-era25-engineering-gates-post-readiness-orchestrator -- --json
npm run ops:validate-linear-chain-terminus-guard -- --json
npm run test:ci:commercial-pilot-runbook:cert
```

Expected gates JSON:

```json
{
  "era25EngineeringGatesMilestone": "era25_engineering_gates_open",
  "gatesBlocked": false,
  "illegalArtifacts": []
}
```

---

## Naming convention (first slice `<name>`)

| Artifact | Pattern |
|----------|---------|
| Phases lib | `lib/commercial/<name>-phases-era25.ts` |
| UI slice | `lib/commercial/<name>-ui-era25.ts` |
| Orchestrator | `lib/commercial/<name>-post-gates-orchestrator-era25.ts` |
| Policy | `era25-<name>-v1` |
| Backlog ID | `KOS-E25-NNN` |
| Platform anchor | `#era25-<name>` on dedicated platform route |
| Ops validate | `ops:validate-<name>-era25` |
| Ops orchestrator | `ops:run-<name>-post-gates-orchestrator-era25` |
| CI unit | `test:ci:<name>-era25` |
| CI cert | `test:ci:<name>-era25:cert` |
| Staging doc | `docs/era25-<name>-staging-proof-ops-checklist.md` |

---

## Milestones (template — define per charter)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `gates_regression_blocked` | Gates no longer open | `2` |
| `awaiting_staging_proof` | Code wired, staging proof pending | `0` |
| `attention_staging_gaps` | Staging checklist gaps | `0` |
| `<name>_era25_slice_ready` | Staging proof + cert PASS | `0` |

---

## Engineering deliverables checklist

1. **Charter alignment** — every policy ID in code matches signed charter doc section 4
2. **Phases + guardrails** — human steps, forever commands, guardrails in phases lib
3. **Evaluate lib** — honest evaluation, no fake PASS
4. **Orchestrator** — milestone resolution, recommended commands, exit code `2` on primary block
5. **Validate script** — `--json` with milestone + smoke readiness flags
6. **Sync report** — `artifacts/<name>-era25-report.md`
7. **UI slice** — platform anchor outside linear catalog nesting
8. **Panel** — nested under `#era25-engineering-gates-require-signed-charter`, not Steps 1–16
9. **Workflow** — `workflow_dispatch`, orchestrator `continue-on-error: true`
10. **Cert test** — live repo wiring for ops scripts, workflow, product surfaces
11. **Briefing scheme** — new era25 section documented separately from era21 0–8
12. **Staging proof** — human checklist with honest NO-GO until vault + staging pass

---

## Platform ops nesting (after gates)

```
#era25-engineering-gates-require-signed-charter
  └── #era25-<name>   ← first product slice panel
```

---

## Human gate (non-negotiable)

Before merging first era25 product PR:

1. Charter signed with all 10 sections (including leadership sign-off)
2. Staging proof checklist reviewed by ops lead
3. `test:ci:commercial-pilot-runbook:cert` PASS
4. Confirm no regression on Steps 12–16 steady-state rhythms

---

## Related docs

- [`next-era25-engineering-gates-require-signed-charter-2026-05-28.md`](./next-era25-engineering-gates-require-signed-charter-2026-05-28.md) — gate enforcement (current)
- [`next-era25-first-charter-slice-template-2026-05-28.md`](./next-era25-first-charter-slice-template-2026-05-28.md) — charter readiness
- [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md) — vault blocker if staging blocked

---

**This doc is a blueprint. First era25 product code ships only after gates open and human charter sign-off.**
