# KitchenOS — era25 First Charter Slice (readiness orchestration)

**Status:** **Readiness orchestration · NO era25 engineering until charter sections validate**

**Policy:** `era24-era25-first-charter-slice-readiness-v1` · Orchestrator `era24-era25-first-charter-slice-readiness-post-charter-exit-orchestrator-v1`  
**Backlog:** `KOS-E25-SLICE-READINESS` · **NOT in linear catalog · NOT Step 18**

**Prerequisite:** era25 charter exit process active + terminus guard PASS

---

## Declaration

This slice **validates human-written charter docs** before any era25 engineering begins.

| Rule | Verdict |
|------|---------|
| Add to `COMMERCIAL_PILOT_PATH_STEP_CATALOG` | **FORBIDDEN** |
| Nest under Steps 1–16 panel anchors | **FORBIDDEN** |
| Start era25 code without validated charter | **FORBIDDEN** |
| Keep terminus guard PASS | **REQUIRED** |

---

## Milestones (`era25FirstCharterSliceReadinessMilestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `charter_exit_blocked` | era25 exit not ready (checklist/guard) | `2` |
| `awaiting_signed_charter` | No `docs/era25-*-charter-*.md` yet (normal) | `0` |
| `attention_charter_sections` | Charter doc missing required sections | `0` |
| `era25_first_charter_slice_ready` | All 10 charter sections present | `0` |

**Smoke readiness flags:**

- `readyForCharterExitSmokes` — charter exit blocked
- `readyForCharterSectionSmokes` — charter doc incomplete

---

## Ops commands

```bash
npm run ops:validate-era25-first-charter-slice-readiness -- --json
npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator -- --json
npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator -- --write
npm run ops:sync-era25-first-charter-slice-readiness-report -- --write

npm run test:ci:era25-first-charter-slice-readiness-era24
npm run test:ci:era25-first-charter-slice-readiness-era24:cert
```

**Artifacts:** `artifacts/era25-first-charter-slice-readiness-report.md`

**Workflow:** `.github/workflows/ops-era25-first-charter-slice-readiness-validate.yml`

**Platform ops:** `#era25-first-charter-slice-readiness` (nested under `#era25-charter-exit-outside-linear-path`)

---

## Required charter sections (10 — automated validation)

1. Charter name + era number (`era25`)
2. Problem statement
3. Success criteria
4. Policy IDs (`era25-*-v1`)
5. Backlog ID (`KOS-E25-NNN`)
6. Ops scripts
7. CI scripts (`test:ci:*-era25`)
8. Briefing scheme
9. Rollback / NO-GO
10. Leadership sign-off

File pattern: `docs/era25-<name>-charter-2026-*.md`

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Section validator | `lib/commercial/validate-era25-charter-doc-sections-era24.ts` |
| Orchestrator lib | `lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24.ts` |
| UI slice | `lib/commercial/era25-first-charter-slice-readiness-ui-era24.ts` |
| Panel | `#era25-first-charter-slice-readiness` |

---

## First slice engineering pattern (only after `era25_first_charter_slice_ready`)

| Component | Example artifact |
|-----------|------------------|
| Phases lib | `lib/commercial/<name>-phases-era25.ts` |
| Orchestrator | `lib/commercial/<name>-post-<prev>-orchestrator-era25.ts` |
| Policy | `era25-<name>-v1` |
| Panel anchor | `#era25-<name>` on **new** platform route |

---

## era25 engineering gates preview (after readiness healthy)

See [`next-era25-engineering-gates-require-signed-charter-2026-05-28.md`](./next-era25-engineering-gates-require-signed-charter-2026-05-28.md)

**First era25 product engineering begins ONLY when:**

- `era25FirstCharterSliceReadinessMilestone: era25_first_charter_slice_ready`
- Leadership sign-off documented in charter doc
- Terminus guard still PASS

---

## If an agent proposes era25 without charter

**Reject.** Redirect to:

- [`next-era25-charter-exit-outside-linear-path-2026-05-28.md`](./next-era25-charter-exit-outside-linear-path-2026-05-28.md)
- [`next-step-17-forbidden-linear-chain-terminus-2026-05-28.md`](./next-step-17-forbidden-linear-chain-terminus-2026-05-28.md)

---

**No era25 engineering until charter sections validate. Never fake PASS.**
