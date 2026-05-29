# KitchenOS — Step 17: FORBIDDEN (linear chain terminus)

**Status:** **DO NOT ADD TO CATALOG · DO NOT DOCUMENT STEP 18+**

**Policy:** `era24-linear-chain-terminus-guard-v1` · Orchestrator `era24-linear-chain-terminus-guard-post-linear-path-closed-orchestrator-v1`  
**Backlog:** `KOS-E24-017-GUARD` (guard slice — not a catalog step)  
**Prerequisite:** Step 16 `linear_path_permanently_closed_healthy` (or honest blocked milestone until P0 vault)

---

## Declaration

**Step 17 does not exist in `COMMERCIAL_PILOT_PATH_STEP_CATALOG`.**

The KitchenOS commercial pilot linear doc chain **ends at Step 16**.

| Action | Verdict |
|--------|---------|
| Add Step 17 to this chain | **FORBIDDEN** |
| Add Step 18+ docs | **FORBIDDEN** |
| Add era25+ code without charter | **FORBIDDEN** |
| Repeat Step 12–16 rhythms | **REQUIRED** |

Step 17 engineering = **terminus guard orchestration only** (repo integrity, not a path step).

---

## Milestones (`linearChainTerminusGuardMilestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `linear_path_closure_blocked` | Step 16 not healthy | `2` |
| `attention_catalog_integrity` | Guard violations | `0` |
| `step17_forbidden_healthy` | Step 16 healthy + guard PASS | `0` |

**Smoke readiness flags:**

- `readyForLinearPathClosureSmokes` — Step 16 not at healthy milestone
- `readyForCatalogIntegritySmokes` — guard FAIL

---

## Ops commands (Step 17 guard)

```bash
npm run ops:validate-linear-chain-terminus-guard -- --json
npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --json
npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --write
npm run ops:sync-linear-chain-terminus-guard-report -- --write

npm run test:ci:linear-chain-terminus-guard-era24
npm run test:ci:linear-chain-terminus-guard-era24:cert
```

**Artifacts:**

- `artifacts/linear-chain-terminus-guard-report.md`

**Workflow:** `.github/workflows/ops-linear-chain-terminus-guard-validate.yml`

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Guard lib | `lib/commercial/linear-chain-terminus-guard-era24.ts` |
| Orchestrator lib | `lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24.ts` |
| UI slice | `lib/commercial/linear-chain-terminus-guard-ui-era24.ts` |
| Panel | `#linear-chain-step17-forbidden` nested under `#linear-path-permanently-closed` |
| Policy | `lib/commercial/linear-chain-terminus-guard-era24-policy.ts` |

---

## Guard checks (automated)

| Check | Expected |
|-------|----------|
| `COMMERCIAL_PILOT_PATH_STEP_CATALOG` count | 16 |
| Max catalog step | 16 |
| Step 17 in catalog | absent |
| `docs/next-step-17-forbidden-linear-chain-terminus-2026-05-28.md` | present |
| `docs/next-step-16-linear-path-permanently-closed-2026-05-28.md` | present |
| `docs/next-step-18-*` linear docs | absent |

---

## What to do instead

### Steady-state operations (forever)

```bash
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-linear-path-permanently-closed -- --json
npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --write
npm run ops:validate-steady-state-operator-loop -- --json
npm run ops:sync-linear-chain-terminus-guard-report -- --write
```

Surfaces: `/dashboard/today` · `/platform/commercial-pilot-ops#linear-chain-step17-forbidden`

---

## Operator rhythm after Step 16

Weekly:

1. Review `linearChainTerminusGuardMilestone` from validate JSON
2. Confirm terminus guard PASS
3. Run orchestrator `--write` to sync reports
4. Run `test:ci:commercial-pilot-runbook:cert` on release train

**No new linear steps.** If product needs new gates → era25 charter process only.

---

## era25+ charter exit — implemented (outside linear path)

See [`next-era25-charter-exit-outside-linear-path-2026-05-28.md`](./next-era25-charter-exit-outside-linear-path-2026-05-28.md)

Process orchestrator: `era24-era25-charter-exit-post-terminus-guard-orchestrator-v1` · **NOT Step 18** · Milestones: `terminus_guard_blocked` → checklist → `awaiting_signed_charter` → `era25_charter_exit_healthy`

---

## era25 first charter slice preview (template only)

See [`next-era25-first-charter-slice-template-2026-05-28.md`](./next-era25-first-charter-slice-template-2026-05-28.md) — **human charter sign-off required before any era25 engineering**

---

## If an agent proposes "Step 17" as a catalog step

**Reject.** Redirect to:

- This doc — guard orchestration only
- [`next-step-16-linear-path-permanently-closed-2026-05-28.md`](./next-step-16-linear-path-permanently-closed-2026-05-28.md) — terminal closure
- [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md) — if path blocked

---

**This file is the final meta-doc in the linear chain. No Step 18.**
