# KitchenOS — Шаг 3 после Tier 2 PASS (28 May 2026)

**Предусловие:** `artifacts/tier2-staging-golden-path-summary.json` → `tier2ProofStatus: "proof_passed"`  
**Цель:** Commercial GO → signed LOI → Pilot Week 1 → case study

---

## Decision tree

```
tier2ProofStatus: proof_passed
        │
        ├── ICP JSON (real prospect, qualified)
        ├── forbidden claims training acknowledged
        ├── PILOT_GONOGO_CUSTOMER_NAME + LOI date
        └── smoke:pilot-gono-go → GO
                │
                ▼
         Pilot Week 1 (TTV + metrics)
                │
                ▼
    Case study + investor one-pager v3
```

---

## День 1 — Commercial closure

### Preflight tooling

```bash
npm run ops:run-commercial-go-closure-post-tier2-orchestrator -- --write
npm run ops:validate-commercial-go-closure-env -- --json
npm run ops:export-commercial-go-closure-env-template -- --write
npm run ops:sync-commercial-go-closure-progress-report -- --write
npm run ops:export-commercial-go-closure-readiness-checklist -- --write
```

### 1. ICP qualification (real prospect)

Fill [`config/commercial/pilot-icp-prospect-draft.template.json`](../config/commercial/pilot-icp-prospect-draft.template.json):

- `_prospectMeta.companyName`, `contactEmail`, `icpSegment`
- All boolean gates must be **false** for forbidden requirements (SSO production, unified inventory, etc.)

```bash
export PILOT_GONOGO_ICP_INPUT_JSON="$(cat path/to/acme-meal-prep.json)"
```

**Acceptance:** ICP evaluator qualifies; no forbidden requirement flags.

### 2. Pilot package + pricing

- Confirm SKU band ($500–2500/mo) per [`era20-first-paid-pilot-package-2026-05-28.md`](./era20-first-paid-pilot-package-2026-05-28.md)
- Contract uses qualified beta wording only
- Sales completes [`sales-forbidden-claims-training-era20.md`](./sales-forbidden-claims-training-era20.md)

### 3. LOI sign-off

```bash
export PILOT_GONOGO_CUSTOMER_NAME="Harbor Meal Prep LLC"
export PILOT_GONOGO_LOI_SIGNED_DATE="2026-06-XX"
export PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE=1
export PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT=1
```

**Acceptance:** `customerExecutionStatus: recorded` in GO artifact.

### 4. GO decision

```bash
npm run smoke:pilot-forbidden-claims-enforcement
npm run smoke:pilot-gono-go
```

**Acceptance:** `decision: GO` in `artifacts/pilot-gono-go-summary.json`.

---

## День 2–5 — Pilot Week 1

| Day | Owner action | Product surface | Metric |
|-----|--------------|-----------------|--------|
| 1 | Timed Launch Wizard start → first order | `/dashboard/launch-wizard` | TTV (hours) |
| 1 | Owner Daily Briefing review | `/dashboard/today` | briefing_click events |
| 2 | Integration Health check | `/dashboard/integration-health` | channel LIVE rows |
| 3 | POS shift open → sale → close | `/dashboard/pos` | shift closeout PASS |
| 4 | Reports weekly review | `/dashboard/reports` | first export |
| 5 | Week 1 baseline | `smoke:pilot-metrics-baseline` | 6 KPIs recorded |

```bash
npm run smoke:pilot-metrics-baseline
npm run smoke:pilot-case-study-draft
```

---

## Engineering P1 (parallel with pilot, not blocking GO)

| Item | When | Command |
|------|------|---------|
| Webhook replay expansion | Week 1–2 | `npm run smoke:webhook-replay-p1-expansion` |
| Commerce webhook drill | Week 1 | `npm run smoke:commerce-webhook-drill` |
| Support impersonation E2E | Week 2 | Playwright with staging creds |
| Rollback tabletop | Week 2 | `npm run smoke:pilot-rollback-drill` |
| Pen test scheduling | Before enterprise pitch | External vendor |

---

## Product verification checklist (staging)

- [ ] Launch Wizard commercial blockers panel shows **Commercial GO closure** 5-phase checklist
- [ ] Owner Briefing top action «Commercial GO — ICP qualification» when Tier 2 PASS
- [ ] `/dashboard/implementation` — ICP panel + prospect draft path
- [ ] Platform → Pilot ops — commercial GO phases panel
- [ ] Owner Briefing Tier 2 top action when P0 PASS and tier2 blocked
- [ ] Integration Health Tier 2 banner at `#integration-health-tier2-golden-path`
- [ ] Go-live hidden from default nav; accessible via "Show all modules"
- [ ] Owner Briefing top 3 actions capped
- [ ] KDS 15s poll banner visible
- [ ] Inventory/Loyalty locked banners honest
- [ ] Reports next-action cards on `/dashboard/reports`
- [ ] Integration Health P0 phases visible until `proof_passed`

---

## Deliverables (end of Week 1)

1. `artifacts/pilot-metrics-baseline-summary.json` — real numbers  
2. `artifacts/pilot-case-study-draft-summary.json` — draft narrative  
3. TTV documented (< 1 day target vs Square)  
4. GO/NO-GO re-run still **GO**  

---

## Шаг 4 (месяц 2) — market readiness

- Investor one-pager v3 with real KPIs  
- ICP-specific landing pages (ghost kitchen, meal prep)  
- Public API scope picker + rate limits (P2)  
- Offline POS / unified loyalty — **roadmap only**, not sold  
- Table service RFC — beta post-pilot  

---

## Forbidden until case study exists

- "Production-ready platform"  
- "SOC2 certified"  
- "LIVE marketplace"  
- "Unified inventory across channels"  
- References without signed pilot permission  

---

## Immediate action

If Tier 2 not yet PASS → [`next-step-2-after-p0-pass-2026-05-28.md`](./next-step-2-after-p0-pass-2026-05-28.md)

If Tier 2 PASS → fill ICP prospect JSON + schedule LOI signing + run `smoke:pilot-gono-go`.

**After GO:** [`next-step-4-pilot-week1-execution-2026-05-28.md`](./next-step-4-pilot-week1-execution-2026-05-28.md)
