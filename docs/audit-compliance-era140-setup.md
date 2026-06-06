# Audit & Compliance smoke setup (Era 140)

Era 140 certifies Audit & Compliance wiring: SOC2-ready audit trail with retention, redaction, export, and control readiness scorecard.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/audit-service.ts` | Dashboard loader — KPIs, retention, critical events |
| `lib/enterprise/audit-compliance-builders.ts` | SOC2 controls, category breakdown, compliance score |
| `lib/enterprise/audit-compliance-policy.ts` | Policy id, route, SOC2 controls, categories |
| `app/dashboard/enterprise/audit/page.tsx` | Enterprise audit & compliance page |
| `components/enterprise/audit-compliance-panel.tsx` | Scorecard, SOC2 controls, category table, critical events |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:audit-compliance-era140` | Full era140 cert + wiring audit |
| `npm run test:ci:audit-compliance-era140` | Era140 + ENT-67 unit tests |
| `npm run test:ci:audit-compliance-era140:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Enterprise → Audit & Compliance**.
2. Review compliance score and 30-day event counts.
3. Inspect **SOC 2 control readiness** — CC6/CC7 evidence.
4. Check **Category breakdown** and **Recent critical & warning events**.
5. Run `npm run smoke:audit-compliance-era140` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `audit_trail` | Workspace-scoped auditLog queries + KPIs |
| `soc2_controls` | Five CC6/CC7 readiness checks |
| `retention_export` | Retention policy + auditor CSV/JSON exports |

## Artifact

Summary written to `artifacts/audit-compliance-smoke-summary.json` (gitignored).
