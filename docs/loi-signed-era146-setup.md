# First design partner LOI signed setup (Era 146)

Era 146 certifies the first countersigned design partner LOI: signed record, design partner profile, and pilot GO/NO-GO gate wiring.

## Wiring surfaces

| Path | Role |
|------|------|
| `docs/loi-signed.md` | Internal signed LOI record — LOI-DP-001 Riverbend Commissary LLC |
| `docs/loi-design-partner-template.md` | Master LOI template |
| `docs/loi-template-walkthrough.md` | Live-call review guide |
| `lib/commercial/loi-signed-era73-policy.ts` | Canonical era73 policy constants |
| `lib/commercial/pilot-gono-go-era17-policy.ts` | Commercial GO/NO-GO policy |
| `scripts/smoke-pilot-gono-go-era17.ts` | Pilot GO/NO-GO smoke orchestrator |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:loi-signed-era146` | Full era146 cert + wiring audit |
| `npm run test:ci:loi-signed-era146` | Era146 + era73 + walkthrough tests |
| `npm run test:ci:loi-signed-era146:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pilot-gono-go` | Commercial GO after PILOT_GONOGO_* env set |

## Human activation

1. Archive countersigned LOI PDF in legal evidence folder (not git).
2. Confirm `docs/loi-signed.md` — LOI-DP-001, effective 2026-06-05.
3. Set `PILOT_GONOGO_CUSTOMER_NAME=Riverbend Commissary LLC` and `PILOT_GONOGO_LOI_SIGNED_DATE=2026-06-05`.
4. Provision staging workspace `riverbend-commissary` and Week 0 kickoff.
5. Run `npm run smoke:pilot-gono-go` — commercial GO artifact.
6. Run `npm run smoke:loi-signed-era146` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `signed_loi_record` | docs/loi-signed.md + era73 policy |
| `design_partner_profile` | Riverbend Commissary LLC commissary + pickup |
| `pilot_gono_go_gate` | smoke:pilot-gono-go after PILOT_GONOGO_* env |

## Artifact

Summary written to `artifacts/loi-signed-era146-smoke-summary.json` (gitignored).

See also: [loi-signed.md](./loi-signed.md) · [loi-design-partner-template.md](./loi-design-partner-template.md)
