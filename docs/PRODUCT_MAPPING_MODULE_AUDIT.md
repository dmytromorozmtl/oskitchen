# Product Mapping module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/product-mapping`,
`actions/implementation.ts::createProductMappingSuggestion /
updateProductMappingStatus`, `lib/import-center.ts::confidenceScore`,
`/dashboard/sales-channels/mapping`, `lib/channels/import-staging.ts`,
`ChannelImportRecord` + `ChannelConflict` flow, `ExternalProduct`,
`IntegrationConnection`, and the `ProductMapping` Prisma model.

## TL;DR

`/dashboard/product-mapping` is a single-page workbench with one
add-form and a flat list of `ProductMapping` rows. Suggestions are
computed by a token-overlap scorer in `lib/import-center.ts`
(`confidenceScore`) when the operator submits a row. Status can be
toggled between `SUGGESTED / CONFIRMED / NEEDS_REVIEW / IGNORED` and
an internal product can be picked.

A separate `ExternalProduct` model is populated by the Sales Channels
pipeline (`ChannelImportBatch` → `ChannelImportRecord` → conflict
`missing_product_mapping`). These two halves are **disconnected**:

- The workbench operates on `ProductMapping` rows.
- The sales channel pipeline writes `ExternalProduct.mappedProductId`
  on the channel-side model.
- There is no bridge that turns an `ExternalProduct` into a
  `ProductMapping`, no aliases, no modifier mapping, no audit, no
  conflict view, no bulk actions, no provider scoping, and no batch
  history.

The workbench needs to become the **single source of truth** for
external → internal item bindings, with the channel pipeline writing
into it and Order Hub reading from it.

## Findings

| #  | Area | Current state | Why it is limiting | Workflow affected | Recommended fix | Pri |
|----|------|---------------|--------------------|-------------------|-----------------|-----|
| 1  | Status enum | `SUGGESTED / CONFIRMED / IGNORED / NEEDS_REVIEW` | Missing `UNMAPPED`, `APPROVED`, `REJECTED`, `CONFLICT`, `ARCHIVED` | Cannot model lifecycle from “discovered” → “approved” → “archived” | Extend `ProductMappingStatus` (additive) | P1 |
| 2  | Confidence | Decimal 0..1 with no labels | Cannot drive “bulk approve high confidence only” without re-deriving labels | Bulk mapping, suggestions view | Persist `ProductMappingConfidence` enum alongside score | P1 |
| 3  | Provider scoping | Free-text `provider` varchar | Inconsistent with `IntegrationProvider` and breaks join with `IntegrationConnection` | Sales channel health, conflict triage | Keep varchar (for `CSV / MANUAL / STOREFRONT`) but persist provider key in a normalised set | P2 |
| 4  | Brand / location / channel scoping | None | Same external SKU across brands cannot map independently | Ghost kitchens, multi-brand | Add `brandId`, `locationId`, `salesChannelId` (nullable) | P1 |
| 5  | Variants | `externalVariantId` only | No variant title or variant link to internal product variants | Shopify variants, Woo variations | Add `externalVariantTitle`; keep `internalVariantId` (nullable) for future | P1 |
| 6  | Modifiers | None | Cannot map Uber Eats modifiers, Shopify options, Woo attributes | Marketplace orders | Add `ProductModifierMapping` model | P1 |
| 7  | Aliases | None | Cannot remember “Bangkok Noodles” → “Chicken Bangkok Peanut Noodles” | Future imports re-trigger review | Add `ProductMappingAlias` model | P1 |
| 8  | External catalog bridge | `ExternalProduct` + `ProductMapping` are disconnected | Channel mapping page must double-count | Sales channels mapping page is a stub | Sync `ExternalProduct → ProductMapping` and store `externalRawJson` | P1 |
| 9  | Conflict view | None | Conflicts visible only in `ChannelConflict` table | Order import blocking | Surface conflicts in the workbench Conflicts tab | P0 |
| 10 | Bulk actions | None | Operators must approve one row at a time | Onboarding catalogs with 200+ items | Implement bulk approve (exact / high), bulk ignore, bulk archive | P1 |
| 11 | Order Hub link | None | Operators don't know which orders are blocked by a missing mapping | Order import is silently stuck | Add “Blocked orders” count + jump link per unmapped row | P0 |
| 12 | Empty state | None | First-time visitors only see the add-form | UX friction | Explicit empty states for No mappings, No unmapped, No suggestions | P2 |
| 13 | Match reasons | None | No explanation of *why* a suggestion was scored | Operator can't trust the engine | Persist `matchReasonJson` (`exactSku / exactTitle / alias / tokenOverlap / category`) | P1 |
| 14 | Audit | None | Cannot tell who approved/changed a mapping | Compliance, debugging | Add `ProductMappingEvent` model | P1 |
| 15 | Import batches | None | Cannot answer “what did the last Shopify sync introduce?” | Channel onboarding | Add `ProductMappingImportBatch` | P2 |
| 16 | Auto-approval gate | `confidence >= 0.8` writes `SUGGESTED`, not `APPROVED` (good) — but no per-confidence rule | Safe today, but no policy for bulk approval | Bulk mapping | Encode “only EXACT_SKU / EXACT_TITLE / HIGH may bulk approve” | P1 |
| 17 | Confidence threshold leak | `if best?.score >= 0.5` writes `internalProductId` | Low-confidence rows become “suggested with target” which can be approved by accident | Mapping safety | Only attach target when confidence ≥ HIGH; otherwise keep `internalProductId = null` and store candidate in `matchReasonJson` | P0 |
| 18 | Permissions | `requireSessionUser` only | Anyone signed-in can approve | Mapping safety | `canUseProductMapping(scope, capability)` matrix | P0 |
| 19 | Sales channel mapping page | Counts only `ExternalProduct.mappedProductId = null` | Doesn't reflect approved/rejected/conflict states | Sales channel health | Read from `ProductMapping` + show `unmapped / suggested / approved / conflicts` | P2 |
| 20 | Menu item integration | None | Menu items don't show their external bindings | Catalog browsing | Add a small panel to Menu Item detail listing approved mappings | P2 |

## Priority legend

- **P0** — Mapping correctness / order-import safety.
- **P1** — High integration value.
- **P2** — UX.
- **P3** — Future.

## Safety contract

1. **No silent overwrite.** Approved mappings can only be changed
   through an explicit edit form with a confirmation flag.
2. **No auto-approval for low confidence.** Bulk approve operates
   only on `EXACT_SKU / EXACT_TITLE / HIGH` rows; medium and below
   require per-row review.
3. **No fake provider sync.** Catalog sync still happens in the
   Sales Channels module; the workbench only re-reads the bridge
   table.
4. **Audit trail.** Every status change, manual mapping, or bulk
   action writes a `ProductMappingEvent` row.
5. **Order safety.** Approving a mapping unblocks
   `ChannelImportRecord.NEEDS_MAPPING` rows for orders that
   reference the same external product, but only if the operator
   explicitly chose “re-process blocked orders”. (Default behaviour
   leaves the record alone so the operator can re-validate.)
6. **Workspace scoping.** Every read and write requires
   `userId === requireSessionUser().id` (with the
   `workspace.moroz@gmail.com` superadmin bypass preserved).
7. **No secrets.** The workbench never reads or surfaces
   `IntegrationConnection` tokens or webhook secrets.
8. **Don't delete history.** Conflict resolution, bulk archive, and
   reject all keep the row and event log; nothing is hard-deleted.
