# KitchenOS — Шаг 12: Maintenance mode (commercial pilot path complete)

**Policy:** `era24-maintenance-mode-v1` · **Backlog:** `KOS-E24-012`  
**Предусловие:** Product evolution ready (Step 11 active) · GO valid  
**Цель:** Final informational layer — operator rhythms + guardrails forever

---

## Decision tree

```
Product evolution ready (Step 11, era23)
        │
        ▼
Maintenance mode (Step 12, era24 — path complete)
        │
        ├── Weekly Mon/Wed/Fri operator rhythms
        ├── Monthly W1–W4 cadence
        ├── Quarterly governance bundle
        ├── Per release cert + all validators
        └── Per new pilot GO isolation
                │
                ▼
         Repeat forever — Step 13 is engineering terminus (no code)
```

---

## Engineering wiring (era24 — informational, not a gate)

| Surface | When visible |
|---------|--------------|
| `/dashboard/today` | Compact maintenance panel (slate) — top of steady-state stack |
| Platform → Pilot ops | `#maintenance-mode` — aggregates era22 + era23 health |

**Stack on Today (when path complete):** improvement loop → product evolution → maintenance mode → operational empty state

**Explicitly NOT wired:** briefing priority, env attestation, Launch Wizard blockers.

---

## Preflight

```bash
npm run ops:validate-sustained-product-evolution -- --json   # productEvolutionReady: true
npm run ops:validate-maintenance-mode -- --json
npm run ops:export-maintenance-mode-rhythm-calendar -- --write
npm run ops:sync-maintenance-mode-playbook-report -- --write
```

---

## Operator rhythms (10)

| Rhythm | Owner | Frequency |
|--------|-------|-----------|
| Mon shift handoffs | Ops | Weekly |
| Wed integration health | Ops | Weekly |
| Fri progress sync | Leadership | Weekly |
| W1 metrics baseline | Ops | Monthly |
| W2 feedback → backlog | Product | Monthly |
| W3 improvement loop review | Ops | Monthly |
| W4 product evolution review | Product | Monthly |
| Quarterly governance bundle | Leadership | Quarterly |
| Per release cert bundle | Engineering | Per release |
| Per new pilot isolation | Commercial | Per pilot |

---

## Guardrails (never)

- Hand-edit PASS in `artifacts/*.json`
- Merge GO artifacts across customers
- Skip `test:ci:commercial-pilot-runbook:cert` on release
- Add Step 13+ gates without new era charter

---

## Ops commands

```bash
npm run ops:validate-maintenance-mode -- --json
npm run ops:sync-maintenance-mode-playbook-report -- --write
npm run ops:export-maintenance-mode-rhythm-calendar -- --write
npm run test:ci:maintenance-mode-era24
npm run test:ci:maintenance-mode-era24:cert
```

GitHub workflow: `.github/workflows/ops-maintenance-mode-validate.yml`

Platform anchor: `#maintenance-mode`

---

## Full path summary (FINAL in code)

| Step | Policy | Role |
|------|--------|------|
| 1–9 | `era21-*` | Commercial gate chain |
| 10 | `era22-*` | Ops improvement loop |
| 11 | `era23-*` | Product evolution |
| **12** | **`era24-maintenance-mode-v1`** | **Path complete — maintenance rhythms** |

---

## Step 13 preview — Engineering path terminus

See [`next-step-13-engineering-path-terminus-2026-05-28.md`](./next-step-13-engineering-path-terminus-2026-05-28.md)

**No Step 13 engineering** — era21→era24 stack is the commercial pilot path terminus.

**Immediate action if product evolution inactive:** [`next-step-11-sustained-product-evolution-2026-05-28.md`](./next-step-11-sustained-product-evolution-2026-05-28.md)

**Human blocker for entire path (if still NO-GO):** [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md)
