# OS Kitchen — Шаг 8: Market leader positioning (после Series A / partner expansion complete)

**Policy:** `era21-market-leader-positioning-v1` · **Backlog:** `KOS-E21-008`  
**Предусловие:** Series A / partner expansion tracks A–D complete  
**Цель:** Category-defining narrative + competitive moat articulation + expansion GTM at scale

---

## Decision tree

```
Series A complete (era21 Series A panels hidden)
        │
        ├── Pillar 1: Category narrative (ghost kitchen + meal prep OS)
        ├── Pillar 2: Competitive moat proof (integration + operator UX + resilience)
        ├── Pillar 3: Analyst / press kit (honest maturity, no overclaim)
        └── Pillar 4: Expansion revenue motion (second location, SKU, partner referrals)
                │
                ▼
         Sustained operational excellence (Step 9 — final gate chain end)
```

---

## Engineering wiring (era21)

| Surface | When visible |
|---------|--------------|
| `/dashboard/today` | Top action priority **7** + compact market leader panel |
| `/dashboard/launch-wizard` | Market leader pillars in commercial blockers |
| Platform → Pilot ops | `#market-leader-positioning` phases panel |

**Gate chain (mutually exclusive):** P0 (0) → Tier2 (1) → GO (2) → Week1 (3) → Month2 (4) → Scale (5) → Series A (6) → **Market leader (7)**.

**Blocking pillars:** 1–4. After complete → **operational mode** (no commercial gate panels).

---

## Preflight

```bash
npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write
npm run ops:validate-series-a-partner-expansion-env -- --json   # seriesAComplete: true
npm run ops:validate-market-leader-positioning-env -- --json
npm run ops:export-market-leader-positioning-env-template -- --write
npm run ops:sync-market-leader-positioning-progress-report -- --write
npm run ops:export-market-leader-positioning-readiness-checklist -- --write
npm run smoke:competitor-feature-gap-matrix
npm run smoke:investor-narrative-onepager
npm run test:ci:commercial-pilot-runbook:cert
```

**Post-Series A orchestrator milestones (`marketLeaderMilestone`):**

| Milestone | Pillar | Exit code (orchestrator `--json`) |
|-----------|--------|-----------------------------------|
| `series_a_blocked` | Series A tracks A–D incomplete | `2` |
| `pillar1_category_narrative` | category narrative + case study approval | `0` |
| `pillar2_competitive_moat_proof` | P0 + Tier2 + rollback + Week 1 UX | `0` |
| `pillar3_analyst_press_kit` | analyst kit + data room bundle | `0` |
| `pillar4_expansion_revenue_motion` | expansion revenue playbook | `0` |
| `market_leader_complete` | Pillars 1–4 done | `0` |

**Product surfaces active after Series A complete (market leader incomplete):**

| Surface | Expected |
|---------|----------|
| `/dashboard/today` | Market leader ranked action (priority 7) + compact panel |
| `/dashboard/launch-wizard` | Market leader pillars in commercial blockers |
| Platform → Pilot ops | `#market-leader-positioning` panel |
| `/solutions/ghost-kitchens` + `/solutions/meal-prep` | category narrative |
| `/dashboard/integration-health` | moat integration depth |

---

## Pillar 1 — Category narrative

| Deliverable | Source |
|-------------|--------|
| Positioning one-liner | `docs/competitor-leapfrog-roadmap-2026-05-28.md` |
| ICP proof | `artifacts/pilot-gono-go-summary.json` + case study draft |
| Vertical pages | `/solutions/ghost-kitchens`, `/solutions/meal-prep` |

```bash
npm run smoke:pilot-case-study-draft
export PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed
export MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED=1
```

**Forbidden:** "Market leader" without third-party validation or published case study with customer approval.

---

## Pillar 2 — Competitive moat proof

| Moat | Evidence |
|------|----------|
| Integration depth | P0 + Tier2 + Integration Health honest status |
| Operator UX | Pilot Week 1 TTV + POS closeout |
| Resilience | Rollback drill + webhook replay proofs |

