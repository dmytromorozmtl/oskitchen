# Prisma schema optimization audit — OS Kitchen

**Version:** 1.0 · **June 2026**  
**Schema:** `prisma/schema.prisma`  
**Automated audit:** `tsx scripts/audit-prisma-performance.ts --write` → `artifacts/prisma-performance-audit.json`

Static census and optimization backlog for a **399-model** schema. This doc does not drop tables — it prioritizes consolidation, index fixes, and query hygiene before any destructive migration.

---

## Executive summary

| Metric | Count | Risk |
|--------|------:|------|
| Prisma models | **399** | High cognitive load; codegen + migrate time |
| Enums | **292** | Duplicated status vocabularies across domains |
| `@@index` declarations | **1,062** | Good FK coverage; some tenant indexes missing |
| Migration directories | **147** (+1 untracked marketplace core) | Long deploy history |
| Workspace-scoped models | **237** | Tenant isolation mostly complete |
| Models with **zero** `prisma.*` hits in `app/`, `services/`, `actions/`, `lib/` | **43** | Likely dead schema or UI-not-wired-yet |
| N+1 loop signals (heuristic) | **100** | Review batching in hot services |
| Unbounded `findMany` (heuristic) | **150** | OOM risk on large tenants |

**Automated overall:** `NEEDS_ATTENTION` (from `prisma-performance-audit-v1`, 2026-06-02)

---

## How to re-run audits

```bash
# Performance: indexes, N+1 heuristics, unbounded findMany, soft-delete coverage
tsx scripts/audit-prisma-performance.ts
tsx scripts/audit-prisma-performance.ts --write

# Workspace tenant field posture
tsx scripts/audit-workspace-id-migration.ts   # if present in package scripts

# Manual model usage census (Task 76 artifact)
tsx scripts/audit-prisma-model-usage.ts --write
# or
npm run audit:prisma-models
```

Regenerate this doc's **zero-reference** table after major feature merges.

---

## Methodology — unused model detection

Scanned `app/`, `services/`, `actions/`, `lib/` for:

- `prisma.{camelCaseModel}.`
- `prisma.{camelCaseModel}(`
- `tx.{camelCaseModel}.` / `db.{camelCaseModel}.`

**Caveats (do not drop without human review):**

- Raw SQL (`$queryRaw`) won't match model names
- Cron-only or seed-only usage in `scripts/` / `prisma/` excluded from runtime scan
- New UI may ship before services land (floor plan, implementation waves)
- Tests-only usage not counted in runtime roots

**Classification:**

| Tier | Definition | Action |
|------|------------|--------|
| **A — Orphan** | Zero runtime refs; no nav/route dependency | Candidate for deprecation doc + later drop |
| **B — Scaffold** | Zero refs; dashboard route or migration exists | Wire services or mark PLACEHOLDER in nav |
| **C — Low traffic** | 1–2 refs; beta / pilot only | Monitor; avoid new features until consolidated |

---

## Tier A — zero runtime references (43 models)

No `prisma.*` accessor found in runtime roots (2026-06-02 scan):

| Domain | Models |
|--------|--------|
| **Automation** | `AutomationAction`, `AutomationTrigger` |
| **Catering / ops** | `CateringQuotePackage`, `CommissaryTransferLine`, `OperationsChecklistItem`, `FoodSafetyChecklistItem` |
| **Cron evidence** | `CronExecutionEvent`, `CronExecutionHeartbeat` |
| **CRM / customer** | `CustomerAddress`, `CustomerMergeCandidate`, `InternalNote` |
| **Floor plan** | `FloorPlan`, `FloorPlanSection`, `FloorPlanTable` |
| **Implementation** | `ImplementationSignoff`, `ImplementationStakeholder`, `ImplementationWave` |
| **Import** | `DataTemplate`, `ImportMappingTemplate`, `ImportRowError`, `StagedOrderImport` |
| **Kitchen tasks** | `KitchenTaskDependency`, `KitchenTaskTemplate` |
| **Channels** | `ChannelRetryAttempt`, `ChannelSetupProgress` |
| **Inventory / production** | `IngredientLot`, `PackagingItem`, `ProductionStagePreset`, `ProductionTemplate` |
| **Org / POS** | `OrganizationMember`, `POSTerminal` |
| **Partner** | `PartnerCommissionPlaceholder`, `PartnerReferral` |
| **Playbooks** | `PlaybookStep` |
| **Storefront** | `StorefrontCustomerSession`, `StorefrontOrderItem`, `StorefrontProductMeta`, `StorefrontPushSubscription`, `StorefrontTheme` |
| **Support** | `SupportMacro`, `SupportSavedView` |
| **Training** | `TrainingIncidentDrill` |
| **UX** | `UserTourState` |

