# Production packing handoff

## Data flags

- `requiresPacking`, `requiresLabel`, `allergenWarning` on `ProductionWorkItem`.
- Status `PACK_HANDOFF` indicates line is ready for packing team pickup.

## Kitchen Screen

Dedicated **Pack handoff** button moves eligible items to `PACK_HANDOFF`.

## Target automation

1. Completed production (`DONE` with packing required) optionally creates rows in packing module.
2. Label print triggers reuse existing label pipeline with order traceability.
3. Allergen label text flows from work item to packing slip.

## Audit

Use `ProductionWorkEvent` types (e.g. `SENT_TO_PACKING`) when automation lands — extend enum in Prisma with additive migration.
