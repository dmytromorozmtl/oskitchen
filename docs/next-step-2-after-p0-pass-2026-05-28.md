# OS Kitchen — Шаг 2 после P0 PASS (28 May 2026)

**Предусловие:** `artifacts/p0-staging-proof-unblock-summary.json` → `p0ProofStatus: "proof_passed"`  
**Цель:** Tier 2 golden path PASS → commercial GO → Pilot Week 1

---

## Decision tree (шаг 2)

```
proof_passed (P0)
        │
        ▼
smoke:tier2-staging-golden-path
        │
        ├── child: woo-shopify-live PASS
        ├── child: staging-workflows-first-green PASS
        └── manual: Order Hub → KDS → Packing
                │
                ▼
   tier2ProofStatus: proof_passed
                │
                ├── ICP JSON (real prospect)
                ├── signed LOI
                └── smoke:pilot-gono-go → GO
                        │
                        ▼
                 Pilot Week 1 launch
```

---

## День 1 после P0 PASS — QA + Integrations

### Утро (2 ч) — automated

```bash
npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write
npm run ops:validate-p0-vault-env -- --json
npm run ops:validate-tier2-golden-path-env -- --json
npm run smoke:tier2-staging-golden-path -- --checklist-only
npm run ops:export-tier2-golden-path-env-template -- --write
npm run ops:sync-tier2-golden-path-progress-report -- --write
npm run ops:export-tier2-golden-path-readiness-checklist -- --write

export PILOT_GOLDEN_PATH_STAGING_URL="$E2E_STAGING_BASE_URL"
export PILOT_GOLDEN_PATH_OPERATOR_EMAIL="$E2E_LOGIN_EMAIL"
export PILOT_GOLDEN_PATH_COMMIT_SHA="$(git rev-parse HEAD)"

npm run smoke:tier2-staging-golden-path
```

**Acceptance:** child smokes exit 0; artifact `tier2-staging-golden-path-summary.json` created (may still `awaiting_manual_phases`).

### День (3–4 ч) — manual golden path

Playbook: [`tier2-staging-golden-path-execution-playbook-2026-05-28.md`](./tier2-staging-golden-path-execution-playbook-2026-05-28.md)

| # | Действие | UI | Evidence |
|---|----------|-----|----------|
| 1 | Live webhook order | Staging Woo/Shopify store | Order in Order Hub |
| 2 | KDS bump | `/dashboard/kitchen` | Ticket bumped |
| 3 | Packing complete | `/dashboard/packing` | Terminal status |
| 4 | KDS Playwright | GitHub Actions | Green run URL |

```bash
export TIER2_CHANNEL_WEBHOOK_MANUAL=PASSED
export TIER2_KDS_BUMP_MANUAL=PASSED
export TIER2_PACKING_COMPLETE_MANUAL=PASSED
export GITHUB_KDS_STAGING_RUN_URL="https://github.com/.../actions/runs/..."
export GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED

npm run smoke:tier2-staging-golden-path
```

**Acceptance:** `tier2ProofStatus: proof_passed`, `overall: PASSED`.

**Next:** [`next-step-3-after-tier2-pass-2026-05-28.md`](./next-step-3-after-tier2-pass-2026-05-28.md) — ICP + LOI + GO + Pilot Week 1.

---

## День 2 — Commercial (parallel)

### ICP qualification (real prospect)

1. Copy [`config/commercial/pilot-icp-prospect-draft.template.json`](../config/commercial/pilot-icp-prospect-draft.template.json)  
2. Fill `_prospectMeta` + boolean gates (no forbidden requirements)  
3. Export:

```bash
export PILOT_GONOGO_ICP_INPUT_JSON="$(cat path/to/your-prospect.json)"
npm run smoke:pilot-gono-go
```

**Acceptance:** `icp_qualification` gate PASS (still need LOI for GO).

### LOI + pilot package

- Pilot SKU: $500–2500/mo hypothesis per [`era20-first-paid-pilot-package-2026-05-28.md`](./era20-first-paid-pilot-package-2026-05-28.md)  
- Signed LOI before GO artifact  
- Sales: [`sales-forbidden-claims-training-era20.md`](./sales-forbidden-claims-training-era20.md)

---

## День 3 — GO decision

```bash
npm run smoke:pilot-gono-go
```

**Acceptance:** GO artifact; all evidence gates green with **real URLs** in artifact JSON.

---

## Engineering P1 (starts after GO, not before Tier 2)

| Item | Command / action |
|------|------------------|
| Webhook replay expansion | `npm run smoke:webhook-replay-p1-expansion` |
| Commerce webhook drill | `npm run smoke:commerce-webhook-drill` — **execute** |
| Support impersonation E2E | `npx playwright test e2e/support-impersonation-tenant-isolation.spec.ts` |
| Rollback tabletop | `npm run smoke:pilot-rollback-drill` with real participants |
| Mutation registry | Incremental POS/KDS entries |

---

## Product / UX (already in code — verify on staging)

| Surface | Verify after P0 PASS |
|---------|----------------------|
| `/dashboard/launch-wizard` | Tier 2 phased panel + commercial blocker `tier2-staging-blocked` |
| `/dashboard/today` | Top action #1 «Tier 2 golden path» + compact phases panel |
| `/dashboard/integration-health` | Tier 2 golden path banner (replaces P0 banner) |
| Platform → Pilot ops | Tier 2 phases panel alongside artifact row |
| `npm run ops:validate-tier2-golden-path-env` | Phase checklist JSON without fake PASS |

| Item | Verify |
|------|--------|
| Launch Wizard primary nav | Go-live hidden unless "Show all modules" |
| Owner Daily Briefing | Top 3 ranked actions cap |
| Integration Health owner mode | Compact view for OWNER |
| Reports next actions | `/dashboard/reports` recommended cards |
| KDS 15s poll banner | Visible on `/dashboard/kitchen` |
| POS permission-denied | All POS subpages use universal card |

---

## Шаг 3 (после GO) — Pilot Week 1

| Day | Focus |
|-----|-------|
| 1 | TTV timed onboarding study (Launch Wizard start → first order) |
| 2–3 | Daily Owner Briefing review + Integration Health |
| 4 | POS shift closeout drill |
| 5 | Week 1 metrics baseline (`smoke:pilot-metrics-baseline`) |

**Deliverable:** case study draft + investor one-pager v3 with real KPIs.

---

## Immediate action (если P0 ещё не PASS)

→ [`p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md)  
→ `npm run ops:export-p0-vault-env-template -- --write`
