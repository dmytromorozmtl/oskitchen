# Era 20 Cycle Completion Scorecard (In Progress)

**Date:** 2026-05-28 · **HEAD:** `70a467b` + post-audit hardening · **Cycles:** 18 executed (proof wiring); Band A **not complete**

## Band A — P0 proof (blocked)

| Cycle | Goal | Status |
|------:|------|--------|
| 1 | First paid pilot package | **Done** — `era20-first-paid-pilot-package-v1` |
| 2 | GO/NO-GO taxonomy fix | **Done** |
| 3 | Operator golden path crosswalk | **Done** — Tier 2 awaiting execution |
| 4–8 | P0 PASS, SSO, channel, staging, Tier 2, GO | **Blocked** — 11 env vars |

## Product hardening (post-audit, 2026-05-28)

| Item | Status |
|------|--------|
| Nav hide preview (~40% IA) | **Done** — preview hidden unless Show all modules |
| Briefing click telemetry | **Done** — PostHog `briefing_click` |
| Cashier speed mode default | **Done** — `resolvePosCashierSpeedMode` |
| KDS refresh honesty banner | **Done** — 15s poll aligned |
| Inventory / loyalty locked UI | **Done** — policy banners |
| Launch Wizard primary entry on go-live | **Done** |
| Public API scope picker + scopesJson | **Done** |
| Mutation registry +3 domains | **Done** — orders, pos, packing |
| P0 vault validator script | **Done** — `npm run ops:validate-p0-vault-env` |
| Support impersonation E2E scaffold | **Done** — skips without creds |

## Success criteria (Era 20 closure)

| Criterion | Met? |
|-----------|------|
| `p0ProofStatus: proof_passed` | **No** |
| GO/NO-GO → GO + customer | **No** |
| Pilot ≥30 days | **No** |
| Pilot metrics baseline PASSED | **No** |

**Next:** Configure ops vault → `smoke:p0-staging-proof-unblock` → ICP + LOI → GO.
