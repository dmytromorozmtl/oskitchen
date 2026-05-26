# Beta program architecture

## Layers

1. **Public surface** — `app/beta/page.tsx` + `components/beta/beta-lead-form.tsx` → `actions/beta.ts`.
2. **Persistence** — `BetaLead` (canonical), `BetaCohort`, `BetaInvitation`, `BetaFeedback`; legacy `BetaApplication`.
3. **Services** — `services/beta/*` for scoring refresh, cohort seeding, onboarding readiness math, email helpers, funnel math.
4. **Libs** — `lib/beta/*` for permissions (Growth gate), pipeline labels, tags, cohort templates, fit scoring, founder insights.
5. **Dashboard** — `app/dashboard/beta-applications/*` + `components/beta/beta-operations-center.tsx` (server snapshot + client UX).
6. **GTM ecosystem** — Same permission fabric as Growth; links to `/dashboard/growth/*` for adjacent workflows.

## Data flow

```
/beta (form) → submitBetaApplication → beta_leads (+ scores)
/dashboard/beta-applications → getBetaOperationsSnapshot → UI
mutations → actions/beta-operations.ts → revalidatePath
```

## Non-goals (this iteration)

- Product telemetry–driven activation (requires workspace linkage).
- Full drag-and-drop Kanban (stage select shipped; DnD ready via `@dnd-kit`).
- LLM insights (heuristic pack in `lib/beta/beta-insights.ts`).