**Note:** `AutomationRule` / `AutomationExecution` *are* referenced — only normalized child tables appear orphaned. Consider inlining or wiring CRUD before deleting.

---

## Tier B — duplication & parallel domains (keep, but document)

These are **intentional parallel models** — not immediate merge candidates:

### Order spine (4 surfaces)

| Model | Role | Service entry |
|-------|------|---------------|
| `Order` | Kitchen POS / internal spine | `services/orders/*` |
| `ExternalOrder` | Marketplace / integration ingest | Channel normalizers |
| `StorefrontOrder` | Public `/s/[slug]` checkout | `services/storefront/*` |
| `MarketplacePurchaseOrder` | B2B marketplace buyer → vendor | `services/marketplace/*` |

**Do not collapse** without a unified order event model RFC. Short-term: shared DTO mappers in `lib/orders/` (partially exists).

### Purchase orders (2 domains)

| Model | Role |
|-------|------|
| `PurchaseOrder` + `PurchaseOrderLine` | AI purchasing / executive metrics (`services/ai/ai-purchasing-orders.ts`) |
| `MarketplacePurchaseOrder` + `MarketplacePOLineItem` | HoReCa B2B marketplace checkout |

Names collide conceptually — use **Marketplace PO** vs **Inventory PO** in docs and UI labels.

### Storefront cluster (46 models)

Largest prefix group. Several production-layer tables from migration `20260207140000_storefront_production_layer` lack admin CRUD (`docs/STOREFRONT_FINAL_AUDIT.md` § dead schema surface). Tier A storefront rows above are highest prune candidates **after** storefront audit sign-off.

### Webhook / ingress (6+ models)

`WebhookEvent`, `WebhookIngressDedupe`, channel-specific logs — overlap with `IntegrationConnection` health. Consolidate **read paths** in Integration Health UI before schema merge.

### Marketplace core (13 models, June 2026)

`Vendor`, `VendorProduct`, `MarketplaceProductCategory`, `MarketplaceProductVariant`, `MarketplaceVolumePrice`, `MarketplacePurchaseOrder`, `MarketplacePOLineItem`, `MarketplaceRecurringOrder`, `MarketplaceCart`, `MarketplaceVendorReview`, `MarketplaceDispute`, `VendorTransaction`, `VendorMessage`

Migration `prisma/migrations/20260602133000_marketplace_core/` was **untracked** at June 2 audit — apply per [`migration-deployment-process.md`](./migration-deployment-process.md) before treating models as live.

---

## Tier C — low reference count (76 models, ≤2 hits)

Examples (pilot / beta / single script):

`ProductionStagePreset`, `WebhookIngressDedupe`, `BetaApplication`, `StorefrontGiftCardRedemption`, `KitchenTaskComment`, `SupplierInvoiceLine`, …

**Action:** grep before extending; prefer extending a hot model over adding columns to orphan tables.

---

## Index & tenant gaps

From `scripts/audit-prisma-performance.ts` (2026-06-02):

**Missing tenant index on user-scoped tables (sample):**

`AuditRetentionPolicy`, `PartnerRevenue`, `StorefrontCampaign`, `StorefrontInventoryItem`, `StorefrontMenuSchedule`, `StorefrontPage`, `StorefrontReservation`, `StorefrontTeamInviteEvent`, `StorefrontUpsellRule`, `StorefrontWaitlistEntry`, `UserTourState`, `WorkspaceSsoSettings`

