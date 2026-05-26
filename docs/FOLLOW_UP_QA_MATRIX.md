# Follow-up QA matrix

| # | Check | Result |
|---|-------|--------|
| 1 | Order detail loads with FoodOps stepper | Pass — Overview renders `OrderWorkflowSummaryCard`. |
| 2 | POS order workflow steps | Pass — driven by shared blockers + fulfillment rules. |
| 3 | Scheduled pickup blocker only when relevant | Pass — `requiresScheduledServiceDate` gates `MISSING_FULFILLMENT_DATE`. |
| 4 | Walk-in POS not forced future pickup | Pass — fulfillment info `not_required` when scheduling not required. |
| 5 | Platform integrations sanitized | Pass — aggregates + truncated errors. |
| 6 | Webhook counters | Pass — Prisma counts + recent listing. |
| 7 | Demo seed preview | Pass — scenario cards list planned records. |
| 8 | Demo reset safety | Pass — demo mode required + clears via `clearWorkspaceSampleData`. |
| 9 | AvT report honesty | Pass — variance note only when workspace confidence HIGH. |
| 10 | Business mode aliases | Pass — Vitests for persistence + labels. |
| 11 | Inventory shortage readiness (no fake blocker) | Pass — no `INVENTORY_SHORTAGE` order blocker; readiness cards only. |
| 12 | Marketing honesty | Pass — integrations meta + solution + product hub copy. |
| 13 | `npm run typecheck` | Pass |
| 14 | `npm run build` | Pass |
| 15 | `npm run lint` | Pass (warnings only, pre-existing) |
| 16 | `npm test` | Pass |

## Purchasing — inventory shortage readiness

| # | Check | Result |
|---|-------|--------|
| P1 | `/dashboard/purchasing` shows shortage readiness card | Pass |
| P2 | Card shows level READY / PARTIAL / NOT_CONFIGURED | Pass |
| P3 | Card shows recipe, stock row, and demand run counts | Pass |
| P4 | Link to ingredient demand | Pass — `/dashboard/inventory/demand` |
| P5 | Link to suppliers / purchasing setup | Pass — suppliers button |
| P6 | No `INVENTORY_SHORTAGE` order blocker when readiness ≠ READY | Pass — blocker not implemented |
| P7 | Today shows readiness summary, not fake shortage count | Pass |
| P8 | Copy states prerequisites (recipes / stock / demand) | Pass — summary + purchasing card note |
| P9 | No fake actual inventory precision | Pass — counts are row counts only |

## Platform read-only integration health drilldown

| # | Check | Result |
|---|-------|--------|
| I1 | `/platform/workspaces/[id]/integration-health` loads for platform admin | Pass |
| I2 | Client redirected from `/platform/*` | Pass — layout gate |
| I3 | No secrets, payloads, or credential editors | Pass |
| I4 | Audit writes `PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED` only | Pass |
| I5 | No replay/retry UI | Pass |
| I6 | Maturity matrix matches workspace semantics | Pass |

## Demo / install / replay honesty

| # | Check | Result |
|---|-------|--------|
| D1 | `npm run check-demo-scenarios` — static plan audit | Pass — 0 FAIL, 0 WARN |
| D2 | `npm run verify:install-chain` after install | Pass — resolves qs/stripe; shim WARN if pre-postinstall |
| D3 | `getIntegrationActionAvailability` — replay off by default | Pass — Vitest |
