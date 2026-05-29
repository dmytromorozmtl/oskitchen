# KitchenOS — Шаг 12: Maintenance mode (commercial pilot path complete)

**Status:** IMPLEMENTED (2026-05-28) — era25 sustained-ops gate wired into Step 12 prerequisites, validate JSON, orchestrator milestones, UI/panel, CI integration tests.

**Policy:** `era24-maintenance-mode-v1` · **Orchestrator:** `era24-maintenance-mode-post-product-evolution-orchestrator-v1` · **Backlog:** `KOS-E24-012`  
**Предусловие:** era25 `sustained_operational_excellence_convergence_era25_ready` → Step 11 product evolution → GO  
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
         Repeat forever — Step 13 is engineering terminus (no code gates)
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
npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --json   # productEvolutionMilestone: product_evolution_healthy
npm run ops:validate-sustained-product-evolution -- --json   # productEvolutionReady: true
npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write
npm run ops:validate-maintenance-mode -- --json
npm run ops:export-maintenance-mode-rhythm-calendar -- --write
npm run ops:sync-maintenance-mode-playbook-report -- --write
```

**Post-product-evolution orchestrator milestones (`maintenanceModeMilestone`):**

| Milestone | Meaning | Exit code (orchestrator `--json`) |
|-----------|---------|-----------------------------------|
| `era25_sustained_ops_convergence_blocked` | era25 sustained ops convergence not ready | `2` |
| `product_evolution_blocked` | Step 11 not ready (era25 OK) | `2` |
| `attention_weekly_rhythm` | Mon/Wed/Fri operator rhythms due | `0` |
| `attention_monthly_cadence` | W1–W4 monthly cadence due | `0` |
| `maintenance_mode_healthy` | All measurable rhythms current | `0` |

**Smoke readiness flags in validate JSON (informational):**

- `readyForWeeklyRhythmSmokes`: maintenance active + `weekly_wed_integration_health` overdue/due soon
- `readyForMonthlyCadenceSmokes`: maintenance active + `monthly_w1_metrics_baseline` or `monthly_w2_feedback_triage` overdue/due soon

**Guidance rhythms (manual cadence):** quarterly governance · per release cert · per new pilot isolation — no automatic milestone.

**Product surfaces when maintenance mode active:**

| Surface | Expected |
|---------|----------|
| `/dashboard/today` | Maintenance compact panel (slate, path complete stack top) |
| `/platform/commercial-pilot-ops` | `#maintenance-mode` panel + engineering path terminus catalog |
| `/dashboard/order-hub` | Mon shift handoffs |
| `/dashboard/integration-health` | Wed integration review |
| `/dashboard/reports` | W1 metrics + W2 feedback triage |

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
npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write
npm run ops:validate-maintenance-mode -- --json
npm run ops:sync-maintenance-mode-playbook-report -- --write
npm run ops:export-maintenance-mode-rhythm-calendar -- --write
npm run test:ci:maintenance-mode-era24
npm run test:ci:maintenance-mode-era24:cert
```

GitHub workflow: `.github/workflows/ops-maintenance-mode-validate.yml` (includes orchestrator step with `continue-on-error: true`)

Platform anchor: `#maintenance-mode`

**Playbook artifact:** `artifacts/maintenance-mode-playbook-report.md` (generated via sync script)

**Rhythm calendar:** `docs/maintenance-mode-rhythm-calendar-era24.md` (generated via export script)

---

## Deliverables checklist

- [ ] Weekly Mon/Wed/Fri rhythms executed per customer
- [ ] Monthly W1–W4 cadence reviewed on Platform ops
- [ ] Integration smokes re-run after credential rotation
- [ ] `artifacts/maintenance-mode-playbook-report.md` synced weekly
- [ ] `docs/maintenance-mode-rhythm-calendar-era24.md` updated on process change
- [ ] Release train includes `test:ci:commercial-pilot-runbook:cert`

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

**Next engineering slice (Step 13 — master orchestration only, no new gates):**

| Component | Artifact |
|-----------|----------|
| Orchestrator lib | `lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24.ts` |
| Policy | `era24-engineering-path-terminus-post-maintenance-mode-orchestrator-v1` |
| Milestones | `maintenance_mode_blocked` → gate/informational attention → `engineering_path_terminus_healthy` |
| Master validate | `ops:validate-commercial-pilot-path -- --json` |
| Status report | `ops:sync-commercial-pilot-path-status-report -- --write` |
| UI catalog | `#engineering-path-terminus` inside maintenance panel (already wired) |
| Briefing | **No new priority** — visible when Step 12 maintenance mode active |

**Human gate before Step 13:** `maintenanceModeMilestone: maintenance_mode_healthy` OR weekly/monthly rhythms refreshed via smokes.

**Immediate action if product evolution inactive:** [`next-step-11-sustained-product-evolution-2026-05-28.md`](./next-step-11-sustained-product-evolution-2026-05-28.md)

**Human blocker for entire path (if still NO-GO):** [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md)
