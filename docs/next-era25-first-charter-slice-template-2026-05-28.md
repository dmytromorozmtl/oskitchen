# KitchenOS — era25 First Charter Slice (template)

**Status:** **TEMPLATE ONLY · DO NOT IMPLEMENT UNTIL CHARTER SIGNED**

**Prerequisite:** `era25CharterExitMilestone: era25_charter_exit_healthy` + leadership sign-off on `docs/era25-<name>-charter-2026-*.md`

---

## Declaration

This is the **first era25 engineering slice template** — outside the linear commercial pilot catalog (Steps 1–16).

| Rule | Verdict |
|------|---------|
| Add to `COMMERCIAL_PILOT_PATH_STEP_CATALOG` | **FORBIDDEN** |
| Nest under Steps 1–16 panel anchors | **FORBIDDEN** |
| Start era25 without signed charter doc | **FORBIDDEN** |
| Keep terminus guard PASS | **REQUIRED** |

---

## Charter doc minimum (human writes first)

File: `docs/era25-<name>-charter-2026-*.md`

Required sections:

1. **Charter name + era number** — e.g. `era25-enterprise-procurement`
2. **Problem statement** — why era24 maintenance rhythms are insufficient
3. **Success criteria** — measurable, honest (no fake PASS)
4. **Policy IDs** — `era25-<name>-v1`, phases, ui, orchestrator
5. **Backlog ID** — `KOS-E25-NNN`
6. **Ops scripts** — `ops:validate-*`, `ops:run-*-orchestrator`, `ops:sync-*-report`
7. **CI** — `test:ci:*-era25` + `:cert`
8. **Briefing scheme** — separate from era21 priorities 0–8
9. **Rollback / NO-GO** — explicit abort criteria
10. **Leadership sign-off** — names + dates

---

## First slice engineering pattern (when charter signed)

| Component | Example artifact |
|-----------|------------------|
| Phases lib | `lib/commercial/<name>-phases-era25.ts` |
| Orchestrator | `lib/commercial/<name>-post-<prev>-orchestrator-era25.ts` |
| Policy | `era25-<name>-v1` |
| Validate | `scripts/ops/validate-<name>.ts` |
| UI slice | `lib/commercial/<name>-ui-era25.ts` |
| Panel anchor | `#era25-<name>` on **new** platform route (not Steps 1–16) |
| Workflow | `.github/workflows/ops-<name>-validate.yml` |

**Milestones:** honest blocked → attention → healthy (never fake PASS)

---

## Ops prep before era25 slice 1

```bash
npm run ops:validate-era25-charter-exit-outside-linear-path -- --json
npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write
npm run ops:validate-linear-chain-terminus-guard -- --json
npm run test:ci:commercial-pilot-runbook:cert
```

---

## Guard verification before any era25 code

- [ ] `COMMERCIAL_PILOT_PATH_STEP_CATALOG` still 16 steps
- [ ] No `docs/next-step-18-*` linear docs
- [ ] Signed charter doc present in repo
- [ ] Charter checklist exported
- [ ] Commercial pilot cert green

---

## If an agent proposes era25 without charter

**Reject.** Redirect to:

- [`next-era25-charter-exit-outside-linear-path-2026-05-28.md`](./next-era25-charter-exit-outside-linear-path-2026-05-28.md)
- [`next-step-17-forbidden-linear-chain-terminus-2026-05-28.md`](./next-step-17-forbidden-linear-chain-terminus-2026-05-28.md)

---

**Template only. No era25 engineering until human charter sign-off.**
