# Product Mapping Workbench — ready report

**Date:** 2026-05-11
**Status:** typecheck + build pass on the canonical workspace.

## What changed

- **Audit** of the previous module surfaced 20 limitations (P0–P3).
  See `docs/PRODUCT_MAPPING_MODULE_AUDIT.md`.
- **Prisma schema** was extended additively. New enums
  (`ProductMappingConfidence`, `ProductMappingProvider`,
  `ProductMappingEventType`, `ProductModifierMappingStatus`) and new
  status values (`UNMAPPED`, `APPROVED`, `REJECTED`, `CONFLICT`,
  `ARCHIVED`). `ProductMapping` gained scoping (brand/location/sales
  channel), audit fields, raw payload, match reasons, confidence
  label, last-seen, and approver. Three new tables:
  `product_mapping_aliases`, `product_modifier_mappings`,
  `product_mapping_events`, `product_mapping_import_batches`.
  Migration `20260521150000_product_mapping_workbench` applied to the
  primary database.
- **lib/product-mapping/** — six pure modules: provider types,
  status, confidence, matching engine, modifier mapping,
  permissions. The matching engine is deterministic with a 7-step
  ladder and only attaches a candidate when confidence ≥ HIGH.
- **services/product-mapping/** — two services. The matching
  service loads candidates, alias index, and approved external
  index. The product-mapping service handles CRUD, approval, bulk
  ops, alias + modifier mutations, KPI snapshot, and conflict
  detection. Every mutation is wrapped in a transaction with a
  `ProductMappingEvent` row.
- **actions/product-mapping.ts** — typed server actions with Zod
  validation, capability checks, and `requireSessionUser` +
  `requireUserProfile` gates. Superadmin email bypass is preserved.
- **UI** — 12-tab workbench under `/dashboard/product-mapping`:
  overview, unmapped queue, suggestions, approved, conflicts, bulk,
  modifiers, aliases, batches, sync health, activity, settings.
  Legacy add-form is preserved and powers the same matching flow.
- **Integrations**:
  - Order Hub shows a "blocked by missing product mapping" banner
    that jumps to the workbench unmapped queue.
  - Sales Channels mapping page gained an "Approved mappings" tile
    and an additional grouped query.
  - The Import Center already supports `PRODUCT_MAPPINGS`
    templates; the workbench links to the upload wizard.

## Mapping model

`ProductMapping` (extended), `ProductMappingAlias`,
`ProductModifierMapping`, `ProductMappingEvent`,
`ProductMappingImportBatch`. Indexes on userId+providerKey,
externalSku, externalProductId, userId+confidenceLabel,
userId+salesChannelId / brandId / locationId.

## Workbench UI

Subnav with twelve tabs, KPI tiles (unmapped, suggested, needs
review, approved, conflicts, blocked order lines, providers
connected, last sync), bulk preview with confidence gating,
modifier form with canonical key dropdown, alias dictionary, audit
log, settings.

## Matching engine

`lib/product-mapping/matching-engine.ts`. Ladder: exact SKU → exact
previously-approved external ID → exact normalised title → alias →
token similarity → category+title similarity → no match. Confidence
labels are assigned deterministically; `shouldAttachCandidate`
gatekeeps the auto-attach decision.

## Confidence scoring

`EXACT_SKU | EXACT_TITLE | HIGH | MEDIUM | LOW | NONE | MANUAL`,
ordered by `CONFIDENCE_RANK`. Bulk approve operates only on
`EXACT_SKU`, `EXACT_TITLE`, and `HIGH`.

## Bulk mapping

`bulkApproveSafe` enforces eligibility per row. Bulk archive and
bulk ignore are also available. The UI table disables checkboxes
for ineligible rows; the service rejects ineligible rows even if
the UI is bypassed.

## Modifier mapping

10 canonical keys with an alias dictionary. `ProductModifierMapping`
is `1..*` per `ProductMapping`. The modifiers tab on the workbench
adds, edits, and lists modifier rows.

## Conflict resolution

Explicit conflicts (status=CONFLICT), duplicate KitchenOS target,
duplicate external product, Order Hub blocks. Per-row actions:
reject, archive, change target.

## Order Hub integration

Banner + KPI tile fed by `ChannelConflict.conflictType ==
"missing_product_mapping"`. No automatic order reprocessing —
operators reprocess in the Order Hub once they've approved the
mapping.

## Sales Channels integration

Sync health tab reads `IntegrationConnection` and groups
`ProductMapping` by `providerKey + status`. The workbench never
calls provider APIs.

## Import Center integration

Existing `PRODUCT_MAPPINGS` template. Workbench links to the upload
wizard with the type pre-selected. No silent imports.

## Permissions

`canUseProductMapping(scope, capability)` with capability set:
view / create / approve / reject / bulk / edit / archive / alias /
modifier / import / audit. Superadmin email
`workspace.moroz@gmail.com` bypasses all checks.

## Remaining limitations

- The `PRODUCT_MAPPINGS` import commit writer is not wired into
  `services/import-center/import-center-service.ts` yet — uploads
  currently stop at preview. Mappings still flow through manual
  entry, Sales Channels sync, and the workbench.
- Conflict UI offers reject/archive but not split/merge wizards yet
  (P2).
- Variant-aware matching is reserved (`internalVariantId` exists in
  the schema but no UI yet).
- Modifier suggestion is server-side only; client-side preview is
  P3.

## Next recommendations

1. Wire the Import Center commit writer for `PRODUCT_MAPPINGS` so
   bulk CSV uploads land directly in the workbench.
2. Add a "Reprocess blocked orders" affordance to approved
   mappings, gated behind an explicit confirmation.
3. Add per-channel and per-brand filters to every workbench tab.
4. Replace the legacy `provider` varchar with `providerKey` once
   all consumers have been migrated.
5. Add Playwright coverage for the matching engine and the bulk
   eligibility rule.

## Verification

- `npm run typecheck` ✅
- `npm run build` ✅
- Prisma migration applied ✅
