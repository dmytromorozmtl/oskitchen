# Implementation checklist templates

Source: `lib/implementation/implementation-checklists.ts`.

Each template defines a set of `ChecklistSeed` items keyed by
business type. A seeded item carries:

- `title`, `description`
- `phaseKey` — which phase it belongs to
- `priority` (`LOW | MEDIUM | HIGH | CRITICAL`)
- optional `moduleKey`
- optional `actionRoute`
- optional `requiredForGoLive`

Templates share a baseline (Discovery + Workspace setup + Migration +
Integrations + Training + UAT + Go-live + Post-launch) and add a
business-specific block in the **Operations setup** / **Storefront**
phases.

Templates:

- `restaurant`
- `cafe`
- `bar`
- `bakery`
- `catering`
- `meal_prep`
- `ghost_kitchen` (also matched for `MULTI_BRAND`)

If the business type doesn't match a template the first template
(`restaurant`) is used as a sensible default.

## Phase definitions

`PHASE_DEFINITIONS` in `lib/implementation/implementation-types.ts`:

1. Discovery
2. Workspace setup
3. Data migration
4. Integrations
5. Storefront setup
6. Operations setup
7. Training
8. UAT / Testing
9. Go-live
10. Post-launch support

A phase is seeded once per project; `sort_order` is preserved so the
UI can show a stable timeline.
