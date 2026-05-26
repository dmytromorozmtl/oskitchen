# Executive brand &amp; location comparison

Route: `/dashboard/executive/brands-locations`.

Permission: `executive.read.brand_location` (owner, manager, admin,
accountant, sales, superadmin).

## Source

```ts
prisma.order.groupBy({
  by: ["brandId"],
  where: { ...whereOrdersInWindow, brandId: { not: null } },
  _sum: { total: true },
  _count: { _all: true },
});
```

Same logic for `locationId`. Names are resolved with a follow-up
`brand.findMany` / `location.findMany`.

## Single-brand / single-location workspaces

When `brandCount ≤ 1` or `locationCount ≤ 1`, the corresponding table
still renders but with a short description noting that comparison is
not meaningful. We do **not** synthesise placeholder brands /
locations.

## Caveat

`groupBy` does not currently filter cancelled orders out of revenue
sums. For executive-level glance views this matches the rest of the
dashboard (which uses `total` directly for groupBy aggregates) — the
**net** revenue KPI on the overview page is the authoritative number
and *does* exclude cancellations.
