# First case study setup (Era 148)

Era 148 certifies OS Kitchen's first case study: LOI → Week 1 report evidence chain, internal draft, and publish gate wiring.

## Wiring surfaces

| Path | Role |
|------|------|
| `docs/case-study-1.md` | First case study — Riverbend Commissary internal draft |
| `docs/case-study-template.md` | Long-form case study template |
| `docs/pilot-week1-report.md` | Week 1 KPI evidence parent |
| `docs/loi-signed.md` | LOI-DP-001 signed record parent |
| `lib/marketing/case-study-1-era75-policy.ts` | Canonical era75 policy constants |
| `components/marketing/case-study-detail.tsx` | Public `/customers` detail component |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:case-study-1-era148` | Full era148 cert + wiring audit |
| `npm run test:ci:case-study-1-era148` | Era148 + era75 + template tests |
| `npm run test:ci:case-study-1-era148:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pilot-case-study-draft-era17` | Pilot case study draft artifact |

## Human activation

1. Confirm Week 1 report with CONDITIONAL PASS KPIs on file.
2. Fill `docs/case-study-1.md` — all 10 long-form sections from template.
3. Keep status **internal draft** until written partner approval.
4. Set `PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed` before public publish.
5. Run `npm run smoke:pilot-case-study-draft-era17` — draft artifact.
6. Run `npm run smoke:case-study-1-era148` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `internal_draft_case_study` | docs/case-study-1.md + era75 policy |
| `week1_evidence_chain` | LOI → Week 1 report → case study linkage |
| `publish_gate` | PILOT_CASE_STUDY_CUSTOMER_APPROVAL before /customers |

## Artifact

Summary written to `artifacts/case-study-1-era148-smoke-summary.json` (gitignored).

See also: [case-study-1.md](./case-study-1.md) · [case-study-template.md](./case-study-template.md)
