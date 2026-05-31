# Product Mapping data model

Five Prisma models back the workbench. All changes were additive on
top of the existing `ProductMapping` schema, so the legacy
`/dashboard/product-mapping` route, `createProductMappingSuggestion`,
and `updateProductMappingStatus` actions continue to work.

## `ProductMapping` (extended)

| Field | Purpose |
|-------|---------|
| `id` | Primary key (uuid). |
| `userId` | Workspace owner. |
| `brandId` *(new)* | Optional brand scoping for ghost-kitchen multi-brand mappings. |
| `locationId` *(new)* | Optional per-location override. |
| `salesChannelId` *(new)* | Optional channel scoping (e.g. WooCommerce store A vs B). |
| `provider` | Free-text legacy value. Preserved for back-compat. |
| `providerKey` *(new)* | `ProductMappingProvider` enum (normalised). |
| `externalProductId`, `externalVariantId`, `externalTitle`, `externalSku` | Existing fields. |
| `externalVariantTitle` *(new)* | Variant title for Shopify/Woo. |
| `externalCategory` *(new)* | Category hint for matching. |
| `externalRawJson` *(new)* | Original provider payload. |
| `internalProductId` | Selected OS Kitchen product. |
| `internalVariantId` *(new)* | Reserved for future variant-aware matching. |
| `confidence` | Legacy 0..1 numeric score. |
| `confidenceLabel` *(new)* | `ProductMappingConfidence` enum. |
| `confidenceScore` *(new)* | Mirror of `confidence` exposed as decimal. |
| `matchReasonJson` *(new)* | Array of `MatchReason` produced by the engine. |
| `approvedById` *(new)* | `UserProfile.id` of the approver. |
| `approvedAt` *(new)* | When approval happened. |
| `rejectedReason` *(new)* | Required when rejecting. |
| `lastSeenAt` *(new)* | Updated on every `createOrUpdateMapping`. |
| `status` | `ProductMappingStatus` (extended). |

### Indexes (additive)

- `(userId, providerKey)`
- `externalSku`
- `externalProductId`
- `(userId, confidenceLabel)`
- `(userId, salesChannelId)`
- `(userId, brandId)`
- `(userId, locationId)`

## Enums

```
ProductMappingStatus  ←  + UNMAPPED, APPROVED, REJECTED, CONFLICT, ARCHIVED
ProductMappingConfidence  =  EXACT_SKU | EXACT_TITLE | HIGH | MEDIUM | LOW | NONE | MANUAL
ProductMappingProvider    =  SHOPIFY | WOOCOMMERCE | UBER_EATS | UBER_DIRECT | CSV
                              | STOREFRONT | MANUAL | DOORDASH_PLACEHOLDER | CUSTOM
ProductMappingEventType   =  CREATED | SUGGESTED | APPROVED | REJECTED | CHANGED
                              | ARCHIVED | ALIAS_CREATED | CONFLICT_OPENED
                              | CONFLICT_RESOLVED | BULK_APPLIED | MODIFIER_MAPPED | RESYNCED
ProductModifierMappingStatus = UNMAPPED | SUGGESTED | APPROVED | REJECTED | IGNORED
```

## `ProductMappingAlias`

User-defined text aliases. The matching engine consults these in step
4 of the ladder. Active aliases are scoped per-user (optionally per
provider).

## `ProductModifierMapping`

External modifiers (Shopify options, Woo attributes, Uber Eats
modifiers, CSV options) mapped to canonical OS Kitchen modifier keys
(`size`, `protein`, `side`, `spice`, `addon`, `substitution`,
`drink`, `preparation`, `packaging`, `delivery_instruction`).

## `ProductMappingEvent`

Append-only audit log. Every server action that mutates state writes
exactly one event row inside the same transaction as the mutation.

## `ProductMappingImportBatch`

Summary row for catalog syncs or CSV imports. Stores counts of new,
suggested, approved, and conflicting rows; the metadata JSON contains
batch-specific context (batch id, file name, mapping template id).
