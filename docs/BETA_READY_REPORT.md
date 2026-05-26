# Beta program — readiness report

## What shipped

- **Unified pipeline** — `/dashboard/beta-applications` reads `beta_leads` (public `/beta` already wrote here). Legacy `beta_applications` count shown for transparency.
- **Schema** — `BetaProgramStage`, extended lead scoring columns, cohorts, invitations, structured feedback (`prisma/migrations/20260531120000_beta_program_operations_center`).
- **Services** — `services/beta/*` for snapshot analytics, scoring refresh, cohort seeding, onboarding readiness dimensions, email helpers, funnel builders.
- **Libs** — `lib/beta/*` for permissions (Growth gate), pipeline labels, tags, cohort templates, fit scoring, heuristic founder insights.
- **Dashboard** — Founder command center with KPIs, Recharts, enterprise inbox (bulk + drawer), pipeline columns, cohort assignment, email actions.
- **Public** — Premium `/beta` layout + progressive form (tabs, autosave draft, expanded qualification fields, UTM passthrough).
- **Permissions & nav** — `gtmSurfaceAccess` aligns Growth + Beta visibility for platform GTM roles and superadmin; `workspace.moroz@gmail.com` unchanged.
- **Docs** — Audit, architecture, scoring, cohorts, onboarding, analytics, email, feedback, permissions, public page, QA checklist (this report).

## Architecture snapshot

Applicant → `submitBetaApplication` → scored `BetaLead` → founder UI (`getBetaOperationsSnapshot`) → optional emails / invitations / cohort assignment → (future) product telemetry loop.

## Scoring

Heuristic multi-axis scoring with Growth parity on the primary fit score; stored columns power dashboard badges and sorting.

## Onboarding

Readiness dimensions computed from text/JSON fields; estimated onboarding days persisted for triage.

## Cohorts

Automatic seed cohorts; assignments via drawer select; churn-by-cohort table when data exists.

## Analytics

Weekly signup trend, industry mix, acquisition mix, lifecycle funnel, feature token frequency — all server-rendered snapshot.

## Automation

Text emails via Resend when configured; invitation rows created on approval send.

## Lifecycle

`BetaProgramStage` enum covers full founder pipeline; soft transition rules in `beta-qualification-service.ts`.

## Feedback loop

`BetaFeedback` model + service ready; UI composer is the main remaining wiring.

## Founder workflows

Overview → triage inbox → cohort assignment → stage progression → email → notes.

## GTM integrations

Deep links to Growth CRM routes; shared permission fabric; UTM + source alignment.

## Performance

Snapshot loads ≤120 leads for table/drawer; migrate to cursor pagination when inbound volume grows.

## Limitations

- No automatic workspace linkage or activation telemetry yet.
- Kanban uses stage selects vs drag-drop.
- Geography “heatmap” not visualized (country text only).
- LLM insights not connected (heuristic pack only).
- `BetaApplication` legacy table not auto-migrated.

## Recommendations

1. Run `npx prisma migrate deploy` in each environment.
2. Wire subscription + usage events to auto-advance `CONVERTED` / `ACTIVATED`.
3. Add `@dnd-kit` lane dragging + optimistic UI.
4. Add structured feedback composer + roadmap linking.
