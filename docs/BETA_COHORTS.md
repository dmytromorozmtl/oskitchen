# Beta cohorts

## Model

`BetaCohort` stores launch metadata (`name`, `launchDate`, `targetVertical`, `targetRegion`, `notes`, `active`).

`BetaLead.betaCohortId` assigns applicants to a cohort.

## Seeding

`ensureSeedCohortsIfEmpty` creates three starter cohorts when the table is empty (meal prep, ghost kitchen, catering).

## Templates

`lib/beta/beta-cohorts.ts` lists narrative templates founders can copy when creating additional cohorts in Prisma Studio or a future admin UI.

## Metrics (roadmap)

Track per cohort: activation %, feedback density, churn — partially supported via `churnByCohort` in the snapshot when cohort assignments exist.
