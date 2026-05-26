# Demo seed service — golden scenarios

## Artifacts

- Contracts: `lib/demo/demo-data-contract.ts`
- Catalog: `lib/demo/golden-demo-scenarios.ts`
- Services: `services/demo/demo-seed-service.ts`, `services/demo/demo-reset-service.ts`, `services/demo/demo-scenario-service.ts`
- Actions: `actions/demo-golden-scenario.ts` (`"use server"`)
- UI: `components/demo/golden-demo-scenario-controls.tsx` on `/dashboard/demo/scenarios`

## Safety

- `areDemoWorkspaceMutationsAllowed()` + `DEMO_MODE_ENABLED` on production hosts.
- Reset clears demo operational data via `clearWorkspaceSampleData` and turns demo mode off.
- Audit actions: `DEMO_GOLDEN_SCENARIO_SEEDED`, `DEMO_GOLDEN_SCENARIO_RESET`.
- Postinstall shim `scripts/ensure-object-inspect-shim.cjs` restores `object-inspect/util.inspect.js` for broken hoists (Stripe/qs) — required for `next build` on some Node installs.

## Honesty

Seeding reuses the existing `seedDemoWorkspace` vertical datasets — it does not mint live marketplace credentials or simulated payment capture beyond current demo architecture.
