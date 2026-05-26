# Production templates

**Route:** `/dashboard/production/templates`

## Intent

Save reusable stage/station/task bundles:

- Restaurant Daily Prep
- Café Morning Prep
- Bar Prep Checklist
- Bakery Batch Day
- Catering Event Production
- Meal Prep Production Day
- Ghost Kitchen Rush

## Storage

`ProductionTemplate` model: `businessMode`, `mode`, JSON blobs for stages/stations/tasks.

## Current page

Lists template names and shows suggested default `ProductionCommandMode` from workspace business type. Apply/save flows are marked roadmap (no destructive behavior).

## Next

- POST action: instantiate template into batch + work items for a date.
- “Save current day as template” snapshot.
