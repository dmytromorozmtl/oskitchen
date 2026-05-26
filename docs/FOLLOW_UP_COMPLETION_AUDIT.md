# Follow-up completion audit

Audit of gaps after the integration-health / maturity / demo / AvT foundation PR.

## 1. Order detail workflow visibility

| Field | Detail |
|-------|--------|
| **Current** | `buildFoodopsWorkflowView` + Order Detail Overview card (`OrderWorkflowSummaryCard` + `FoodopsWorkflowStepper`). |
| **Intentionally left out** | Server-side PDF/export of the chain; role-specific hiding of fix links beyond default session. |
| **Implement now** | Done — eight-step chain with honest statuses tied to real blockers. |
| **Defer** | Per-station SLA overlays, multilingual copy packs. |
| **Risk** | Low — pure read of existing blocker/lifecycle inputs. |
| **Files** | `services/workflows/foodops-workflow-service.ts`, `components/orders/order-workflow-summary-card.tsx`, `components/orders/foodops-workflow-stepper.tsx`, `services/orders/order-detail-service.ts`, `components/orders/order-detail-panels.tsx`. |
| **Priority** | P1 |

## 2. Platform integration diagnostics parity

| Field | Detail |
|-------|--------|
| **Current** | `/platform/integrations` uses aggregated connections + static honesty layer; `/platform/webhooks` shows aggregate counts + recent sanitized rows; workspace detail shows `resolveAllChannels` tiers for the owner. |
| **Left out** | Replay/retry buttons (no audited server actions yet). |
| **Implement now** | Maturity table + webhook summary + audit `PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED`. |
| **Defer** | Cross-tenant replay, credential rotation UI. |
| **Risk** | Medium — aggregate views must never leak secrets (sanitized errors only). |
| **Files** | `services/platform/platform-integrations-service.ts`, `components/integrations/*`, `app/platform/integrations/page.tsx`, `app/platform/webhooks/page.tsx`, `app/platform/workspaces/[workspaceId]/page.tsx`. |
| **Priority** | P1 |

## 3. Demo scenario data depth

| Field | Detail |
|-------|--------|
| **Current** | Golden scenario contracts + preview lines + `seedGoldenDemoScenario` / `resetGoldenDemoScenario` wrapping `seedDemoWorkspace` / `clearWorkspaceSampleData` + audit trail; UI controls on `/dashboard/demo/scenarios`. |
| **Left out** | Fully synthetic POS hardware, live marketplace keys, per-scenario unique blocker rows beyond what the vertical seed already creates. |
| **Implement now** | Honest seed/reset with preview + production gate `DEMO_MODE_ENABLED`. |
| **Defer** | Per-scenario isolated datasets without touching shared demo engine. |
| **Risk** | High if mis-gated — mitigated with existing demo guards + demo mode flag. |
| **Files** | `lib/demo/*`, `services/demo/*`, `actions/demo-golden-scenario.ts`, `components/demo/golden-demo-scenario-controls.tsx`. |
| **Priority** | P1 |

## 4. AvT report foundation

| Field | Detail |
|-------|--------|
| **Current** | `/dashboard/costing/avt` + `loadAvtReport` + confidence/coverage cards; honesty copy when receiving thin. |
| **Left out** | GL posting, R365-class true-up, ingredient drill-down export. |
| **Implement now** | SKU-level theoretical usage from recipes + sold qty window. |
| **Defer** | Store-level depletion reconciliation UI. |
| **Risk** | Medium — recipe costing assumptions must stay labeled as theoretical. |
| **Files** | `services/costing/avt-report-service.ts`, `components/costing/*`, `app/dashboard/costing/avt/page.tsx`. |
| **Priority** | P1 |

## 5. Business mode aliases vs Prisma enums

| Field | Detail |
|-------|--------|
| **Current** | `lib/business-mode/business-mode-normalization.ts` + Vitest coverage for COMMISSARY→CLOUD_KITCHEN, MANUAL_ONLY→OTHER, labels. |
| **Left out** | Prisma enum migration for COMMISSARY / MANUAL_ONLY. |
| **Implement now** | Normalization helpers + tests. |
| **Defer** | DB-native strategic enum when migration is safe. |
| **Risk** | Low. |
| **Priority** | P0 |

## 6. Inventory shortage blocker

| Field | Detail |
|-------|--------|
| **Current** | Readiness service + Today + Data integrity cards — no `INVENTORY_SHORTAGE` blocker. |
| **Left out** | Automatic order blocker until demand+stock+threshold math ships. |
| **Implement now** | Readiness-only UX. |
| **Defer** | Blocker enum + automation. |
| **Risk** | Low. |
| **Priority** | P2 |

## 7. Marketing pages beyond hero

| Field | Detail |
|-------|--------|
| **Current** | Solutions index redirect, new `cafes` + `multi-brand` slugs, honest integration metadata, solution cards copy cleanup. |
| **Left out** | Full rewrite of every `/product/*` marketing stub (only POS terminal existed); exhaustive pricing copy pass. |
| **Implement now** | Partial expansion where routes already existed + honesty on integrations meta. |
| **Defer** | Dedicated product marketing grid pages. |
| **Risk** | Low copy-only. |
| **Priority** | P2 |

## 8. Integration honesty

| Field | Detail |
|-------|--------|
| **Current** | Platform + workspace maturity tiers remain conservative; marketing integrations page clarifies statuses. |
| **Left out** | Live badges for Toast/Square/etc. |
| **Implement now** | Honest tier copy on platform + solutions cards. |
| **Defer** | Partner-certified launch checklist automation. |
| **Priority** | P0 |

## 9. Platform / workspace parity

| Field | Detail |
|-------|--------|
| **Current** | Workspace detail shows channel maturity snapshot; links document owner dashboard paths. |
| **Left out** | Impersonation jump links (separate permission model). |
| **Implement now** | Integration + demo parity notes in QA doc. |
| **Defer** | Live shadow session. |
| **Priority** | P2 |
