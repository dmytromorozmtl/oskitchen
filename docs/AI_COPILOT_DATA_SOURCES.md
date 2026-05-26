# Copilot data sources

`lib/ai/copilot-sources.ts` defines the registry of operational data
the copilot may summarise. Each source carries:

- `key` — stable identifier.
- `label`, `description` — UI strings.
- `allowedRoles` — roles permitted to read this source via copilot.
- `piiLevel` — `NONE` | `LOW` | `MEDIUM` | `HIGH`.
- `maxRows` — hard cap before summarisation.
- `staleDataWarning` — optional disclaimer surfaced in `/sources`.
- `recommendedRedaction` — the level applied before any AI call.

## Catalogue

| Key | PII | Max rows | Allowed roles |
|-----|-----|---------|---------------|
| `orders` | MEDIUM | 50 | owner, manager, admin, accountant, sales, kitchen_lead |
| `channels` | LOW | 25 | owner, manager, admin |
| `webhooks` | LOW | 25 | owner, manager, admin |
| `production` | NONE | 50 | owner, manager, admin, kitchen_lead, kitchen |
| `kitchen` | NONE | 100 | owner, manager, admin, kitchen_lead, kitchen |
| `packing` | NONE | 50 | owner, manager, admin, kitchen_lead, packer, packing |
| `packing_verification` | NONE | 50 | owner, manager, admin, kitchen_lead, packer, packing |
| `routes` | MEDIUM | 50 | owner, manager, admin, driver, dispatcher |
| `tasks` | LOW | 100 | owner, manager, admin, kitchen_lead, kitchen, sales |
| `customers` | HIGH | 25 | owner, manager, admin, sales |
| `meal_plans` | MEDIUM | 50 | owner, manager, admin, sales |
| `catering` | MEDIUM | 25 | owner, manager, admin, sales |
| `inventory_demand` | NONE | 50 | owner, manager, admin, kitchen_lead |
| `purchasing` | LOW | 25 | owner, manager, admin |
| `costing` | NONE | 50 | owner, manager, admin, accountant |
| `analytics` | LOW | 50 | owner, manager, admin, accountant, sales |
| `forecast` | NONE | 25 | owner, manager, admin |
| `audit` | LOW | 25 | owner, manager, admin |

## How sources are used

For the current MVP the copilot summarises via
`buildDeterministicSnapshot` → `loadExecutiveOverview`. That call
already aggregates the listed sources into counts (no individual
rows) before they reach the bullet summary. As we add per-source
"deep dive" tools we plug them into the same registry to enforce role
and PII gating.

## Recommended redaction

Defaults:

- HIGH PII (`customers`) — `PII_REDACTED`.
- MEDIUM PII (`orders`, `routes`, `meal_plans`, `catering`) —
  `PII_REDACTED`.
- LOW / NONE — `OPERATIONAL_SUMMARY`.

The workspace-wide `CopilotSettings.redactionLevel` may *raise*, never
*lower*, these defaults via `stricterRedaction(a, b)`.
