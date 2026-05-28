# KitchenOS — Step 17: FORBIDDEN (linear chain terminus)

**Status:** **DO NOT IMPLEMENT · DO NOT DOCUMENT STEP 18+**

---

## Declaration

**Step 17 does not exist.**

The KitchenOS commercial pilot linear doc chain **ends at Step 16**.

| Action | Verdict |
|--------|---------|
| Add Step 17 to this chain | **FORBIDDEN** |
| Add Step 18+ docs | **FORBIDDEN** |
| Add era25+ code without charter | **FORBIDDEN** |
| Repeat Step 12–16 rhythms | **REQUIRED** |

---

## What to do instead

### Steady-state operations (forever)

```bash
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-linear-path-permanently-closed -- --json
npm run ops:validate-steady-state-operator-loop -- --json
npm run ops:sync-linear-path-permanently-closed-report -- --write
```

Surfaces: `/dashboard/today` · `/platform/commercial-pilot-ops#linear-path-permanently-closed`

### New commercial gates (era25+)

Only via **separate era charter** — not Steps 1–17:

1. Leadership sign-off
2. `npm run ops:export-era-charter-readiness-checklist -- --write`
3. `docs/era25-<name>-charter-2026-*.md`
4. New `era25-*` policies outside this path

---

## Guard (Step 17 FORBIDDEN — not a path step)

```bash
npm run ops:validate-linear-chain-terminus-guard -- --json
```

Verifies catalog locked at **16 steps**, Step 17 forbidden doc present, no Step 18+ linear docs.

Policy: `era24-linear-chain-terminus-guard-v1`

---

## If an agent proposes "Step 17"

**Reject.** Redirect to:

- [`next-step-16-linear-path-permanently-closed-2026-05-28.md`](./next-step-16-linear-path-permanently-closed-2026-05-28.md) — terminal closure
- [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md) — if path blocked

---

**This file is the final meta-doc in the linear chain. No Step 18.**
