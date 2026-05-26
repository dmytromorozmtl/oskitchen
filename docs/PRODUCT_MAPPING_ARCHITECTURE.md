# Product Mapping Workbench — architecture

```
                 ┌─────────────────────────────────────────────────────┐
                 │                Product Mapping Workbench            │
                 │             (/dashboard/product-mapping/*)          │
                 └─────────────────────────────────────────────────────┘
                                       ▲
                                       │
   actions/product-mapping.ts          │            actions/implementation.ts
   (Zod validation, capability check)  │            (legacy back-compat form)
                                       │
                                       ▼
   services/product-mapping/product-mapping-service.ts
       • createOrUpdateMapping (runs matching engine, never auto-approves below HIGH)
       • approveMapping / rejectMapping (transactional + audit)
       • bulkApproveSafe (only EXACT_SKU / EXACT_TITLE / HIGH)
       • createAlias, upsertModifierMapping
       • listMappings, listAliases, listEvents, listImportBatches
       • workbenchKpis, detectConflicts

   services/product-mapping/matching-service.ts
       • loadCandidates(userId, brandId?)
       • loadAliasIndex(userId, provider?)
       • loadApprovedExternalIndex(userId, provider?)
       • runMatch(input) → MatchOutcome

   lib/product-mapping/
       • provider-types.ts    (PRODUCT_MAPPING_PROVIDER + normalize)
       • mapping-status.ts    (status labels + tones + helpers)
       • matching-confidence.ts (label/score/rank, BULK_APPROVABLE)
       • matching-engine.ts   (normalize, deterministic ladder)
       • modifier-mapping.ts  (canonical keys + alias dictionary)
       • mapping-permissions.ts (canUseProductMapping, super admin bypass)
```

## Layers

1. **lib** is pure: types, labels, deterministic functions, no I/O.
2. **services** load Prisma rows and produce snapshots used by both
   the UI and the actions. They never write directly without going
   through a transaction that also writes a `ProductMappingEvent`.
3. **actions** are the only authenticated entry points. They:
   - Authenticate via `requireSessionUser` + `requireUserProfile`.
   - Authorize via `canUseProductMapping(scope, capability)` with
     superadmin email bypass (`workspace.moroz@gmail.com`).
   - Validate inputs with Zod.
   - Call into the service.
   - Revalidate `/dashboard/product-mapping`.
4. **UI** (`app/dashboard/product-mapping/*`) renders read snapshots
   from the service and exposes interactive client components for
   row-level, bulk, alias, and modifier actions.

## Data flow — typical mapping

```
Sales Channel webhook ──┐
CSV import ─────────────┤
                        ▼
              ExternalProduct row (Sales Channels)
                        │
                        ▼ (operator opens workbench)
   createOrUpdateMapping(externalTitle, sku, externalProductId)
                        ▼
   matching-service.runMatch
        loadCandidates ─→ menu items
        loadAliasIndex ─→ ProductMappingAlias
        loadApprovedExternalIndex ─→ approved ProductMapping rows
                        ▼
   matching-engine.matchExternalToInternal
        EXACT_SKU > EXACT_EXTERNAL_ID > EXACT_TITLE > ALIAS > similarity
                        ▼
   ProductMapping upsert
        + ProductMappingEvent (SUGGESTED)
                        ▼
   Operator reviews → APPROVED / REJECTED / NEEDS_REVIEW
        + ProductMappingEvent (APPROVED|REJECTED|CHANGED)
                        ▼
   Order Hub conflict resolves (next channel record validation)
```

## Module boundaries

- **Sales Channels** owns provider connections + catalog sync. The
  workbench is read-only towards `IntegrationConnection.lastSyncAt`,
  `IntegrationConnection.lastError`, and `ExternalProduct`.
- **Order Hub** reads `ChannelConflict` rows of type
  `missing_product_mapping`. The workbench links operators to the
  Order Hub but never reprocesses orders silently.
- **Import Center** owns CSV uploads. It already has a
  `PRODUCT_MAPPINGS` template that operators can use to upload many
  mappings at once. The workbench links to it (`Import external
  products` CTA).
- **Menu Items** is the canonical source of internal products. The
  workbench resolves mappings against `Product` (filtered by
  `menu.userId`).
