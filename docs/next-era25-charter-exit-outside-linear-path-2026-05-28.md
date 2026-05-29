# KitchenOS — era25+ Charter Exit (outside linear path)

**Status:** **Process only · NOT Steps 1–17 · NOT a linear catalog step**

**Policy:** `era24-era25-charter-exit-outside-linear-path-v1` · Orchestrator `era24-era25-charter-exit-post-terminus-guard-orchestrator-v1`  
**Backlog:** `KOS-E25-EXIT-PROCESS` (process slice — not era25 engineering until charter signed)  
**Prerequisite:** Step 17 guard `step17_forbidden_healthy` (or honest blocked milestones until P0 vault)

---

## Declaration

The commercial pilot **linear doc chain ends at Step 16**.

Step 17 is **FORBIDDEN** as a catalog step — see [`next-step-17-forbidden-linear-chain-terminus-2026-05-28.md`](./next-step-17-forbidden-linear-chain-terminus-2026-05-28.md).

**era25+ is the only exit** for new commercial gates — via explicit era charter, never by adding Step 18+ to the linear chain.

---

## Milestones (`era25CharterExitMilestone`)

| Milestone | Meaning | Orchestrator exit |
|-----------|---------|-------------------|
| `terminus_guard_blocked` | Step 17 guard not healthy | `2` |
| `attention_charter_checklist` | Checklist artifact missing | `0` |
| `awaiting_signed_charter` | Checklist exported, no era25 charter doc yet (normal) | `0` |
| `era25_charter_exit_healthy` | Checklist + signed `docs/era25-*-charter-*.md` | `0` |

**Smoke readiness flags:**

- `readyForTerminusGuardSmokes` — terminus guard not at healthy milestone
- `readyForCharterChecklistSmokes` — checklist artifact missing

---

## Ops commands (era25 exit process)

```bash
npm run ops:validate-era25-charter-exit-outside-linear-path -- --json
npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --json
npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write
npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write
npm run ops:export-era-charter-readiness-checklist -- --write
npm run ops:validate-linear-chain-terminus-guard -- --json

npm run test:ci:era25-charter-exit-outside-linear-path-era24
npm run test:ci:era25-charter-exit-outside-linear-path-era24:cert
```

**Artifacts:**

- `artifacts/era25-charter-exit-outside-linear-path-report.md`
- `docs/era-charter-readiness-checklist-era24.md` (on `--write` export)

**Workflow:** `.github/workflows/ops-era25-charter-exit-outside-linear-path-validate.yml`

---

## Engineering wiring

| Component | Artifact |
|-----------|----------|
| Phases lib | `lib/commercial/era25-charter-exit-outside-linear-path-phases-era24.ts` |
| Orchestrator lib | `lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24.ts` |
| Evaluate | `lib/commercial/evaluate-era25-charter-exit-outside-linear-path.ts` |
| UI slice | `lib/commercial/era25-charter-exit-ui-era24.ts` |
| Panel | `#era25-charter-exit-outside-linear-path` nested under `#linear-chain-step17-forbidden` |
| Policy | `lib/commercial/era25-charter-exit-outside-linear-path-era24-policy.ts` |

---

## When to use era25 charter

| Situation | Action |
|-----------|--------|
| Steady-state ops forever | Repeat Steps 12–16 rhythms + cert |
| New commercial gate needed | era25 charter process (this doc) |
| Agent proposes Step 18+ | **REJECT** — redirect to Step 17 forbidden doc |

---

## era25 charter process (human-gated)

### 1. Leadership decision

- [ ] Explicit decision **not** to extend era24 maintenance rhythms
- [ ] Written scope for era25+ (name, goals, non-goals)
- [ ] Sign-off from product + engineering leadership

### 2. Export readiness checklist

```bash
npm run ops:export-era-charter-readiness-checklist -- --write
```

### 3. Write era25 charter doc

`docs/era25-<name>-charter-2026-*.md` — **outside** Steps 1–16

See template: [`next-era25-first-charter-slice-template-2026-05-28.md`](./next-era25-first-charter-slice-template-2026-05-28.md)

### 4. Engineering (only after charter signed)

- New policies **must not** extend `COMMERCIAL_PILOT_PATH_STEP_CATALOG`
- New panels **must not** appear under Steps 1–16 anchors
- Honest JSON validate scripts — never hand-edit PASS in `artifacts/*.json`
- Separate CI workflows per era25 slice

### 5. Pilot proof

- Staging proof checklist for era25 scope
- `test:ci:commercial-pilot-runbook:cert` still green
- Terminus guard still PASS

---

## Platform surfaces

- `/platform/commercial-pilot-ops#era25-charter-exit-outside-linear-path`
- `/dashboard/today` — maintenance compact (nested under Step 17 guard)

---

## Weekly operator checklist

- [ ] Review `era25CharterExitMilestone` from validate JSON
- [ ] Terminus guard PASS
- [ ] Charter checklist exported when considering era25
- [ ] No fake signed charter — human writes `docs/era25-*-charter-*.md`
- [ ] Release train includes commercial pilot cert

---

## era25 first charter slice readiness — implemented

See [`next-era25-first-charter-slice-template-2026-05-28.md`](./next-era25-first-charter-slice-template-2026-05-28.md)

Readiness orchestrator: `era24-era25-first-charter-slice-readiness-post-charter-exit-orchestrator-v1` · Validates 10 charter doc sections · **No era25 engineering until `era25_first_charter_slice_ready`**

---

## era25 engineering gates preview (blocked until readiness healthy)

See [`next-era25-engineering-gates-require-signed-charter-2026-05-28.md`](./next-era25-engineering-gates-require-signed-charter-2026-05-28.md) — **first era25 product code requires signed charter + section validation**

---

## Guardrails (never)

- Never add Step 18+ to linear doc chain
- Never add era25 panels without signed charter
- Never merge GO artifacts across customers
- Never skip commercial pilot cert on release
- Never re-open era21 gate chain for steady-state customers

---

## Related docs

- [`next-step-16-linear-path-permanently-closed-2026-05-28.md`](./next-step-16-linear-path-permanently-closed-2026-05-28.md)
- [`next-step-17-forbidden-linear-chain-terminus-2026-05-28.md`](./next-step-17-forbidden-linear-chain-terminus-2026-05-28.md)
- [`next-step-14-post-terminus-era-charter-process-2026-05-28.md`](./next-step-14-post-terminus-era-charter-process-2026-05-28.md)

**Human blocker:** [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md)

---

**This doc is outside the linear catalog. era25 engineering begins only after human charter sign-off.**
