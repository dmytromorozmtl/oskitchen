# OS Kitchen — era25 Engineering Gates (require signed charter)

**Status:** **Gate enforcement orchestration · NO era25 product engineering until gates open**

**Policy:** `era24-era25-engineering-gates-require-signed-charter-v1` · Orchestrator `era24-era25-engineering-gates-post-readiness-orchestrator-v1`  
**Backlog:** `KOS-E25-GATES-ENFORCE` · **NOT in linear catalog · NOT Step 18**

**Prerequisite:** `era25_first_charter_slice_ready` + terminus guard PASS + no illegal era25 product artifacts

---

## Declaration

**era25 product engineering does not start automatically.**

This slice **enforces** the charter gate — it does not ship era25 product code.

| Rule | Verdict |
|------|---------|
| Add to `COMMERCIAL_PILOT_PATH_STEP_CATALOG` | **FORBIDDEN** |
| Ship `*-phases-era25.ts` before gates open | **FORBIDDEN** |
| Nest era25 product panels under Steps 1–16 anchors | **FORBIDDEN** |
| Hand-edit PASS in `artifacts/*.json` | **FORBIDDEN** |
| Keep terminus guard PASS | **REQUIRED** |

---

## Milestones (`era25EngineeringGatesMilestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `charter_readiness_blocked` | Readiness not healthy (exit/checklist/sections) | `2` |
| `awaiting_human_charter_signoff` | Readiness healthy but no signed charter doc yet | `0` |
| `attention_illegal_era25_artifacts` | Illegal era25 product files detected | `0` |
| `era25_engineering_gates_open` | Readiness healthy + no illegal artifacts | `0` |

**Smoke readiness flags:**

- `readyForCharterReadinessSmokes` — readiness blocked milestones
- `readyForIllegalArtifactSmokes` — illegal era25 product artifacts present

---

## Ops commands

```bash
npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json
npm run ops:run-era25-engineering-gates-post-readiness-orchestrator -- --json
npm run ops:run-era25-engineering-gates-post-readiness-orchestrator -- --write
npm run ops:sync-era25-engineering-gates-require-signed-charter-report -- --write

npm run test:ci:era25-engineering-gates-require-signed-charter-era24
npm run test:ci:era25-engineering-gates-require-signed-charter-era24:cert
```

**Artifacts:** `artifacts/era25-engineering-gates-require-signed-charter-report.md`

**Workflow:** `.github/workflows/ops-era25-engineering-gates-require-signed-charter-validate.yml`

**Platform ops:** `#era25-engineering-gates-require-signed-charter` (nested under `#era25-first-charter-slice-readiness`)

---

## Gate open criteria (all required)

1. `era25FirstCharterSliceReadinessMilestone: era25_first_charter_slice_ready`
2. `era25CharterExitMilestone: era25_charter_exit_healthy`
3. Terminus guard PASS (catalog locked at 16 steps)
4. Zero illegal era25 product artifacts (`discoverIllegalEra25ProductArtifacts`)
5. Leadership sign-off documented in `docs/era25-<name>-charter-2026-*.md`

---

## First product slice requirements (when gates open)

| Requirement | Detail |
|-------------|--------|
| New policy family | `era25-<name>-v1` (+ phases, ui, orchestrator) |
| New backlog ID | `KOS-E25-NNN` |
| New platform anchor | `#era25-<name>` — **outside** Steps 1–16 |
| Ops validate + orchestrator | Honest JSON, never fake PASS |
| CI | `test:ci:<name>-era25` + `:cert` |
| Briefing scheme | Documented separately from era21 0–8 |
| Staging proof | era25-specific checklist |

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Illegal artifact detector | `lib/commercial/detect-illegal-era25-product-artifacts-era24.ts` |
| Evaluation | `lib/commercial/evaluate-era25-engineering-gates-require-signed-charter.ts` |
| Orchestrator lib | `lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24.ts` |
| UI slice | `lib/commercial/era25-engineering-gates-ui-era24.ts` |
| Panel | `#era25-engineering-gates-require-signed-charter` |

---

## Human gate (non-negotiable)

Leadership must:

1. Sign the charter doc in `docs/era25-<name>-charter-2026-*.md`
2. Approve backlog ID and policy naming
3. Confirm era25 scope does not re-open era21 gate chain for steady-state customers

**Until `era25_engineering_gates_open`: steady-state ops only (Steps 12–16 rhythms).**

---

## Related docs

- [`next-era25-first-charter-slice-template-2026-05-28.md`](./next-era25-first-charter-slice-template-2026-05-28.md) — readiness orchestration
- [`next-era25-charter-exit-outside-linear-path-2026-05-28.md`](./next-era25-charter-exit-outside-linear-path-2026-05-28.md) — exit process
- [`next-era25-first-product-slice-blueprint-2026-05-28.md`](./next-era25-first-product-slice-blueprint-2026-05-28.md) — blueprint orchestration (implemented)
- [`next-era25-owner-daily-briefing-breakthrough-product-slice-2026-05-28.md`](./next-era25-owner-daily-briefing-breakthrough-product-slice-2026-05-28.md) — **next step** after blueprint ready
- [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md) — if path blocked

---

## If an agent proposes era25 product code before gates open

**Reject.** Redirect to:

- This doc + `npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json`
- [`next-era25-first-charter-slice-template-2026-05-28.md`](./next-era25-first-charter-slice-template-2026-05-28.md)

---

**Gate enforcement only. First era25 product code ships only after `era25_engineering_gates_open`. Never fake PASS.**
