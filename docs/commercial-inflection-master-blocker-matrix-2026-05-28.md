# Commercial inflection — master blocker matrix

**Date:** 2026-05-28 · **Policy:** `commercial-inflection-readiness-v1`  
**Validate:** `npm run ops:validate-commercial-inflection-readiness -- --json`  
**Orchestrator:** `npm run ops:run-commercial-inflection-readiness-orchestrator -- --write`  
**Report:** `artifacts/commercial-inflection-readiness-report.md`  
**Execution doc:** [`docs/next-step-commercial-inflection-execution-2026-05-28.md`](./next-step-commercial-inflection-execution-2026-05-28.md)  
**Platform UI:** `/platform/commercial-pilot-ops#commercial-inflection-readiness`

---

## Executive summary

KitchenOS is **demo-grade strong** but **commercial inflection blocked** on human ops credentials and paid pilot proof.

| Metric | Value | Meaning |
|--------|-------|---------|
| Governance score | 100/100 | Era21→24 linear path wired · policies + CI |
| Pilot executable | ~40–66/100 | Honest from blocker matrix — **not market ready** |
| `p0ProofStatus` | `awaiting_ops_credentials` | **11/11 env vars** missing locally |
| GO decision | `NO-GO` | Until P0 + Tier2 + ICP + LOI |
| Integration registry LIVE | 0 | Third-party registry honest |
| Channel registry LIVE | varies | Woo/Shopify need **live smoke PASS**, not catalog LIVE |

**Root cause:** 39 UX cycles before environment proof — inverted priority. **Resume product cycles only after `proof_passed`.**

---

## P0 — human ops vault (cannot be coded away)

Configure in **GitHub Actions secrets** + ops shell (never commit values).

| # | Variable | Unblocks |
|---|----------|----------|
| 1–3 | `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD` | Staging workflows first green |
| 4–8 | `SSO_STAGING_*` (5 vars) | Enterprise SSO IdP staging login |
| 9–11 | `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL` | Woo/Shopify live → canonical order |

**Sequence:** [`docs/era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md) → `npm run smoke:p0-staging-proof-unblock` → expect `proof_passed` in `artifacts/p0-staging-proof-unblock-summary.json`.

---

## P0 — engineering (after vault)

| Item | KitchenOS surface | Honest status |
|------|-------------------|---------------|
| P0 smoke orchestrator | `smoke:p0-staging-proof-unblock` | SKIPPED until vault |
| Live channel ingest | `smoke:woo-shopify-live` | Synthetic CI only pre-PASS |
| SSO SAML/OIDC staging | `smoke:enterprise-sso-idp-staging` | R2 wired · login SKIPPED |
| Tier 2 golden path | `smoke:tier2-staging-golden-path` | Awaiting P0 + manual phases |
| GitHub staging green | `smoke:staging-workflows-first-green` | No evidence URL pre-PASS |

---

## P0 — QA

| Item | Command / artifact |
|------|-------------------|
| Tier 2 Woo→KDS→Packing | [`docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md`](./tier2-staging-golden-path-execution-playbook-2026-05-28.md) |
| KDS Playwright staging URL | GitHub Actions evidence pack |
| **STOP:** SKIPPED as PASS | `artifacts/*.json` discipline |

---

## P0 — PM / GTM

| Item | Surface |
|------|---------|
| ICP + LOI | Era 20 ICP bridge · `smoke:pilot-gono-go` |
| GO/NO-GO → GO | `artifacts/pilot-gono-go-summary.json` |
| Forbidden claims | `smoke:pilot-forbidden-claims-enforcement` |
| **STOP:** new UX cycles | Until `p0ProofStatus: proof_passed` |

---

## P0 — design / marketing (mostly done in product)

| Item | Status in repo |
|------|----------------|
| KDS 15s poll banner | **Done** — `KdsRefreshHonestyBanner` |
| Inventory / loyalty locked UI | **Done** — policy banners |
| Nav hide preview | **Done** — Era 20 scorecard |
| Briefing-first Today | Partial — strip overlap remains P1 |
| Forbidden GTM claims | **Blocked** until P0 PASS |

---

## P1 backlog (post-vault, pre-pilot)

- Universal webhook replay (46 routes)
- Mutation registry expansion (`cert:mutation-registry-linter-era16`)
- Guard-before-query POS/KDS sweep
- Cross-tenant support impersonation E2E
- Commerce + rollback tabletop drills (runbooks exist)
- Pen test before enterprise sales
- Offline POS — **honest defer** in GTM

---

## P2 / P3 (during or after pilot)

- Domain map (614 services) — document only, no refactor pre-PASS
- Briefing telemetry — PostHog `briefing_click` wired (Era 20)
- Realtime KDS (WebSocket/SSE) — roadmap
- QB/Xero live GL — beta registry
- Competitor parity items — see [`docs/competitor-leapfrog-roadmap-2026-05-28.md`](./competitor-leapfrog-roadmap-2026-05-28.md)

---

## Leapfrog moats (sell with proof only)

| Moat | Surface |
|------|---------|
| Integration Health Center | `/dashboard/integration-health` |
| Owner Daily Briefing + GO/NO-GO | `/dashboard/today` |
| Launch Wizard TTV | `/dashboard/launch-wizard` (measure on first pilot) |
| Unified order spine | Order Hub + webhooks |
| Commercial governance | `/platform/commercial-pilot-ops` |

---

## Era24 linear path (engineering orchestration)

Steps 12–16 are **orchestration only** — no substitute for P0 PASS.

| Step | Anchor | Gate |
|------|--------|------|
| 12 | `#maintenance-mode` | Maintenance rhythms |
| 13 | `#engineering-path-terminus` | Master 16-step validate |
| 14 | `#post-terminus-steady-state` | Steady-state tracks |
| 15 | `#commercial-pilot-path-absolute-end` | Path closure |
| 16 | `#linear-path-permanently-closed` | Doc chain + Step 17 forbidden |

All prerequisite milestones (`era25_*` → `steady_state_blocked`) surface in validate JSON when upstream blocked.

---

## Ops orchestration (implemented)

```bash
npm run ops:validate-commercial-inflection-readiness -- --json
npm run ops:run-commercial-inflection-readiness-orchestrator -- --json
npm run ops:sync-commercial-inflection-readiness-report -- --write
npm run test:ci:commercial-inflection-readiness
```

Workflow: `.github/workflows/ops-commercial-inflection-readiness-validate.yml`

Step 17 guard surfaces `era25_sustained_ops_convergence_blocked` until vault + linear prerequisites clear — then redirects to inflection validate for market blockers.

---

## Next engineering slice

After human P0 PASS: run full release train in [`docs/next-step-master-execution-2026-05-28.md`](./next-step-master-execution-2026-05-28.md) and capture real artifacts — then pilot Week 1 execution (Era 21 Step 4).
