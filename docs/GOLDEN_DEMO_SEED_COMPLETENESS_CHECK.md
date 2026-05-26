# Golden demo seed completeness check

## Static contract

- `lib/demo/demo-scenario-requirements.ts` — `mustHave` / `shouldHave` kinds per scenario id.
- `services/demo/demo-scenario-audit-service.ts` — compares `GOLDEN_DEMO_SCENARIOS` plan lines to requirements.
- `scripts/check-demo-scenarios.ts` — prints PASS/WARN/FAIL; **exit 1** on any FAIL.

## Runtime seeding

- Actual database rows still come from `seedDemoWorkspace` / vertical fixtures — this check does **not** validate DB counts (would need a dedicated integration test with a disposable DB).

## Golden plan updates (this pass)

- Catering: added explicit `packing` plan line.
- Multi-brand: added `packing` + `routes` plan lines so `shouldHave` coverage matches narrative.

## Command

```bash
npm run check-demo-scenarios
```
