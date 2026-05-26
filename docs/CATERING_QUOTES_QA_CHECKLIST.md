# Catering Quotes — QA Checklist

## Smoke

- [x] `npm run typecheck` passes.
- [x] `npm run build` produces the 11 `/dashboard/catering-quotes/*`
  routes and the public `/quote/[token]` route.

## Manual

| # | Step | Expected |
|---|------|----------|
| 1 | Open `/dashboard/catering` and submit the legacy form | A new quote appears in `/dashboard/catering-quotes`, with a `Q-YYYY-NNNN` number; a CRM timeline event is added |
| 2 | Open `/dashboard/catering-quotes/new` and complete the wizard | Redirects to the new quote's detail page |
| 3 | Add and remove lines on the detail page | Total and per-person price recompute |
| 4 | Edit fees and save | Total recomputes |
| 5 | Rotate the public link | URL changes; the old URL 404s |
| 6 | Revoke the public link | Public page shows "This proposal link has been revoked" |
| 7 | Visit the public link in incognito | Status badge flips to "viewed" in the dashboard; a `CateringProposalView` row exists; no internal notes/costs/margins visible |
| 8 | Change status DRAFT → READY_TO_SEND → SENT → VIEWED → ACCEPTED | Each transition succeeds; an audit event is written each time |
| 9 | Try DRAFT → CONVERTED_TO_ORDER | Rejected (invalid transition) |
| 10 | Convert an `ACCEPTED` quote with a product-linked line | Draft order created with `PENDING` status, notes include allergy + dietary text |
| 11 | Try to convert the same quote again | Blocked: `Quote already has a converted order` |
| 12 | Add a follow-up; mark it done on `/dashboard/catering-quotes/follow-ups` | Counter decreases |
| 13 | Save a template from the templates page | Template appears under "Saved templates" |
| 14 | Check `/dashboard/catering-quotes/reports` | KPIs + breakdowns render without 500s |

## Negative cases

- Submit the wizard with no customer email — Zod blocks.
- Submit a quote line with negative unit price — Zod blocks.
- Visit `/quote/anything-invalid` — 404.
- Visit a `revoked-…` token — shows revoked screen.
