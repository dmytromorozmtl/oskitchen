# Packing QA checklist

- [ ] Empty state copy per `BusinessType` (meal prep, restaurant, café, bakery, catering, bar, ghost).
- [ ] `?date=` changes packing day; tasks load for batch/wave date match.
- [ ] `?mode=` switches generator mode without errors.
- [ ] `?fulfillment=` filters order list only.
- [ ] Generate queue idempotent (no duplicate lines for same order item).
- [ ] Mark packed / verified refreshes KPIs.
- [ ] Log label printed toggles disabled state after first log.
- [ ] Exports tab still produces PDF + CSV when orders exist.
- [ ] `/dashboard/packing/verify` still loads and scans.
- [ ] `/dashboard/nutrition-labels` reachable from Labels tab.
- [ ] `/dashboard/packing/reports` renders counts.
- [ ] `npm run typecheck` and `npm run build` pass.
- [ ] Superadmin (`workspace.moroz@gmail.com`) still has global bypass (unchanged platform rule).
