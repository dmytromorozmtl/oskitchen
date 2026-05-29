# KitchenOS — era25+ Charter Exit (outside linear path)

**Status:** **Process only · NOT Steps 1–17 · NOT a linear catalog step**

**Prerequisite:** Step 16 terminal closure + Step 17 guard PASS (or honest blocked milestones until P0 vault)

---

## Declaration

The commercial pilot **linear doc chain ends at Step 16**.

Step 17 is **FORBIDDEN** as a catalog step — see [`next-step-17-forbidden-linear-chain-terminus-2026-05-28.md`](./next-step-17-forbidden-linear-chain-terminus-2026-05-28.md).

**era25+ is the only exit** for new commercial gates — via explicit era charter, never by adding Step 18+ to the linear chain.

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

**Artifact:** `docs/era-charter-readiness-checklist-era24.md`

### 3. Write era25 charter doc

`docs/era25-<name>-charter-2026-*.md` — **outside** Steps 1–16

Minimum sections:

- Charter name + era number (`era25`)
- Problem statement (why era24 rhythms insufficient)
- Success criteria (measurable, honest)
- Policy IDs (`era25-<name>-v1`, phases, ui, orchestrator)
- Backlog ID (`KOS-E25-NNN`)
- Ops scripts + `test:ci:*-era25` + `:cert`
- Briefing priority scheme (separate from era21 0–8)
- Rollback / NO-GO criteria

### 4. Engineering (only after charter signed)

- New policies **must not** extend `COMMERCIAL_PILOT_PATH_STEP_CATALOG`
- New panels **must not** appear under Steps 1–16 anchors
- Honest JSON validate scripts — never hand-edit PASS in `artifacts/*.json`
- Separate CI workflows per era25 slice

### 5. Pilot proof

- Staging proof checklist for era25 scope
- `test:ci:commercial-pilot-runbook:cert` still green
- Terminus guard still PASS (`ops:validate-linear-chain-terminus-guard -- --json`)

---

## Ops commands (era25 prep)

```bash
npm run ops:validate-linear-chain-terminus-guard -- --json
npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --json
npm run ops:export-era-charter-readiness-checklist -- --write
npm run ops:validate-linear-path-permanently-closed -- --json
npm run test:ci:commercial-pilot-runbook:cert
```

**Platform ops:** `#linear-chain-step17-forbidden` → era25 exit commands

---

## Guardrails (never)

- Never add Step 18+ to linear doc chain
- Never add era25 panels without signed charter
- Never merge GO artifacts across customers
- Never skip commercial pilot cert on release
- Never re-open era21 gate chain for steady-state customers

---

## Related docs

- [`next-step-16-linear-path-permanently-closed-2026-05-28.md`](./next-step-16-linear-path-permanently-closed-2026-05-28.md) — terminal closure
- [`next-step-17-forbidden-linear-chain-terminus-2026-05-28.md`](./next-step-17-forbidden-linear-chain-terminus-2026-05-28.md) — Step 17 forbidden
- [`next-step-14-post-terminus-era-charter-process-2026-05-28.md`](./next-step-14-post-terminus-era-charter-process-2026-05-28.md) — original charter process

**Human blocker:** [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md)

---

**This doc is outside the linear catalog. era25 engineering begins only after human charter sign-off.**
