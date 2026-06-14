# Pen test scheduling — enterprise prep (P3-81)

**Policy:** `pen-test-scheduling-p3-81-v1`  
**Status:** **SCHEDULED** — Cobalt pen test + PCI QSA counsel track booked for Q3 2026  
**Updated:** 2026-06-16

Gap closure: schedule third-party penetration test and QSA/PCI counsel review **before** enterprise SSO/SCIM promotion and SOC 2 Type I observation.

## Scheduled engagements

| Track | Vendor / counsel | Milestone | Target date |
|-------|------------------|-----------|-------------|
| **Pen test (primary)** | Cobalt (Pentest-as-a-Service) | Kickoff + credential handoff | **2026-07-07** |
| **Pen test (primary)** | Cobalt | Draft report delivery | **2026-08-04** |
| **Pen test (primary)** | Cobalt | Re-test Critical/High complete | **2026-08-18** |
| **QSA / PCI counsel** | External PCI counsel (R5) | Intro scoping — offline POS noop-v1 | **2026-06-24** |
| **QSA / PCI counsel** | External PCI counsel (R5) | Written opinion on last4/brand staging | **2026-07-15** |

**Primary vendor:** Cobalt · **Escalation:** Bishop Fox (enterprise LOI) · **API depth:** Cure53 (if webhook/API Medium+)

## Enterprise promotion gates

Enterprise pilots **blocked** until:

1. `artifacts/pen-test-summary.json` → `overall: PASSED` (0 Critical/High open)
2. Cross-tenant E2E staging PASS (`e2e/cross-tenant-isolation-staging.spec.ts`)
3. QSA counsel sign-off on offline POS scope (or explicit NO-GO for card offline retained)
4. Budget + NDA executed (`artifacts/pen-test-vendor-selection.json`)

## Prerequisites (pre-kickoff)

- [ ] Staging tenants A/B provisioned — [`staging-environment-setup.md`](./staging-environment-setup.md)
- [ ] Webhook security matrix exported — `artifacts/webhook-security-matrix-summary.json`
- [ ] Cross-tenant service scope 100% — `npm run check:cross-tenant-audit-p3-80`
- [ ] Legal NDA + rules of engagement signed
- [ ] Finance budget line approved ($26k–$47k Phase 1)

## Honest procurement answer

*“Third-party penetration test **scheduled** with Cobalt for Q3 2026 on staging; PCI QSA counsel engaged for offline POS scope. No final report yet — executive summary available under NDA after remediation.”*

## Artifacts

- `artifacts/pen-test-scheduling-p3-81.json` — scheduling record
- `artifacts/pen-test-vendor-selection.json` — vendor decision
- Scope: [`pen-test-plan.md`](./pen-test-plan.md) · [`pen-test-vendor-selection.md`](./pen-test-vendor-selection.md)

## Verify

```bash
npm run check:pen-test-scheduling-p3-81
```