```bash
npm run smoke:pilot-rollback-drill
npm run smoke:commerce-webhook-drill
export PILOT_WEEK1_TTV_HOURS=6
export PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass
export MARKET_LEADER_MOAT_DECK_REVIEWED=1
```

---

## Pillar 3 — Analyst / press kit

```bash
npm run smoke:pilot-forbidden-claims-enforcement
npm run smoke:investor-narrative-onepager
export MARKET_LEADER_ANALYST_KIT_PUBLISHED=1
```

- Honest feature matrix: `docs/feature-maturity-matrix.md`
- Prerequisite: `SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED=1`
- No SOC2 / unified inventory / loyalty as shipped unless artifact-backed

---

## Pillar 4 — Expansion revenue motion

```bash
export MARKET_LEADER_EXPANSION_MOTION_REVIEWED=1
```

| Motion | Prerequisite |
|--------|--------------|
| Second location | `SCALE_PER_CUSTOMER_GO_ISOLATION=1` |
| Second SKU / vertical | Month 2 GTM landing reviews |
| Partner referrals | Series A Track B + D complete |

---

## Ops commands

```bash
npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write
npm run ops:validate-market-leader-positioning-env -- --json
npm run ops:export-market-leader-positioning-env-template -- --write
npm run ops:sync-market-leader-positioning-progress-report -- --write
npm run ops:export-market-leader-positioning-readiness-checklist -- --write
npm run test:ci:market-leader-positioning-era21
npm run test:ci:market-leader-positioning-era21:cert
```

GitHub workflow: `.github/workflows/ops-market-leader-positioning-validate.yml` (includes orchestrator step with `continue-on-error: true`)

**Readiness checklist artifact:** `docs/market-leader-positioning-readiness-checklist.md` (generated via export script — do not hand-edit PASS states)

---

## Deliverables checklist

- [ ] Category narrative doc reviewed by founder + sales
- [ ] Competitive moat slide deck with artifact citations
- [ ] Analyst kit with honest maturity disclaimers
- [ ] Expansion playbook tied to pilot #1 real metrics
- [ ] No hand-edited PASS in `artifacts/*.json`
- [ ] `artifacts/market-leader-positioning-progress-report.md` synced
- [ ] `docs/market-leader-positioning-readiness-checklist.md` exported via orchestrator

---

## Step 9 preview — Sustained operational excellence (orchestrator plan)

See [`next-step-9-sustained-operational-excellence-2026-05-28.md`](./next-step-9-sustained-operational-excellence-2026-05-28.md)

**Next engineering slice (Step 9 — final era21 gate chain):**

| Component | Planned artifact |
|-----------|------------------|
| Orchestrator lib | `lib/commercial/sustained-operational-excellence-post-market-leader-orchestrator-era21.ts` |
| Policy | `era21-sustained-operational-excellence-post-market-leader-orchestrator-v1` |
| Milestones | `market_leader_blocked` → `cadence_a_daily_ops` → `cadence_b_weekly_integration` → `cadence_c_monthly_metrics` → `cadence_d_quarterly_audit` → `sustained_ops_complete` |
| Ops scripts | `ops:run-sustained-operational-excellence-post-market-leader-orchestrator`, `ops:export-sustained-operational-excellence-readiness-checklist` |
| Validate env | add `sustainedOpsMilestone` + `readyForIntegrationSmokes` to JSON |
| UI slice | milestone badge + redirect to Market leader orchestrator when `market_leader_blocked` |
| Briefing priority | **8** (final era21 gate — mutually exclusive with Steps 1–7) |
| CI workflow | orchestrator step in `ops-sustained-operational-excellence-validate.yml` |

**Human gate before Step 9:** all Market leader pillars 1–4 complete — `marketLeaderComplete: true`. After Step 9 → **pure operational mode** (no era21 gate panels).

**Immediate action if Series A incomplete:** [`next-step-7-series-a-partner-expansion-2026-05-28.md`](./next-step-7-series-a-partner-expansion-2026-05-28.md)
