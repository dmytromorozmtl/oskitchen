# Production QA checklist

Run after changes to production, kitchen, orders, or Prisma schema.

## Empty states

- [ ] Each `BusinessType` shows correct empty title/description (via `productionEmptyStateForBusiness`).
- [ ] Generate CTAs submit without JS errors.

## Generation

- [ ] Menu generation: products with `preparedDate` today create batch + items; rerunning skips duplicates.
- [ ] Order generation: creates items; skips duplicate open order lines.
- [ ] Empty product set leaves no orphan batch.

## Command center

- [ ] Date change updates URL and data.
- [ ] Each `view` tab loads via query param.
- [ ] Board status select updates DB and refreshes UI.
- [ ] Prep list grouping sane with mixed null stations.

## Kitchen screen

- [ ] Open work items appear with Start/Complete/Handoff.
- [ ] Legacy product tasks still render when present.

## Permissions

- [ ] Other user cannot mutate work items (userId scope).
- [ ] Platform superadmin rules unchanged (existing auth).

## Regression

- [ ] Orders page unchanged.
- [ ] Menu items / products edit unchanged.
- [ ] Packing/labels flows for legacy `ProductionTask` unchanged.

## Build

- [ ] `npm run typecheck`
- [ ] `npm run build`
