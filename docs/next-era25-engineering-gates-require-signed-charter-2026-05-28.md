# KitchenOS — era25 Engineering Gates (require signed charter)

**Status:** **BLOCKED until `era25_first_charter_slice_ready` · NOT auto-implemented**

**Prerequisite:** Validated `docs/era25-*-charter-2026-*.md` with all 10 sections + leadership sign-off

---

## Declaration

**era25 product engineering does not start automatically.**

The first era25 engineering gate opens **only** when:

1. `era25FirstCharterSliceReadinessMilestone: era25_first_charter_slice_ready`
2. `era25CharterExitMilestone: era25_charter_exit_healthy`
3. Terminus guard PASS (catalog locked at 16 steps)
4. Charter doc signed by leadership (human, in repo)

---

## What the first era25 slice MUST include

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

## What is FORBIDDEN

- Adding Step 18+ to linear doc chain
- Extending `COMMERCIAL_PILOT_PATH_STEP_CATALOG`
- Nesting era25 panels under `#maintenance-mode` Step 1–16 anchors
- Starting era25 without validated charter sections
- Hand-editing PASS in `artifacts/*.json`

---

## Ops verification before era25 slice 1 code

```bash
npm run ops:validate-era25-first-charter-slice-readiness -- --json
npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator -- --write
npm run ops:validate-linear-chain-terminus-guard -- --json
npm run ops:validate-era25-charter-exit-outside-linear-path -- --json
npm run test:ci:commercial-pilot-runbook:cert
```

Expected readiness JSON:

```json
{
  "era25FirstCharterSliceReadinessMilestone": "era25_first_charter_slice_ready",
  "sectionsValid": true
}
```

---

## Human gate (non-negotiable)

Leadership must:

1. Sign the charter doc in `docs/era25-<name>-charter-2026-*.md`
2. Approve backlog ID and policy naming
3. Confirm era25 scope does not re-open era21 gate chain for steady-state customers

**Until then: steady-state ops only (Steps 12–16 rhythms).**

---

## Related docs

- [`next-era25-first-charter-slice-template-2026-05-28.md`](./next-era25-first-charter-slice-template-2026-05-28.md) — readiness orchestration
- [`next-era25-charter-exit-outside-linear-path-2026-05-28.md`](./next-era25-charter-exit-outside-linear-path-2026-05-28.md) — exit process
- [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md) — if path blocked

---

**This doc is a gate declaration. First era25 code ships only after human charter sign-off.**