**Marketplace tables flagged:** `MarketplaceCart`, `MarketplaceVendorReview` — add `@@index([workspaceId])` when marketplace goes LIVE.

---

## Query hygiene backlog

| Issue | Count | Fix |
|-------|------:|-----|
| N+1 (`for await` + prisma in loop) | 100 | Batch `findMany` + `Map` by id |
| Unbounded `findMany` (no `take`) | 150 | `clampPageSize` from `lib/db/pagination.ts` |
| Soft-delete on candidates | 0% coverage | See `docs/soft-delete-standard.md`; start with `Order`, `Product`, `KitchenCustomer` |

**Hot paths called out in [`DATABASE_OPTIMIZATION.md`](./DATABASE_OPTIMIZATION.md):**

- Today Command Center / home overview — O(n) production task scans
- Marketplace vendor dashboards — verify `include` depth (Task 82 N+1 script)

---

## Enum sprawl (292 enums)

Common pattern: per-domain `*Status`, `*Type`, `*Phase` enums with overlapping values (`DRAFT`, `ACTIVE`, `ARCHIVED` repeated 20+ times).

**Optimization (P2, no migration yet):**

1. Inventory top 30 enums by name similarity
2. Map to shared `LifecycleStatus` / `ApprovalStatus` where values align
3. Keep provider-specific enums (Stripe, Shopify) isolated

Do **not** bulk-merge enums without Postgres migration + backfill plan.

---

## Recommended priority queue

| P | Item | Owner | Effort |
|---|------|-------|--------|
| P0 | Apply `20260602133000_marketplace_core` to staging → prod | Ops | S |
| P0 | Cap unbounded `findMany` in `services/marketplace/*` and order lists | Eng | M |
| P1 | Add missing `workspaceId` indexes on marketplace + storefront hot tables | Eng | S |
| P1 | Wire or deprecate Tier A storefront orphans (`StorefrontOrderItem`, …) | Eng | M |
| P1 | Floor plan models — wire to `/dashboard/tables` or hide nav | Product | M |
| P2 | Automation child tables — merge into JSON on `AutomationRule` or implement CRUD | Eng | L |
| P2 | Enum consolidation RFC | Architecture | L |
| P2 | Task 76 — formal unused-model drop list (`artifacts/prisma-unused-models.json`) | Eng | **Done** |

---

## Related docs & tasks

| Resource | Topic |
|----------|-------|
| [`DATABASE_OPTIMIZATION.md`](./DATABASE_OPTIMIZATION.md) | Pagination, transactions, dashboard hot paths |
| [`PERFORMANCE_QUERY_OPTIMIZATION_AUDIT.md`](./PERFORMANCE_QUERY_OPTIMIZATION_AUDIT.md) | EXPLAIN ANALYZE, staging DB tracing |
| [`migration-deployment-process.md`](./migration-deployment-process.md) | Safe migration rollout |
| [`bundle-analysis.md`](./bundle-analysis.md) | Client bundle (separate from DB) |
| Task 76 | `artifacts/prisma-unused-models.json` — executable unused model list |
| Task 82 | N+1 detection script for marketplace |
| Task 38 | Marketplace migration regression test |

---

## Sales-safe language

- **OK:** "Broad schema supports multi-vertical roadmap; production paths use a focused subset."
- **NOT OK:** "Every Prisma model is fully productized" — 43 models have no runtime accessor today.

---

## Task 76 execution (2026-06-02)

**Command:** `npm run audit:prisma-models`  
**Artifact:** `artifacts/prisma-unused-models.json`

| Metric | Count |
|--------|------:|
| Total models | 399 |
| Tier A — zero runtime refs | 43 |
| Tier C — ≤2 runtime refs | 89 |
| Active (>2 runtime refs) | 267 |
| Phase-1 drop review (no script/test refs) | 42 |
| Storefront orphans (phase-2 sign-off) | 5 |

**Overall:** ATTENTION — schema breadth exceeds wired runtime surface; use artifact `recommendedAction` per model before any DROP migration.
